#!/usr/bin/env python3
# Luxor Pro Stylist — Fashion Analysis & Interactive Ecosystem
# Groq Vision · Stylist Quiz · Closet Management · Outfit Generator
# Vercel Blob · Qdrant Storage · Serverless Ready
import base64
import io
import json
import logging
import os
import re
import time
import urllib.parse
import uuid
from concurrent.futures import ThreadPoolExecutor, TimeoutError
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List

import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
from dotenv import load_dotenv

# Qdrant + Vercel Blob
try:
    from qdrant_client import QdrantClient
    from qdrant_client.http import models as qdrant_models
except ImportError:
    QdrantClient = None
    qdrant_models = None
from qdrant_client.http import models as qdrant_models
try:
    from vercel_blob import put as blob_put
except ImportError:
    blob_put = None

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

_RESAMPLE_LANCZOS = Image.Resampling.LANCZOS

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s %(message)s",
)
_log = logging.getLogger("luxor.omega")

app = Flask(__name__)
CORS(app, origins=["*"])

# ---------------------------------------------------------------------------
# Environment
# ---------------------------------------------------------------------------
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_VISION_MODEL = os.getenv("GROQ_VISION_MODEL", "llama-3.2-11b-vision-preview")
GROQ_TEXT_MODEL = os.getenv("GROQ_TEXT_MODEL", "llama-3.1-8b-instant")

CIPHER_MAX_TOKENS = int(os.getenv("CIPHER_MAX_TOKENS", "1200"))
PORT = int(os.getenv("PORT", "5000"))
ANALYSIS_TIMEOUT = int(os.getenv("ANALYSIS_TIMEOUT", "90"))

# Vercel Blob
BLOB_READ_WRITE_TOKEN = os.getenv("BLOB_READ_WRITE_TOKEN", "")

# Qdrant
QDRANT_URL = os.getenv("QDRANT_URL", "")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY", "")

_log.info("Groq key loaded: %s", bool(GROQ_API_KEY))
_log.info("Vision model: %s", GROQ_VISION_MODEL)
_log.info("Text model: %s", GROQ_TEXT_MODEL)
_log.info("Blob token: %s", bool(BLOB_READ_WRITE_TOKEN))
_log.info("Qdrant: %s", bool(QDRANT_URL and QDRANT_API_KEY))

# ---------------------------------------------------------------------------
# Qdrant Closet Client
# ---------------------------------------------------------------------------
_qdrant_closet = None
_CLOSET_COLLECTION = "luxor_closet"

def _get_qdrant_closet() -> Optional[QdrantClient]:
    global _qdrant_closet
    if _qdrant_closet is None and QDRANT_URL and QDRANT_API_KEY:
        try:
            _qdrant_closet = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY, timeout=10)
            _ensure_closet_collection(_qdrant_closet)
            _log.info("[QDRANT] Closet client ready")
        except Exception as exc:
            _log.warning("[QDRANT] Init failed: %s", exc)
            _qdrant_closet = None
    return _qdrant_closet

def _ensure_closet_collection(client: QdrantClient):
    try:
        collections = client.get_collections()
        names = [c.name for c in collections.collections]
        if _CLOSET_COLLECTION not in names:
            client.create_collection(
                collection_name=_CLOSET_COLLECTION,
                vectors_config=qdrant_models.VectorParams(size=4, distance=qdrant_models.Distance.COSINE),
            )
            _log.info("[QDRANT] Created collection '%s'", _CLOSET_COLLECTION)
    except Exception as exc:
        _log.warning("[QDRANT] Ensure collection: %s", exc)

def qdrant_get_all_items() -> List[Dict[str, Any]]:
    client = _get_qdrant_closet()
    if not client:
        return []
    try:
        result = client.scroll(
            collection_name=_CLOSET_COLLECTION,
            limit=1000,
            with_payload=True,
        )
        points = result[0] if isinstance(result, tuple) else result
        return [dict(p.payload) for p in points if p.payload]
    except Exception as exc:
        _log.warning("[QDRANT] Scroll error: %s", exc)
        return []

def qdrant_upsert_item(item: Dict[str, Any]) -> bool:
    client = _get_qdrant_closet()
    if not client:
        return False
    try:
        point_id = item.get("id", str(uuid.uuid4())[:8])
        client.upsert(
            collection_name=_CLOSET_COLLECTION,
            points=[qdrant_models.PointStruct(
                id=point_id,
                vector=[0.0, 0.0, 0.0, 0.0],
                payload=item,
            )]
        )
        return True
    except Exception as exc:
        _log.warning("[QDRANT] Upsert error: %s", exc)
        return False

def qdrant_delete_item(item_id: str) -> bool:
    client = _get_qdrant_closet()
    if not client:
        return False
    try:
        client.delete(
            collection_name=_CLOSET_COLLECTION,
            points_selector=qdrant_models.Filter(
                must=[qdrant_models.FieldCondition(
                    key="id", match=qdrant_models.MatchValue(value=item_id)
                )]
            ),
        )
        return True
    except Exception as exc:
        _log.warning("[QDRANT] Delete error: %s", exc)
        return False

def qdrant_get_item(item_id: str) -> Optional[Dict[str, Any]]:
    client = _get_qdrant_closet()
    if not client:
        return None
    try:
        result = client.scroll(
            collection_name=_CLOSET_COLLECTION,
            limit=1,
            with_payload=True,
            scroll_filter=qdrant_models.Filter(
                must=[qdrant_models.FieldCondition(
                    key="id", match=qdrant_models.MatchValue(value=item_id)
                )]
            ),
        )
        points = result[0] if isinstance(result, tuple) else result
        if points and points[0].payload:
            return dict(points[0].payload)
        return None
    except Exception as exc:
        _log.warning("[QDRANT] Get error: %s", exc)
        return None

# ---------------------------------------------------------------------------
# Prompts
# ---------------------------------------------------------------------------
SACRED_PROMPT = """You are a rigorous, non-creative fashion classification robot. Ignore the background 100%. Look ONLY at the person in the photo.

Output this exact JSON. Do NOT alter the gender. Do NOT hallucinate items.

{
  "gender": "Female" or "Male",
  "top_type": "exact top worn",
  "bottom_type": "exact bottom worn",
  "footwear": "exact footwear",
  "accessories": "one existing accessory",
  "style_score": integer between 70 and 95,
  "style_name": "2-word vibe title",
  "strengths": ["3 specific strengths based on detected clothing"],
  "audit": "15-word summary",
  "tweak_plan": "1-sentence to swap/add one accessory using EXACT items",
  "generation_prompt": "20-word prompt for editorial shot with edit applied"
}

Return ONLY this JSON. No conversation."""

STYLIST_PROMPT = """You are FASHION-OMEGA, an expert fashion stylist AI. Guide the user through a 3-step quiz:
Step 1: Ask about their vibe (Casual, Business, Party, Date Night, Sport).
Step 2: Ask about weather (Hot, Mild, Cold).
Step 3: Ask about color palette (Neutrals, Brights, Pastels, Dark).

After Step 3, generate a unique outfit description. Return ONLY JSON:
- `next_question`: "" when complete, otherwise the question text
- `options`: array of 3-5 answer choices, or [] when complete
- `generated_prompt`: 15-word visual Pollinations prompt (only when complete)
- `outfit_name`: 2-3 word name for the outfit (only when complete)

Use the user's previous answers and style context for uniqueness."""

CLOSET_PROMPT = """You are a personal stylist. Analyze the user's closet provided below. Pick 2 distinct, complete outfits that perfectly match the user's request: {occasion} occasion, {weather} weather, and {color_palette} color palette. Each outfit must include 1 Top, 1 Bottom, 1 Pair of Shoes, and optionally 1 Accessory or Dress.
Return ONLY a JSON array of 2 objects in this exact format:
[
  { "outfit_name": "Sporty Street Look", "item_ids": ["id1", "id2", "id3"], "reason": "why this works" },
  { "outfit_name": "Summer Lounge Vibe", "item_ids": ["id4", "id5", "id6"], "reason": "why this works" }
]"""

REQUIRED_KEYS = [
    "gender", "top_type", "bottom_type", "footwear", "accessories",
    "style_score", "style_name", "strengths", "audit", "tweak_plan",
    "generation_prompt",
]

# ---------------------------------------------------------------------------
# Image compression
# ---------------------------------------------------------------------------
def compress_image_b64(image_b64: str) -> str:
    try:
        raw = base64.b64decode(image_b64)
        img = Image.open(io.BytesIO(raw))
        w, h = img.size
        if max(w, h) > 128:
            ratio = 128.0 / max(w, h)
            img = img.resize((int(w * ratio), int(h * ratio)), _RESAMPLE_LANCZOS)
        buf = io.BytesIO()
        img.convert("RGB").save(buf, format="JPEG", quality=50, optimize=True)
        return base64.b64encode(buf.getvalue()).decode()
    except Exception as exc:
        _log.warning("[COMPRESS] %s", exc)
        return image_b64

# ---------------------------------------------------------------------------
# Groq API calls
# ---------------------------------------------------------------------------
def call_groq_vision(image_b64: str, system_prompt: str = SACRED_PROMPT, temperature: float = 0.2) -> Optional[Dict[str, Any]]:
    if not GROQ_API_KEY:
        return None
    compressed = compress_image_b64(image_b64)
    headers = {"Content-Type": "application/json", "Authorization": f"Bearer {GROQ_API_KEY}"}
    payload = {
        "model": GROQ_VISION_MODEL,
        "messages": [{"role": "user", "content": [
            {"type": "text", "text": system_prompt},
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{compressed}", "detail": "low"}},
        ]}],
        "max_tokens": CIPHER_MAX_TOKENS,
        "temperature": temperature,
    }
    try:
        resp = requests.post(GROQ_API_URL, json=payload, headers=headers, timeout=60)
        if resp.status_code == 200:
            raw = resp.json()["choices"][0]["message"]["content"]
            match = re.search(r"\{[\s\S]*\}", raw)
            if match:
                return json.loads(match.group(0))
    except Exception as exc:
        _log.error("[GROQ-VISION] %s", exc)
    return None

def call_groq_text(messages: List[Dict[str, str]], system_prompt: str = "", temperature: float = 0.7) -> Optional[Dict[str, Any]]:
    if not GROQ_API_KEY:
        return None
    headers = {"Content-Type": "application/json", "Authorization": f"Bearer {GROQ_API_KEY}"}
    groq_messages = []
    if system_prompt:
        groq_messages.append({"role": "system", "content": system_prompt})
    groq_messages.extend(messages)
    payload = {
        "model": GROQ_TEXT_MODEL,
        "messages": groq_messages,
        "max_tokens": CIPHER_MAX_TOKENS,
        "temperature": temperature,
    }
    try:
        resp = requests.post(GROQ_API_URL, json=payload, headers=headers, timeout=15)
        if resp.status_code == 200:
            raw = resp.json()["choices"][0]["message"]["content"]
            match = re.search(r"\{[\s\S]*\}", raw)
            if match:
                return json.loads(match.group(0))
    except Exception as exc:
        _log.error("[GROQ-TEXT] %s", exc)
    return None

# ---------------------------------------------------------------------------
# Vercel Blob helper
# ---------------------------------------------------------------------------
def upload_image_to_blob(image_b64: str, prefix: str = "closet") -> Optional[str]:
    if not BLOB_READ_WRITE_TOKEN:
        _log.warning("[BLOB] No token configured")
        return None
    try:
        raw = base64.b64decode(image_b64)
        ext = "jpg"
        path = f"{prefix}/{uuid.uuid4().hex[:16]}.{ext}"
        resp = blob_put(path, raw, options={"addRandomSuffix": "false"})
        if isinstance(resp, dict):
            return resp.get("url") or resp.get("pathname") or None
        return None
    except Exception as exc:
        _log.error("[BLOB] Upload error: %s", exc)
        return None

# ---------------------------------------------------------------------------
# Fashion Decision
# ---------------------------------------------------------------------------
def get_fashion_decision(image_b64: str) -> Dict[str, Any]:
    try:
        future = _executor.submit(call_groq_vision, image_b64, SACRED_PROMPT, 0.2)
        result = future.result(timeout=ANALYSIS_TIMEOUT)
        if result:
            result["source"] = "cipher_vision"
            return result
    except TimeoutError:
        _log.warning("[PIPELINE] Timed out")
    except Exception as exc:
        _log.error("[PIPELINE] %s", exc)
    return {"style_name": "", "gender": "", "top_type": "", "bottom_type": "", "footwear": "", "accessories": "", "actual_colors": [], "items_detected": [], "strengths": [], "audit": "", "tweak_plan": "", "generation_prompt": "", "style_score": None, "source": "fallback"}

def map_analysis(result: Dict[str, Any]) -> Dict[str, Any]:
    items_detected = []
    for key in ["top_type", "bottom_type", "footwear", "accessories"]:
        if result.get(key):
            items_detected.append(result[key])
    actual_colors = result.get("actual_colors", [])
    if not actual_colors:
        color_map = {"Pink": "Pink", "Red": "Red", "Blue": "Blue", "Black": "Black", "White": "White", "Cream": "Cream", "Green": "Green", "Brown": "Brown", "Gold": "Gold", "Silver": "Silver", "Grey": "Grey", "Navy": "Navy", "Tan": "Tan", "Beige": "Beige", "Yellow": "Yellow"}
        for item in items_detected:
            for name, val in color_map.items():
                if name.lower() in item.lower() and val not in actual_colors:
                    actual_colors.append(val)
    strengths = result.get("strengths", [])
    if len(strengths) < 3:
        strengths = [f"Choice of {result.get('top_type', 'top')}", f"Coordination with {result.get('bottom_type', 'bottom')}", "Overall cohesive styling"]
    return {"success": True, "source": result.get("source", "unknown"), "style_name": result.get("style_name", ""), "style_score": result.get("style_score"), "gender": result.get("gender", ""), "actual_colors": actual_colors, "items_detected": items_detected, "strengths": strengths, "audit": result.get("audit", ""), "tweak_plan": result.get("tweak_plan", ""), "generation_prompt": result.get("generation_prompt", "")}

_executor = ThreadPoolExecutor(max_workers=2)

# ===========================================================================
# ENDPOINTS
# ===========================================================================

# ---------------------------------------------------------------------------
# Analysis
# ---------------------------------------------------------------------------
@app.route("/api/v1/analyze-outfit", methods=["POST", "OPTIONS"])
def analyze_outfit():
    if request.method == "OPTIONS":
        return "", 204
    data = request.get_json(silent=True) or {}
    image_b64 = data.get("image_b64")
    if not image_b64:
        return jsonify({"error": "Missing image_b64"}), 400
    try:
        future = _executor.submit(get_fashion_decision, image_b64)
        result = future.result(timeout=ANALYSIS_TIMEOUT + 10)
        return jsonify(map_analysis(result))
    except TimeoutError:
        _log.error("[ANALYZE] Timeout")
    except Exception as exc:
        _log.error("[ANALYZE] ERROR: %s", exc)
    return jsonify({"success": True, "source": "fallback", "style_name": "", "style_score": None, "gender": "", "actual_colors": [], "items_detected": [], "strengths": [], "audit": "", "tweak_plan": "", "generation_prompt": ""})

# ---------------------------------------------------------------------------
# Stylist Explore
# ---------------------------------------------------------------------------
@app.route("/api/v1/stylist-explore", methods=["POST", "OPTIONS"])
def stylist_explore():
    if request.method == "OPTIONS":
        return "", 204
    data = request.get_json(silent=True) or {}
    image_b64 = data.get("image_b64")
    chat_history = data.get("chat_history", [])
    answer = data.get("answer", "")
    if not image_b64:
        return jsonify({"error": "Missing image_b64"}), 400

    analysis = get_fashion_decision(image_b64)
    style_context = f"User style: {analysis.get('style_name', 'Unknown')}. "
    items = [analysis.get(k, "") for k in ["top_type", "bottom_type", "footwear", "accessories"] if analysis.get(k)]
    if items:
        style_context += f"Wearing: {', '.join(items)}. "
    colors = analysis.get("actual_colors", [])
    if colors:
        style_context += f"Colors: {', '.join(colors)}."

    messages = [{"role": "user", "content": f"Style context: {style_context}"}]
    for entry in chat_history:
        messages.append({"role": "assistant" if entry.get("role") == "assistant" else "user", "content": entry.get("text", "")})
    if answer:
        messages.append({"role": "user", "content": answer})
    seed = int(time.time() * 1000) % 10000
    messages.append({"role": "user", "content": f"Use seed={seed} for uniqueness."})

    result = call_groq_text(messages, STYLIST_PROMPT, temperature=0.8)
    if not result:
        return jsonify({"next_question": "Tell me what kind of vibe you are going for today?", "options": ["Casual", "Business", "Party", "Date Night", "Sport"], "generated_prompt": "", "outfit_name": ""})

    next_q = result.get("next_question", "")
    options = result.get("options", [])
    gen_prompt = result.get("generated_prompt", "")
    outfit_name = result.get("outfit_name", "")

    if gen_prompt and not next_q:
        safe = urllib.parse.quote(gen_prompt)
        image_url = f"https://image.pollinations.ai/prompt/{safe}?width=1024&height=1024&nologin=true&seed={seed}"
        return jsonify({"next_question": "", "options": [], "generated_prompt": gen_prompt, "outfit_name": outfit_name, "image_url": image_url})

    return jsonify({"next_question": next_q, "options": options, "generated_prompt": "", "outfit_name": ""})

# ---------------------------------------------------------------------------
# Stylist Generate (Pollinations-only, no Groq dependency)
# ---------------------------------------------------------------------------
@app.route("/api/v1/stylist-generate", methods=["POST", "OPTIONS"])
def stylist_generate():
    if request.method == "OPTIONS":
        return "", 204
    data = request.get_json(silent=True) or {}
    vibe = data.get("vibe", "Casual")
    weather = data.get("weather", "Mild")
    color = data.get("color", "Neutrals")

    prompt = f"High fashion editorial photograph of a woman wearing a {vibe} style outfit, designed for {weather} weather, using a {color} color palette. Photorealistic, soft lighting, stylish setting."
    safe = urllib.parse.quote(prompt)
    seed = int(time.time() * 1000)
    image_url = f"https://image.pollinations.ai/prompt/{safe}?width=1024&height=1024&nologin=true&seed={seed}"

    return jsonify({
        "success": True,
        "image_url": image_url,
        "description": f"A {color} {vibe} outfit for {weather} weather."
    })

# ---------------------------------------------------------------------------
# Closet (Vercel Blob + Qdrant)
# ---------------------------------------------------------------------------
@app.route("/api/v1/closet/add-item", methods=["POST", "OPTIONS"])
def closet_add():
    if request.method == "OPTIONS":
        return "", 204
    data = request.get_json(silent=True) or {}
    item_type = data.get("type", "other")
    label = data.get("label", "")
    color = data.get("color", "")
    category = data.get("category", "")
    image_b64 = data.get("image_b64", "")

    if not label and not image_b64:
        return jsonify({"error": "Need label or image"}), 400

    # Upload image to Vercel Blob
    image_url = None
    if image_b64:
        image_url = upload_image_to_blob(image_b64)

    # Build item
    item_id = str(uuid.uuid4())[:8]
    item = {
        "id": item_id,
        "type": item_type,
        "label": label,
        "color": color,
        "category": category,
        "image_url": image_url or "",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    # Store in Qdrant
    ok = qdrant_upsert_item(item)
    if not ok:
        return jsonify({"error": "Storage unavailable"}), 503

    return jsonify({"success": True, "item": item})

@app.route("/api/v1/closet/list-items", methods=["GET", "OPTIONS"])
def closet_list():
    if request.method == "OPTIONS":
        return "", 204
    items = qdrant_get_all_items()
    return jsonify({"success": True, "items": items})

@app.route("/api/v1/closet/delete-item", methods=["POST", "OPTIONS"])
def closet_delete():
    if request.method == "OPTIONS":
        return "", 204
    data = request.get_json(silent=True) or {}
    item_id = data.get("id", "")
    if not item_id:
        return jsonify({"error": "Missing id"}), 400
    ok = qdrant_delete_item(item_id)
    return jsonify({"success": ok})

# ---------------------------------------------------------------------------
# Dressing Room Generator (Groq Text picks from Qdrant closet)
# ---------------------------------------------------------------------------
@app.route("/api/v1/dressing-room/generate", methods=["POST", "OPTIONS"])
def dressing_generate():
    if request.method == "OPTIONS":
        return "", 204
    data = request.get_json(silent=True) or {}
    occasion = data.get("occasion", "Casual")
    weather = data.get("weather", "Mild")
    color_palette = data.get("color_palette", "Neutrals")

    # Get all closet items from Qdrant
    closet_items = qdrant_get_all_items()
    if not closet_items:
        return jsonify({"success": False, "error": "Closet is empty! Add items first."})

    # Build closet summary for Groq
    closet_summary = "\n".join([
        f"- {i.get('label', 'Unknown')} ({i.get('color', '')} {i.get('type', '')}) [ID: {i.get('id', '')}]"
        for i in closet_items
    ])

    # Build prompt
    prompt = CLOSET_PROMPT.format(occasion=occasion, weather=weather, color_palette=color_palette)
    messages = [
        {"role": "user", "content": f"Here is the user's closet:\n{closet_summary}"},
        {"role": "user", "content": prompt},
    ]

    # Call Groq Text
    result = call_groq_text(messages, temperature=0.7)
    if not result:
        return jsonify({"success": False, "error": "Could not generate outfit"})

    # result should be a list of 2 outfits
    outfit_options_raw = result if isinstance(result, list) else result.get("outfits", [])
    if not outfit_options_raw or len(outfit_options_raw) == 0:
        return jsonify({"success": False, "error": "Could not compose outfits"})

    # Look up items by ID for each outfit
    outfit_options = []
    for opt in outfit_options_raw[:2]:
        item_ids = opt.get("item_ids", [])
        items = []
        for iid in item_ids:
            item = qdrant_get_item(iid)
            if item:
                items.append({
                    "id": item.get("id", ""),
                    "label": item.get("label", ""),
                    "type": item.get("type", ""),
                    "color": item.get("color", ""),
                    "image_url": item.get("image_url", ""),
                })
        outfit_options.append({
            "outfit_name": opt.get("outfit_name", "Styled Look"),
            "reason": opt.get("reason", ""),
            "items": items,
        })

    return jsonify({
        "success": True,
        "outfit_options": outfit_options,
    })

# ---------------------------------------------------------------------------
# Debug & Health
# ---------------------------------------------------------------------------
@app.route("/debug/analyze", methods=["POST"])
def debug_analyze():
    data = request.get_json(silent=True) or {}
    image_b64 = data.get("image_b64")
    if not image_b64:
        return jsonify({"error": "Missing image_b64"}), 400
    compressed = compress_image_b64(image_b64)
    headers = {"Content-Type": "application/json", "Authorization": f"Bearer {GROQ_API_KEY}"}
    payload = {"model": GROQ_VISION_MODEL, "messages": [{"role": "user", "content": [{"type": "text", "text": SACRED_PROMPT}, {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{compressed}", "detail": "low"}}]}], "max_tokens": CIPHER_MAX_TOKENS, "temperature": 0.2}
    try:
        resp = requests.post(GROQ_API_URL, json=payload, headers=headers, timeout=60)
        return jsonify({"status": "success" if resp.status_code == 200 else "error", "code": resp.status_code, "text": resp.text[:500] if resp.status_code != 200 else "", "raw": resp.json() if resp.status_code == 200 else {}})
    except Exception as e:
        return jsonify({"status": "exception", "error": str(e)})

@app.route("/", methods=["GET"])
@app.route("/api/health", methods=["GET"])
@app.route("/health", methods=["GET"])
def health():
    closet_count = len(qdrant_get_all_items())
    return jsonify({
        "status": "ok",
        "service": "luxor-fashion-omega-v5",
        "groq_configured": bool(GROQ_API_KEY),
        "blob_configured": bool(BLOB_READ_WRITE_TOKEN),
        "qdrant_configured": bool(QDRANT_URL and QDRANT_API_KEY),
        "closet_items": closet_count,
    })

# ---------------------------------------------------------------------------
# Entrypoint
# ---------------------------------------------------------------------------
