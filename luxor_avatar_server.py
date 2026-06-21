#!/usr/bin/env python3
"""
Luxor Avatar Server v2.0 — Lookbook Mode
Instead of AI-generated avatars, this creates a polished outfit moodboard
from the actual clothing item photos. Useful as a visual preview when
AI credits are exhausted.

Run:  python3 luxor_avatar_server.py [--port 8765]
"""

import argparse
import base64
import io
import json
import os
import sys
import uuid
from io import BytesIO
from pathlib import Path
from urllib.parse import urlparse

import requests
from flask import Flask, jsonify, request, send_from_directory
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps

app = Flask(__name__)

# ── Config ──
HOST = "0.0.0.0"
PORT = 8765
OUTPUT_DIR = Path("/tmp/luxor-avatars")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
FONT_PATH = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

# ── CORS ──
@app.after_request
def add_cors(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "authorization, x-client-info, apikey, content-type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response

@app.route("/", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "luxor-avatar-server", "version": "2.0.0", "mode": "lookbook"})

# ── Generate Lookbook / Composite Avatar ──
@app.route("/generate-avatar", methods=["POST", "OPTIONS"])
@app.route("/generate-lookbook", methods=["POST", "OPTIONS"])
def generate_avatar():
    if request.method == "OPTIONS":
        return jsonify({"ok": True})

    try:
        body = request.get_json(force=True)
        item_urls = body.get("itemUrls", [])
        gender = body.get("gender", "other")
        occasion = body.get("occasion", "")

        if not isinstance(item_urls, list) or len(item_urls) == 0:
            return jsonify({"error": "Select at least one piece with a photo."}), 400
        if len(item_urls) > 8:
            return jsonify({"error": "Pick up to 8 pieces per avatar."}), 400

        valid_urls = [u for u in item_urls if isinstance(u, str) and (u.startswith("http") or u.startswith("data:"))]
        if len(valid_urls) == 0:
            return jsonify({"error": "Selected pieces are missing photos."}), 400

        print(f"[lookbook] Compositing {len(valid_urls)} items (gender={gender}, occasion={occasion})")

        # Download all images
        images = []
        failed = 0
        for url in valid_urls:
            img = _download_image(url)
            if img:
                images.append(img)
            else:
                failed += 1

        if len(images) == 0:
            return jsonify({"error": "Could not load any item photos."}), 400
        if failed > 0:
            print(f"[lookbook] {failed}/{len(valid_urls)} items failed to download, continuing with {len(images)}")

        # Build the lookbook composite
        avatar_data = _build_lookbook(images, gender, occasion)
        avatar_b64 = base64.b64encode(avatar_data).decode("utf-8")
        data_url = f"data:image/png;base64,{avatar_b64}"

        # Save to disk
        filename = f"lookbook_{uuid.uuid4().hex[:12]}.png"
        filepath = OUTPUT_DIR / filename
        with open(filepath, "wb") as f:
            f.write(avatar_data)

        print(f"[lookbook] Saved → {filepath}")
        return jsonify({"avatarUrl": data_url, "lookbookUrl": data_url})

    except Exception as e:
        print(f"[lookbook] Error: {e}", file=sys.stderr)
        return jsonify({"error": str(e)}), 500

@app.route("/avatars/<filename>")
def serve_avatar(filename):
    return send_from_directory(str(OUTPUT_DIR), filename)

# ── Image helpers ──

def _download_image(url: str) -> Image.Image | None:
    try:
        if url.startswith("data:"):
            _, encoded = url.split(",", 1)
            data = base64.b64decode(encoded)
            return Image.open(BytesIO(data)).convert("RGBA")
        else:
            resp = requests.get(url, timeout=30, headers={"User-Agent": "LuxorAvatar/2.0"})
            resp.raise_for_status()
            return Image.open(BytesIO(resp.content)).convert("RGBA")
    except Exception as e:
        print(f"[lookbook] Download failed for {url[:60]}...: {e}", file=sys.stderr)
        return None

def _build_lookbook(images: list[Image.Image], gender: str, occasion: str) -> bytes:
    """
    Creates a polished lookbook / outfit moodboard from the actual item photos.
    
    Style: editorial fashion flat-lay on a warm dark background
    with gold accents, item labels, and a cohesive editorial feel.
    """
    W, H = 1080, 1350  # 4:5 ratio (Instagram portrait)

    canvas = Image.new("RGBA", (W, H), (15, 15, 18, 255))  # Deep charcoal
    draw = ImageDraw.Draw(canvas)

    # ── Subtle texture overlay ──
    for y in range(0, H, 3):
        for x in range(0, W, 3):
            v = 12 + hash((x // 12, y // 12)) % 8
            canvas.putpixel((x, y), (v, v, v + 2, 255))

    # ── Gradient vignette ──
    for y in range(H):
        for x in range(W):
            cx, cy = W // 2, H // 2 + 60
            dx, dy = x - cx, y - cy
            dist = (dx * dx + dy * dy) ** 0.5
            max_dist = (W * W + H * H) ** 0.5 / 1.6
            ratio = min(dist / max_dist, 1.0)
            r, g, b, a = canvas.getpixel((x, y))
            darken = int(ratio * 30)
            canvas.putpixel((x, y), (max(r - darken, 0), max(g - darken, 0), max(b - darken, 0), 255))

    # ── Gold accent top bar ──
    draw.rectangle([(0, 0), (W, 4)], fill=(200, 169, 81, 200))
    draw.rectangle([(0, H - 4), (W, H)], fill=(200, 169, 81, 120))

    # ── Load fonts ──
    try:
        font_title = ImageFont.truetype(FONT_PATH, 32)
        font_sub = ImageFont.truetype(FONT_PATH, 18)
        font_label = ImageFont.truetype(FONT_PATH, 13)
        font_tag = ImageFont.truetype(FONT_PATH, 11)
    except:
        font_title = font_sub = font_label = font_tag = ImageFont.load_default()

    # ── Header ──
    title = "LUXOR  OUTFIT  LOOKBOOK"
    try:
        bbox = draw.textbbox((0, 0), title, font=font_title)
        tw = bbox[2] - bbox[0]
    except:
        tw = len(title) * 18
    draw.text(((W - tw) // 2, 28), title, fill=(200, 169, 81, 220), font=font_title)

    # Subtitle
    n = len(images)
    subtitle = f"{n} piece{'s' if n != 1 else ''}"
    if occasion:
        subtitle += f"  ·  {occasion.title()}"
    subtitle += f"  ·  {gender.title()}"
    try:
        bbox = draw.textbbox((0, 0), subtitle, font=font_sub)
        sw = bbox[2] - bbox[0]
    except:
        sw = len(subtitle) * 10
    draw.text(((W - sw) // 2, 72), subtitle, fill=(160, 155, 150, 180), font=font_sub)

    # Gold divider
    div_y = 102
    draw.rectangle([(W//2 - 60, div_y), (W//2 + 60, div_y + 1)], fill=(200, 169, 81, 100))

    # ── Item grid ──
    cols = 2 if n > 1 else 1
    rows = (n + cols - 1) // cols

    item_w = 380 if cols == 2 else 540
    item_h = int(item_w * 1.1)
    gap_x = 36
    gap_y = 36

    grid_w = cols * item_w + (cols - 1) * gap_x
    grid_h = rows * item_h + (rows - 1) * gap_y
    start_x = (W - grid_w) // 2
    start_y = (H - grid_h) // 2 + 20

    for i, img in enumerate(images):
        col = i % cols
        row = i // cols
        x = start_x + col * (item_w + gap_x)
        y = start_y + row * (item_h + gap_y)

        # Resize
        item_img = ImageOps.contain(img, (item_w - 20, item_h - 20))
        iw, ih = item_img.size
        ox = x + (item_w - iw) // 2
        oy = y + (item_h - ih) // 2 + 12  # leave room for label

        # ── Drop shadow ──
        shadow = Image.new("RGBA", (iw + 16, ih + 16), (0, 0, 0, 0))
        shadow_draw = ImageDraw.Draw(shadow)
        shadow_draw.rounded_rectangle(
            [(4, 4), (iw + 12, ih + 12)], radius=10, fill=(0, 0, 0, 100)
        )
        shadow = shadow.filter(ImageFilter.GaussianBlur(8))
        canvas.paste(shadow, (ox - 8, oy - 6), shadow)

        # ── Photo with rounded corners ──
        mask = Image.new("L", (iw, ih), 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.rounded_rectangle([(0, 0), (iw - 1, ih - 1)], radius=10, fill=255)
        item_img.putalpha(mask)
        canvas.paste(item_img, (ox, oy), item_img)

        # ── Thin gold border ──
        draw.rounded_rectangle(
            [(ox, oy), (ox + iw - 1, oy + ih - 1)], radius=10,
            outline=(200, 169, 81, 50), width=1
        )

        # ── Item number label ──
        label = f"#{i + 1}"
        try:
            lb = draw.textbbox((0, 0), label, font=font_tag)
            lw = lb[2] - lb[0]
        except:
            lw = len(label) * 6
        lx = ox + (iw - lw) // 2
        ly = oy + ih + 6
        # Background pill for label
        draw.rounded_rectangle(
            [(lx - 8, ly - 2), (lx + lw + 8, ly + 14)], radius=6,
            fill=(200, 169, 81, 30), outline=(200, 169, 81, 60)
        )
        draw.text((lx, ly), label, fill=(200, 169, 81, 180), font=font_tag)

    # ── Footer ──
    footer_text = "Styled with LUXOR  ·  Lookbook Preview"
    try:
        fb = draw.textbbox((0, 0), footer_text, font=font_tag)
        fw = fb[2] - fb[0]
    except:
        fw = len(footer_text) * 6
    draw.text(((W - fw) // 2, H - 42), footer_text, fill=(160, 155, 150, 120), font=font_tag)

    # ── Output ──
    out = BytesIO()
    canvas.convert("RGB").save(out, format="PNG", optimize=True)
    return out.getvalue()

# ── Main ──
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Luxor Lookbook Server")
    parser.add_argument("--port", type=int, default=PORT, help=f"Port (default: {PORT})")
    parser.add_argument("--host", type=str, default=HOST, help=f"Host (default: {HOST})")
    args = parser.parse_args()

    print(f"╔═══════════════════════════════════════╗")
    print(f"║   Luxor Lookbook Server v2.0         ║")
    print(f"║   Mode: screenshot composite          ║")
    print(f"║   Listening on {args.host}:{args.port}         ║")
    print(f"║   POST /generate-avatar              ║")
    print(f"║   POST /generate-lookbook            ║")
    print(f"╚═══════════════════════════════════════╝")
    print(f"Output: {OUTPUT_DIR}")
    app.run(host=args.host, port=args.port, debug=False)
