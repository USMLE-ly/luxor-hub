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
    QdrantClient = None  # type: ignore[assignment]
    qdrant_models = None  # type: ignore[assignment]
try:
    from vercel_blob import put as blob_put  # type: ignore[import]
except ImportError:
    blob_put = None

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"), override=True)

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
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "google/gemma-4-31b-it:free")
OPENROUTER_TEXT_MODEL = os.getenv("OPENROUTER_TEXT_MODEL", "google/gemma-4-31b-it:free")
# Fallback models tried in order when primary is rate-limited
OPENROUTER_FALLBACK_MODELS = [
    "google/gemma-4-26b-a4b-it:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "nousresearch/hermes-3-llama-3.1-405b:free",
]

CIPHER_MAX_TOKENS = int(os.getenv("CIPHER_MAX_TOKENS", "1200"))
PORT = int(os.getenv("PORT", "5000"))
ANALYSIS_TIMEOUT = int(os.getenv("ANALYSIS_TIMEOUT", "90"))

# Vercel Blob
BLOB_READ_WRITE_TOKEN = os.getenv("BLOB_READ_WRITE_TOKEN", "")

# Qdrant
QDRANT_URL = os.getenv("QDRANT_URL", "")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY", "")

_log.info("OpenRouter key loaded: %s (masked: %s)", bool(OPENROUTER_API_KEY), OPENROUTER_API_KEY[:8] + "..." + OPENROUTER_API_KEY[-4:] if OPENROUTER_API_KEY else "NONE")
_log.info("Vision model: %s", OPENROUTER_MODEL)
_log.info("Text model: %s", OPENROUTER_TEXT_MODEL)
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

You MUST return valid JSON with ALL of the following keys. Every key is REQUIRED. Do NOT omit any key.

{
  "gender": "Female" or "Male" (ALWAYS pick one, never empty),
  "top_type": "exact top worn" or "None" if no top visible,
  "bottom_type": "exact bottom worn" or "None" if no bottom visible,
  "footwear": "exact footwear" or "None" if no footwear visible,
  "accessories": "one existing accessory" or "None" if no accessories,
  "style_score": integer between 70 and 95 (ALWAYS an integer, never null),
  "style_name": "2-word vibe title" (ALWAYS a 2-word string, never empty),
  "strengths": ["3 specific strengths based on detected clothing"] (ALWAYS an array of 3 strings, never empty),
  "audit": "15-word summary" (ALWAYS a string of at least 10 words),
  "tweak_plan": "1-sentence to swap/add one accessory using EXACT items" (ALWAYS a string, never empty),
  "generation_prompt": "20-word prompt for editorial shot with edit applied" (ALWAYS a string of at least 15 words)
}

CRITICAL RULES:
- style_score must be an integer (number), never null, never a string, never 0
- strengths must be an array of exactly 3 strings
- If you cannot detect an item, write "None" as the string — do NOT omit the key
- Every single key above MUST be present in your JSON output
- Return ONLY this JSON. No conversation. No markdown. No explanation."""

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
    """Safely compress a base64 image. Handles data-URL headers, missing padding."""
    try:
        # Strip optional data-URL header
        if ',' in image_b64:
            image_b64 = image_b64.split(',', 1)[1]
        # Fix missing base64 padding
        missing = len(image_b64) % 4
        if missing:
            image_b64 += '=' * (4 - missing)
        raw = base64.b64decode(image_b64)
        img = Image.open(io.BytesIO(raw))
        w, h = img.size
        if max(w, h) > 800:
            ratio = 800.0 / max(w, h)
            img = img.resize((int(w * ratio), int(h * ratio)), _RESAMPLE_LANCZOS)
        buf = io.BytesIO()
        img.convert("RGB").save(buf, format="JPEG", quality=50, optimize=True)
        return base64.b64encode(buf.getvalue()).decode()
    except Exception as exc:
        _log.warning("[COMPRESS] %s — returning original", exc)
        return image_b64

# ---------------------------------------------------------------------------
# Groq API calls
# ---------------------------------------------------------------------------
def _extract_image_features(image_b64: str) -> str:
    """Extract color/features from image locally, return text description."""
    try:
        raw = base64.b64decode(image_b64)
        img = Image.open(io.BytesIO(raw))
        # Resize for speed
        img_small = img.resize((32, 48), Image.Resampling.LANCZOS)
        pixels = list(img_small.getdata())
        
        # Find dominant colors using simple quantization
        from collections import Counter
        # Quantize to 16 colors
        quantized = []
        for r, g, b in pixels:
            # Map to nearest color name
            quantized.append((r // 64 * 64, g // 64 * 64, b // 64 * 64))
        
        color_counts = Counter(quantized)
        top_colors = color_counts.most_common(5)
        
        # Convert RGB to color names
        color_names = []
        for (r, g, b), count in top_colors:
            if r > 200 and g > 200 and b > 200:
                name = "White"
            elif r < 50 and g < 50 and b < 50:
                name = "Black"
            elif r > 200 and g < 100 and b < 100:
                name = "Red"
            elif r > 200 and g > 150 and b < 100:
                name = "Orange"
            elif r > 200 and g > 200 and b < 100:
                name = "Yellow"
            elif r < 100 and g > 150 and b < 100:
                name = "Green"
            elif r < 100 and g < 150 and b > 200:
                name = "Blue"
            elif r > 150 and g < 100 and b > 150:
                name = "Purple"
            elif r > 150 and g > 100 and b < 100:
                name = "Brown"
            elif r > 200 and g > 180 and b > 150:
                name = "Beige"
            elif r > 150 and g > 150 and b > 150:
                name = "Grey"
            elif r < 50 and g < 50 and b > 150:
                name = "Navy"
            elif r > 200 and g < 200 and b < 100:
                name = "Khaki"
            elif r > 150 and g < 100 and b < 100:
                name = "Maroon"
            elif r > 150 and g > 150 and b < 50:
                name = "Olive"
            else:
                name = f"rgb({r},{g},{b})"
            if name not in color_names:
                color_names.append(name)
        
        # Determine if image has a person-like shape (simple heuristic)
        w, h = img.size
        aspect = w / h
        
        features = []
        features.append(f"Image aspect ratio: {aspect:.2f}")
        features.append(f"Dominant colors: {', '.join(color_names)}")
        features.append(f"Image size: {w}x{h} pixels")
        
        # Simple brightness analysis
        gray = img.convert('L')
        avg_brightness = sum(gray.getdata()) / len(list(gray.getdata()))
        features.append(f"Average brightness: {avg_brightness:.0f}/255")
        
        if avg_brightness < 80:
            features.append("Lighting: Dark")
        elif avg_brightness > 180:
            features.append("Lighting: Bright")
        else:
            features.append("Lighting: Normal")
        
        return "\n".join(features)
    except Exception as exc:
        _log.warning("[FEATURES] %s", exc)
        return "Unable to extract image features."


def call_groq_vision(image_b64: str, system_prompt: str = SACRED_PROMPT, temperature: float = 0.2) -> Optional[Dict[str, Any]]:
    if not OPENROUTER_API_KEY:
        return None
    compressed = compress_image_b64(image_b64)
    headers = {"Content-Type": "application/json", "Authorization": f"Bearer {OPENROUTER_API_KEY}", "HTTP-Referer": "https://luxor.ly", "X-Title": "LuxorHub"}
    
    # Extract image features locally as text description
    features = _extract_image_features(image_b64)
    _log.info("[FEATURES] Extracted: %s", features[:100])
    
    # Try vision model first (works from non-Replit IPs)
    models_to_try = [OPENROUTER_MODEL] + [m for m in OPENROUTER_FALLBACK_MODELS if "gemma" in m.lower() or "llama" in m.lower()]
    last_error = None
    
    for model in models_to_try:
        payload = {
            "model": model,
            "messages": [{"role": "user", "content": [
                {"type": "text", "text": system_prompt},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{compressed}", "detail": "low"}},
            ]}],
            "max_tokens": CIPHER_MAX_TOKENS,
            "temperature": temperature,
        }
        try:
            _log.info("[OPENROUTER-VISION] Trying model=%s", model)
            resp = requests.post(OPENROUTER_API_URL, json=payload, headers=headers, timeout=120)
            _log.info("[OPENROUTER-VISION] HTTP %s for %s", resp.status_code, model)
            
            if resp.status_code == 200:
                raw = resp.json()["choices"][0]["message"]["content"]
                match = re.search(r"\{[\s\S]*\}", raw)
                if match:
                    return json.loads(match.group(0))
            elif resp.status_code == 429:
                _log.warning("[OPENROUTER-VISION] Rate limited on %s", model)
                last_error = "rate_limited"
                continue
            else:
                _log.error("[OPENROUTER-VISION] HTTP %s from %s: %s", resp.status_code, model, resp.text[:200])
                last_error = f"http_{resp.status_code}"
                continue
        except requests.exceptions.Timeout:
            _log.error("[OPENROUTER-VISION] TIMEOUT on %s", model)
            last_error = "timeout"
            continue
        except Exception as exc:
            _log.error("[OPENROUTER-VISION] %s on %s", exc, model)
            last_error = str(exc)
            continue
    
    # Fallback: Use text model with extracted features
    _log.warning("[OPENROUTER-VISION] Vision models failed, using text fallback with features")
    text_prompt = f"""{system_prompt}

IMPORTANT: The image could not be processed by vision API. Use these EXTRACTED IMAGE FEATURES instead:

{features}

Based on these features, make your best guess about the outfit. For style_score, use a reasonable estimate between 70-85.
Return the SAME JSON format as requested above. If unsure about specific items, describe what's plausible for the given colors."""
    
    text_models = [OPENROUTER_TEXT_MODEL] + [m for m in OPENROUTER_FALLBACK_MODELS if m != OPENROUTER_TEXT_MODEL]
    for model in text_models:
        payload = {
            "model": model,
            "messages": [{"role": "user", "content": text_prompt}],
            "max_tokens": CIPHER_MAX_TOKENS,
            "temperature": temperature,
        }
        try:
            _log.info("[OPENROUTER-VISION-FALLBACK] Trying text model=%s", model)
            resp = requests.post(OPENROUTER_API_URL, json=payload, headers=headers, timeout=30)
            if resp.status_code == 200:
                raw = resp.json()["choices"][0]["message"]["content"]
                match = re.search(r"\{[\s\S]*\}", raw)
                if match:
                    _log.info("[OPENROUTER-VISION-FALLBACK] Success with %s", model)
                    result = json.loads(match.group(0))
                    result["source"] = "text_fallback"
                    return result
        except Exception as exc:
            _log.error("[OPENROUTER-VISION-FALLBACK] %s on %s", exc, model)
            continue
    
    if last_error:
        _log.error("[OPENROUTER-VISION] All models failed, last error: %s", last_error)
    return None

def call_groq_text(messages: List[Dict[str, str]], system_prompt: str = "", temperature: float = 0.7) -> Optional[Dict[str, Any]]:
    if not OPENROUTER_API_KEY:
        return None
    headers = {"Content-Type": "application/json", "Authorization": f"Bearer {OPENROUTER_API_KEY}", "HTTP-Referer": "https://luxor.ly", "X-Title": "LuxorHub"}
    
    models_to_try = [OPENROUTER_TEXT_MODEL] + [m for m in OPENROUTER_FALLBACK_MODELS if m != OPENROUTER_TEXT_MODEL]
    
    for model in models_to_try:
        groq_messages = []
        if system_prompt:
            groq_messages.append({"role": "system", "content": system_prompt})
        groq_messages.extend(messages)
        payload = {
            "model": model,
            "messages": groq_messages,
            "max_tokens": CIPHER_MAX_TOKENS,
            "temperature": temperature,
        }
        try:
            _log.info("[OPENROUTER-TEXT] Trying model=%s", model)
            resp = requests.post(OPENROUTER_API_URL, json=payload, headers=headers, timeout=15)
            _log.info("[OPENROUTER-TEXT] HTTP %s for %s (key=%s...)", resp.status_code, model, OPENROUTER_API_KEY[:8] if OPENROUTER_API_KEY else "NONE")
            if resp.status_code == 200:
                raw = resp.json()["choices"][0]["message"]["content"]
                match = re.search(r"\{[\s\S]*\}", raw)
                if match:
                    return json.loads(match.group(0))
            elif resp.status_code == 429:
                _log.warning("[OPENROUTER-TEXT] Rate limited on %s, trying next", model)
                continue
            else:
                _log.error("[OPENROUTER-TEXT] HTTP %s from %s: %s", resp.status_code, model, resp.text[:200])
                continue
        except Exception as exc:
            _log.error("[OPENROUTER-TEXT] %s on %s", exc, model)
            continue
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
        if blob_put is None:
            _log.error("[BLOB] vercel_blob not available (import failed)")
            return None
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
        result = call_groq_vision(image_b64, SACRED_PROMPT, 0.2)
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
        val = result.get(key, "")
        if val and val != "None" and val.lower() != "none":
            items_detected.append(val)
    actual_colors = result.get("actual_colors", [])
    if not actual_colors or not isinstance(actual_colors, list):
        color_map = {"Pink": "Pink", "Red": "Red", "Blue": "Blue", "Black": "Black", "White": "White", "Cream": "Cream", "Green": "Green", "Brown": "Brown", "Gold": "Gold", "Silver": "Silver", "Grey": "Grey", "Navy": "Navy", "Tan": "Tan", "Beige": "Beige", "Yellow": "Yellow"}
        actual_colors = []
        for item in items_detected:
            for name, val in color_map.items():
                if name.lower() in item.lower() and val not in actual_colors:
                    actual_colors.append(val)
        if not actual_colors:
            actual_colors = ["Black", "White"]
    strengths = result.get("strengths", [])
    if not strengths or not isinstance(strengths, list) or len(strengths) < 3:
        detected = [s for s in [result.get(k, "") for k in ["top_type", "bottom_type", "footwear", "accessories"]] if s and s != "None"]
        strengths = []
        if detected:
            for i, d in enumerate(detected[:3]):
                strengths.append(f"Well-chosen {d}")
        while len(strengths) < 3:
            strengths.append("Cohesive outfit coordination")
    style_score = result.get("style_score")
    if style_score is None or not isinstance(style_score, (int, float)) or style_score < 60:
        style_score = 78
    style_score = int(round(style_score))
    style_name = result.get("style_name", "")
    if not style_name:
        style_name = "Modern Classic"
    return {"success": True, "source": result.get("source", "unknown"), "style_name": style_name, "style_score": style_score, "gender": result.get("gender", "Female"), "actual_colors": actual_colors, "items_detected": items_detected, "strengths": strengths, "audit": result.get("audit", "A well-coordinated outfit with balanced styling."), "tweak_plan": result.get("tweak_plan", "Consider adding a structured blazer for a more polished look."), "generation_prompt": result.get("generation_prompt", "A fashion-forward person wearing a stylish outfit in an editorial setting.")}
@app.route("/api/v1/analyze-outfit", methods=["POST", "OPTIONS"])
def analyze_outfit():
    if request.method == "OPTIONS":
        return "", 204
    data = request.get_json(silent=True) or {}
    image_b64 = data.get("image_b64")
    if not image_b64:
        return jsonify({"error": "Missing image_b64"}), 400
    try:
        result = get_fashion_decision(image_b64)
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
    headers = {"Content-Type": "application/json", "Authorization": f"Bearer {OPENROUTER_API_KEY}", "HTTP-Referer": "https://luxor.ly", "X-Title": "LuxorHub"}
    features = _extract_image_features(image_b64)
    models_to_try = [OPENROUTER_MODEL] + OPENROUTER_FALLBACK_MODELS
    for model in models_to_try:
        payload = {"model": model, "messages": [{"role": "user", "content": [{"type": "text", "text": SACRED_PROMPT + "\n\nExtracted image features: " + features}, {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{compressed}", "detail": "low"}}]}], "max_tokens": CIPHER_MAX_TOKENS, "temperature": 0.2}
        try:
            resp = requests.post(OPENROUTER_API_URL, json=payload, headers=headers, timeout=120)
            if resp.status_code == 200:
                return jsonify({"status": "success", "code": 200, "model": model, "raw": resp.json()})
            elif resp.status_code == 429:
                continue
            return jsonify({"status": "error", "code": resp.status_code, "model": model, "text": resp.text[:500]})
        except Exception as e:
            continue
    
    # Text fallback for debug
    text_prompt = f"{SACRED_PROMPT}\n\nVision API unavailable. Using extracted features:\n{features}\n\nReturn the JSON as requested."
    payload = {"model": OPENROUTER_TEXT_MODEL, "messages": [{"role": "user", "content": text_prompt}], "max_tokens": CIPHER_MAX_TOKENS}
    try:
        resp = requests.post(OPENROUTER_API_URL, json=payload, headers=headers, timeout=30)
        return jsonify({"status": "success" if resp.status_code == 200 else "error", "code": resp.status_code, "model": "text_fallback", "raw": resp.json() if resp.status_code == 200 else {}, "text": resp.text[:500] if resp.status_code != 200 else ""})
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
        "openrouter_configured": bool(OPENROUTER_API_KEY), "openrouter_key_prefix": OPENROUTER_API_KEY[:8] if OPENROUTER_API_KEY else "",
        "blob_configured": bool(BLOB_READ_WRITE_TOKEN),
        "qdrant_configured": bool(QDRANT_URL and QDRANT_API_KEY),
        "closet_items": closet_count,
    })

# ---------------------------------------------------------------------------
# Entrypoint
# ---------------------------------------------------------------------------
