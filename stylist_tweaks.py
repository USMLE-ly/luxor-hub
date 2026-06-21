#!/usr/bin/env python3
"""
Luxor Stylist Tweaks Engine v1.0
=================================
Generates AI-powered "stylist tweaks" — edited versions of an outfit photo
showing before/after comparisons (bag swap, accessory addition, etc.).

Uses Pillow for image manipulation. No external AI API needed.

Usage:
  python3 stylist_tweaks.py --image <url_or_path> [--output <dir>]
"""

import argparse
import base64
import io
import json
import math
import os
import random
import sys
import tempfile
import uuid
from pathlib import Path
from typing import Optional

import requests
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance, ImageFont, ImageOps

# ─── Color Palettes ────────────────────────────────────────────────────

NEUTRAL_BAGS = [
    (201, 164, 121, "Tan / Camel"),
    (169, 132, 103, "Brown"),
    (210, 195, 170, "Beige"),
    (180, 160, 140, "Suede"),
    (50, 50, 50, "Black"),
    (100, 90, 80, "Charcoal"),
    (200, 180, 160, "Cream"),
    (150, 120, 100, "Leather Brown"),
]

GOLD_ACCENTS = [
    (212, 175, 55, "Gold"),    # Classic gold
    (218, 165, 32, "Goldenrod"),
    (192, 157, 50, "Antique Gold"),
    (230, 190, 60, "Bright Gold"),
]

SILVER_ACCENTS = [
    (192, 192, 192, "Silver"),
    (176, 176, 180, "Platinum"),
    (160, 160, 170, "Steel"),
]

# ─── Helper: download image ───────────────────────────────────────────

def download_image(url_or_path: str) -> Image.Image:
    """Download or load image from URL or local path."""
    if url_or_path.startswith(("http://", "https://")):
        resp = requests.get(url_or_path, timeout=30)
        resp.raise_for_status()
        return Image.open(io.BytesIO(resp.content))
    return Image.open(url_or_path)


def image_to_data_url(img: Image.Image, fmt: str = "JPEG", quality: int = 75) -> str:
    """Convert PIL Image to base64 data URL (JPEG for smaller size)."""
    buf = io.BytesIO()
    if fmt == "JPEG":
        img = img.convert("RGB")
        img.save(buf, format="JPEG", quality=quality, optimize=True)
    else:
        img.save(buf, format=fmt)
    b64 = base64.b64encode(buf.getvalue()).decode()
    return f"data:image/{fmt.lower()};base64,{b64}"


def image_to_file(img: Image.Image, output_dir: str, name: str) -> str:
    """Save PIL Image to file, return filename."""
    path = os.path.join(output_dir, name)
    img = img.convert("RGB")
    img.save(path, format="JPEG", quality=80, optimize=True)
    return name


def image_to_path(img: Image.Image, output_dir: str, name: str) -> str:
    """Save PIL Image to path."""
    path = os.path.join(output_dir, name)
    img.save(path)
    return path


# ─── Color Analysis ───────────────────────────────────────────────────

def get_dominant_colors(img: Image.Image, n: int = 5) -> list[tuple[int, int, int]]:
    """Extract dominant colors by k-means-esque quantization."""
    small = img.copy()
    small.thumbnail((100, 100))
    pixels = list(small.getdata())
    
    # Simple quantize: divide color space into 8^3 = 512 buckets
    buckets = {}
    for r, g, b in pixels:
        if isinstance(r, tuple):  # Handle RGBA
            r, g, b = r[:3]
        qr, qg, qb = r // 32, g // 32, b // 32
        key = (qr, qg, qb)
        if key not in buckets:
            buckets[key] = {"r": 0, "g": 0, "b": 0, "count": 0}
        buckets[key]["r"] += r
        buckets[key]["g"] += g
        buckets[key]["b"] += b
        buckets[key]["count"] += 1
    
    # Sort by count
    sorted_buckets = sorted(buckets.items(), key=lambda x: x[1]["count"], reverse=True)
    
    colors = []
    for _, v in sorted_buckets[:n]:
        count = v["count"]
        avg_r = v["r"] // count
        avg_g = v["g"] // count
        avg_b = v["b"] // count
        colors.append((avg_r, avg_g, avg_b))
    
    return colors


def color_distance(c1: tuple, c2: tuple) -> float:
    """Euclidean distance between two RGB colors."""
    return math.sqrt((c1[0] - c2[0])**2 + (c1[1] - c2[1])**2 + (c1[2] - c2[2])**2)


def is_skin_tone(r: int, g: int, b: int) -> bool:
    """Rough skin tone detection."""
    return (r > 60 and g > 40 and b > 30 and 
            r > g - 10 and r > b - 10 and
            abs(r - g) < 50 and abs(r - b) < 60)


def is_dark(r: int, g: int, b: int) -> bool:
    return (r + g + b) // 3 < 60


def is_light(r: int, g: int, b: int) -> bool:
    return (r + g + b) // 3 > 180


def is_neutral(r: int, g: int, b: int) -> bool:
    """Rough neutral/achromatic detection."""
    return abs(r - g) < 30 and abs(g - b) < 30 and abs(r - b) < 30


# ─── Tweak: Bag Color Swap ────────────────────────────────────────────

def tweak_bag_swap(img: Image.Image, target_color: tuple = None) -> Image.Image:
    """
    Detect the most likely 'accessory/bag' region (small saturated cluster,
    usually held at hip level) and recolor it to a designer neutral.
    Falls back to global color shift if region can't be isolated.
    """
    result = img.copy().convert("RGBA")
    pixels = result.load()
    w, h = result.size
    
    # Get dominant colors
    dom_colors = get_dominant_colors(img, 6)
    
    # Find the most saturated non-skin, non-neutral color — likely the bag
    bag_color = None
    for c in dom_colors:
        r, g, b = c
        if is_skin_tone(r, g, b) or is_neutral(r, g, b) or is_dark(r, g, b) or is_light(r, g, b):
            continue
        # Check saturation
        maxc = max(r, g, b) / 255.0
        minc = min(r, g, b) / 255.0
        lightness = (maxc + minc) / 2
        if lightness > 0.95 or lightness < 0.05:
            continue
        if maxc - minc > 0.08:  # Has noticeable saturation
            bag_color = c
            break
    
    if bag_color is None:
        # Fallback: pick the most chromatic color
        best_sat = 0
        for c in dom_colors[1:]:  # Skip first (most common)
            r, g, b = c
            maxc = max(r, g, b) / 255.0
            minc = min(r, g, b) / 255.0
            sat = maxc - minc
            if sat > best_sat and not is_skin_tone(r, g, b):
                best_sat = sat
                bag_color = c
    
    if bag_color is None:
        bag_color = (100, 150, 200)  # Default blue if nothing found
    
    if target_color is None:
        # Pick a neutral that's different from the bag
        candidates = [c for c in NEUTRAL_BAGS if color_distance(c[:3], bag_color) > 60]
        if candidates:
            target_color = random.choice(candidates)[:3]
        else:
            target_color = (201, 164, 121)  # Tan
    
    # Apply color replacement to pixels matching the bag color
    bag_r, bag_g, bag_b = bag_color
    tgt_r, tgt_g, tgt_b = target_color
    
    # Calculate the offset
    dr = tgt_r - bag_r
    dg = tgt_g - bag_g
    db = tgt_b - bag_b
    
    # Create a mask for bag-colored regions
    # Use a generous tolerance
    threshold = 60
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    overlay_pixels = overlay.load()
    
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            dist = color_distance((r, g, b), bag_color)
            if dist < threshold and not is_skin_tone(r, g, b):
                # Apply color shift weighted by distance
                weight = 1.0 - (dist / threshold)
                weight = weight ** 0.7  # Non-linear for more natural blend
                nr = int(r + dr * weight)
                ng = int(g + dg * weight)
                nb = int(b + db * weight)
                overlay_pixels[x, y] = (max(0, min(255, nr)), 
                                         max(0, min(255, ng)), 
                                         max(0, min(255, nb)), 
                                         int(255 * weight * 0.85))
    
    result = Image.alpha_composite(result, overlay)
    
    # Add a subtle golden glow label effect at the bottom
    draw = ImageDraw.Draw(result)
    label_text = f"Bag: {target_color[3] if len(target_color) == 4 else 'Neutral'}"
    # Try to find font, fallback to default
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 14)
    except (OSError, IOError):
        font = ImageFont.load_default()
    
    # Text overlay in bottom-right
    tw, th = 10, 10
    tx, ty = w - tw - 15, h - th - 10
    # Background pill
    draw.rounded_rectangle([tx-8, ty-4, tx+tw+20, ty+th+10], radius=6, fill=(0,0,0,160))
    draw.text((tx+4, ty+2), label_text, fill=(230, 200, 80, 220), font=font)
    
    return result.convert("RGB")


# ─── Tweak: Add Gold Accessory ────────────────────────────────────────

def tweak_add_accessory(img: Image.Image) -> Image.Image:
    """
    Add a decorative gold accent overlay (e.g., brooch/pin) at an optimal
    position (near the collar/lapel area).
    """
    result = img.copy().convert("RGBA")
    w, h = result.size
    
    # Create a decorative gold brooch/pin overlay
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    # Position: upper chest area (approximately 35% from top, 45% from left)
    cx, cy = int(w * 0.45), int(h * 0.35)
    
    # Gold brooch — concentric circles with sparkle
    gold_color = (212, 175, 55)
    gold_light = (240, 215, 100)
    gold_dark = (180, 140, 30)
    
    # Outer ring
    outer_r = min(w, h) // 18
    for i in range(3):
        r = outer_r - i * 4
        alpha = 180 - i * 20
        draw.ellipse([cx-r, cy-r, cx+r, cy+r], 
                     outline=(gold_color[0], gold_color[1], gold_color[2], alpha),
                     width=3)
    
    # Inner gem
    inner_r = outer_r // 2
    for i in range(inner_r, 0, -1):
        alpha = 200 - (inner_r - i) * 10
        shade = (
            min(255, gold_light[0] - (inner_r - i) * 5),
            min(255, gold_light[1] - (inner_r - i) * 3),
            min(255, gold_light[2] - (inner_r - i) * 2),
            alpha
        )
        draw.ellipse([cx-i, cy-i, cx+i, cy+i], fill=shade)
    
    # Diamond sparkle in center
    sparkle_size = outer_r // 4
    draw.polygon([
        (cx, cy - sparkle_size),
        (cx + sparkle_size//2, cy),
        (cx, cy + sparkle_size),
        (cx - sparkle_size//2, cy)
    ], fill=(255, 255, 255, 220))
    
    # Subtle glow around brooch
    glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_r = outer_r + 8
    for i in range(5):
        alpha = 12 - i * 2
        r = glow_r + i * 3
        glow_draw.ellipse([cx-r, cy-r, cx+r, cy+r], 
                         outline=(gold_color[0], gold_color[1], gold_color[2], max(0, alpha)))
    
    result = Image.alpha_composite(result, glow)
    result = Image.alpha_composite(result, overlay)
    
    # Label
    draw_final = ImageDraw.Draw(result)
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 14)
    except (OSError, IOError):
        font = ImageFont.load_default()
    
    label = "✨ Gold Brooch"
    tw, th = draw_final.textbbox((0, 0), label, font=font)[2:4]
    tx, ty = w - tw - 20, h - th - 15
    draw_final.rounded_rectangle([tx-8, ty-4, tx+tw+20, ty+th+10], radius=6, fill=(0,0,0,160))
    draw_final.text((tx+4, ty+2), label, fill=(230, 200, 80, 220), font=font)
    
    return result.convert("RGB")


# ─── Tweak: Silhouette Enhancement ────────────────────────────────────

def tweak_silhouette_guide(img: Image.Image) -> Image.Image:
    """
    Add visual silhouette guiding lines — dashed waist emphasis line and
    proportion markers showing where to add structure.
    """
    result = img.copy().convert("RGBA")
    w, h = result.size
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    # Waist line at ~55% from top (natural waist)
    waist_y = int(h * 0.55)
    
    # Dashed horizontal line at waist level — glowing cyan/gold
    dash_len = 12
    gap_len = 6
    line_color = (100, 200, 220, 140)  # Cyan
    x_start = int(w * 0.15)
    x_end = int(w * 0.85)
    
    x = x_start
    while x < x_end:
        end = min(x + dash_len, x_end)
        draw.line([(x, waist_y), (end, waist_y)], fill=line_color, width=2)
        x += dash_len + gap_len
    
    # Vertical proportion markers on the sides
    marker_color = (200, 170, 80, 100)  # Gold
    
    # Left side — proportion markers
    sections = 3
    for i in range(1, sections):
        sy = int(h * i / sections)
        draw.line([(int(w * 0.05), sy), (int(w * 0.12), sy)], fill=marker_color, width=1)
    
    # Right side — arrow pointing at waist suggesting belt
    arrow_x = int(w * 0.88)
    arrow_top = waist_y - 15
    arrow_bot = waist_y + 15
    draw.line([(arrow_x, arrow_top), (arrow_x, arrow_bot)], fill=(230, 200, 80, 180), width=2)
    draw.polygon([(arrow_x, arrow_bot), (arrow_x - 5, arrow_bot - 8), 
                  (arrow_x + 5, arrow_bot - 8)], fill=(230, 200, 80, 180))
    
    # Label: "Define Waist"
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 12)
    except (OSError, IOError):
        font = ImageFont.load_default()
    
    label = "➕ Define Waist"
    tw, th = draw.textbbox((0, 0), label, font=font)[2:4]
    lx = arrow_x + 10
    ly = waist_y - 8
    draw.rounded_rectangle([lx-4, ly-4, lx+tw+8, ly+th+4], radius=4, fill=(0,0,0,140))
    draw.text((lx+2, ly), label, fill=(230, 200, 80, 220), font=font)
    
    result = Image.alpha_composite(result, overlay)
    return result.convert("RGB")


# ─── Tweak: Color Grading (Warm/Cool Shift) ──────────────────────────

def tweak_color_grade(img: Image.Image, warm: bool = True) -> Image.Image:
    """
    Apply a subtle warm or cool color grade to the entire image.
    Warm = golden hour feel. Cool = editorial / high-fashion.
    """
    if warm:
        # Warm grade: boost reds, add amber tone
        r_scale = 1.08
        g_scale = 1.03
        b_scale = 0.92
        label = "🔥 Warm Tone"
    else:
        # Cool grade: boost blues, reduce reds
        r_scale = 0.92
        g_scale = 1.02
        b_scale = 1.08
        label = "❄️ Cool Tone"
    
    # Split into channels and scale
    r, g, b = img.split()
    r = r.point(lambda i: min(255, int(i * r_scale)))
    g = g.point(lambda i: min(255, int(i * g_scale)))
    b = b.point(lambda i: min(255, int(i * b_scale)))
    
    result = Image.merge("RGB", (r, g, b))
    
    # Add subtle vignette for premium feel
    w, h = result.size
    vignette = Image.new("L", (w, h), 255)
    v_draw = ImageDraw.Draw(vignette)
    center_x, center_y = w // 2, h // 2
    max_radius = math.sqrt(center_x**2 + center_y**2)
    
    for y in range(h):
        for x in range(w):
            dist = math.sqrt((x - center_x)**2 + (y - center_y)**2)
            factor = 1.0 - (dist / max_radius) * 0.25
            v_draw.point((x, y), int(255 * factor))
    
    result = Image.composite(result, result.point(lambda i: int(i * 0.88)), vignette)
    
    # Label
    result_rgba = result.convert("RGBA")
    draw = ImageDraw.Draw(result_rgba)
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 14)
    except (OSError, IOError):
        font = ImageFont.load_default()
    
    tw, th = draw.textbbox((0, 0), label, font=font)[2:4]
    tx, ty = w - tw - 20, h - th - 15
    draw.rounded_rectangle([tx-8, ty-4, tx+tw+20, ty+th+10], radius=6, fill=(0,0,0,160))
    draw.text((tx+4, ty+2), label, fill=(230, 200, 80, 220), font=font)
    
    return result_rgba.convert("RGB")


# ─── Tweak: Pro Stylist Collage ──────────────────────────────────────

def tweak_pro_collage(img: Image.Image) -> Image.Image:
    """
    Ultimate stylist tweak: generates a warmer, more editorial version
    with golden hour grading + added accessories + belt suggestion.
    """
    # Apply warm grade first
    warm = tweak_color_grade(img, warm=True)
    
    # Then add gold brooch
    with_brooch = tweak_add_accessory(warm)
    
    # Then silhouette guide
    final = tweak_silhouette_guide(with_brooch)
    
    # Convert to RGBA for overlay
    final_rgba = final.convert("RGBA")
    draw = ImageDraw.Draw(final_rgba)
    
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 16)
    except (OSError, IOError):
        font = ImageFont.load_default()
    
    w, h = final.size
    label = "👑 PRO STYLIST EDIT"
    tw, th = draw.textbbox((0, 0), label, font=font)[2:4]
    tx = (w - tw) // 2
    ty = 12
    draw.rounded_rectangle([tx-12, ty-6, tx+tw+12, ty+th+8], radius=8, fill=(0,0,0,160))
    draw.text((tx, ty), label, fill=(230, 200, 80, 240), font=font)
    
    return final_rgba.convert("RGB")


# ─── Main Generator ───────────────────────────────────────────────────

def _encode_img(img: Image.Image) -> str:
    """Encode image to JPEG data URL."""
    return image_to_data_url(img, fmt="JPEG", quality=75)


def generate_all_tweaks(
    img: Image.Image,
    output_format: str = "data_url",
    output_dir: Optional[str] = None
) -> list[dict]:
    """
    Generate all stylist tweaks from an input image.
    Returns list of {original, tweaked, label, caption} dicts.
    """
    # Ensure we have a copy of the original
    original_rgb = img.convert("RGB")
    
    tweaks = []
    tweak_id = str(uuid.uuid4())[:8]
    
    # 1. Bag swap
    print("[tweaks] Generating bag swap...")
    bag_swapped = tweak_bag_swap(original_rgb)
    tweaks.append({
        "original": _encode_img(original_rgb) if output_format == "data_url" else f"tweak_{tweak_id}_0_orig.jpg",
        "tweaked": _encode_img(bag_swapped) if output_format == "data_url" else f"tweak_{tweak_id}_0_tweak.jpg",
        "label": "Bag Swap",
        "caption": "Bag swapped to neutral tan."
    })
    
    # 2. Gold brooch
    print("[tweaks] Generating gold brooch...")
    with_brooch = tweak_add_accessory(original_rgb)
    tweaks.append({
        "original": _encode_img(original_rgb) if output_format == "data_url" else f"tweak_{tweak_id}_1_orig.jpg",
        "tweaked": _encode_img(with_brooch) if output_format == "data_url" else f"tweak_{tweak_id}_1_tweak.jpg",
        "label": "Gold Brooch",
        "caption": "Gold brooch added at lapel."
    })
    
    # 3. Silhouette guide
    print("[tweaks] Generating silhouette guide...")
    silhouette = tweak_silhouette_guide(original_rgb)
    tweaks.append({
        "original": _encode_img(original_rgb) if output_format == "data_url" else f"tweak_{tweak_id}_2_orig.jpg",
        "tweaked": _encode_img(silhouette) if output_format == "data_url" else f"tweak_{tweak_id}_2_tweak.jpg",
        "label": "Define Waist",
        "caption": "Add belt for waist definition."
    })
    
    # 4. Warm color grade
    print("[tweaks] Generating warm color grade...")
    warm = tweak_color_grade(original_rgb, warm=True)
    tweaks.append({
        "original": _encode_img(original_rgb) if output_format == "data_url" else f"tweak_{tweak_id}_3_orig.jpg",
        "tweaked": _encode_img(warm) if output_format == "data_url" else f"tweak_{tweak_id}_3_tweak.jpg",
        "label": "Warm Grade",
        "caption": "Golden hour warmth applied."
    })
    
    # 5. Pro stylist collage
    print("[tweaks] Generating pro stylist edit...")
    pro = tweak_pro_collage(original_rgb)
    tweaks.append({
        "original": _encode_img(original_rgb) if output_format == "data_url" else f"tweak_{tweak_id}_4_orig.jpg",
        "tweaked": _encode_img(pro) if output_format == "data_url" else f"tweak_{tweak_id}_4_tweak.jpg",
        "label": "✨ Pro Edit",
        "caption": "Complete stylist upgrade."
    })
    
    # Save to output_dir if provided
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)
        for i, t in enumerate(tweaks):
            orig_path = os.path.join(output_dir, f"tweak_{tweak_id}_{i}_orig.jpg")
            tweak_path = os.path.join(output_dir, f"tweak_{tweak_id}_{i}_tweak.jpg")
            original_rgb.save(orig_path, format="JPEG", quality=80, optimize=True)
            # Re-generate tweak and save
            tweak_funcs = [tweak_bag_swap, tweak_add_accessory, tweak_silhouette_guide, 
                          lambda x: tweak_color_grade(x, warm=True), tweak_pro_collage]
            tf = tweak_funcs[i]
            tweak_img = tf(original_rgb)
            tweak_img.save(tweak_path, format="JPEG", quality=80, optimize=True)
    
    return tweaks


# ─── CLI ──────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Luxor Stylist Tweaks Engine")
    parser.add_argument("--image", required=True, help="Image URL or file path")
    parser.add_argument("--output", default=None, help="Output directory for saved images")
    parser.add_argument("--format", default="data_url", choices=["data_url", "file"], 
                       help="Output format")
    args = parser.parse_args()
    
    print(f"[tweaks] Loading image: {args.image}")
    img = download_image(args.image)
    print(f"[tweaks] Image size: {img.size}")
    
    tweaks = generate_all_tweaks(img, output_format=args.format, output_dir=args.output)
    
    result = {
        "success": True,
        "tweaks": tweaks,
    }
    print(json.dumps(result, indent=2))
    return result


if __name__ == "__main__":
    main()
