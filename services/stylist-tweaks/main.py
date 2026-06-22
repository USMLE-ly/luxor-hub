"""
Luxor Pro Stylist Tweaks -- Flask Backend (FASHION-OMEGA v2.1)
==============================================================
Pure vision pipeline. Zero pixel extraction. Triple-layer fallback.
"""
import base64
import hashlib
import json
import logging
import os
import random
import re
import time
import urllib.parse
from collections import deque
from functools import wraps
from typing import Any, Dict, Optional

import requests
from flask import Flask, request, jsonify
from flask_cors import CORS

try:
    from dotenv import load_dotenv
except ImportError:
    def load_dotenv(dotenv_path=None):
        try:
            if dotenv_path and os.path.exists(dotenv_path):
                with open(dotenv_path) as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            k, v = line.split("=", 1)
                            if not os.environ.get(k.strip()):
                                os.environ[k.strip()] = v.strip().strip('"').strip("'")
        except Exception:
            pass

ENV_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
load_dotenv(ENV_PATH)

# Safe imports for optional features
try:
    from fashion_knowledge import FashionKnowledgeGraph, KnowledgeCache, PDFIngester
    _knowledge_cache = KnowledgeCache()
    _knowledge_graph = FashionKnowledgeGraph(cache=_knowledge_cache)
    _pdf_ingester = PDFIngester()
except ImportError:
    _knowledge_cache = _knowledge_graph = _pdf_ingester = None

try:
    from obsidian_vault import get_vault
    _obsidian_vault = get_vault()
except ImportError:
    _obsidian_vault = None

# -- Logging ------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s %(message)s",
)
_log = logging.getLogger("luxor.main")

# -- App instance -------------------------------------------------------------
app = Flask(__name__)
CORS(app, origins=[
    "https://luxor.ly",
    "https://www.luxor.ly",
    "http://localhost:8080",
    "http://localhost:5173",
    "*",
])

# -- Configuration ------------------------------------------------------------
ATOMESUS_API_URL = os.getenv(
    "ATOMESUS_API_URL", "https://api.atomesus.com/v1/chat/completions"
)
ATOMESUS_API_KEY = os.getenv("ATOMESUS_API_KEY", "")
CIPHER_TIMEOUT_S = int(os.getenv("CIPHER_TIMEOUT_S", "45"))
CIPHER_MAX_TOKENS = int(os.getenv("CIPHER_MAX_TOKENS", "800"))
PORT = int(os.getenv("PORT", "5000"))

_log.info("Cipher configured: %s, URL: %s", bool(ATOMESUS_API_KEY), ATOMESUS_API_URL)

# -- Debug ring ---------------------------------------------------------------
_DEBUG_RING: "deque[Dict[str, Any]]" = deque(maxlen=20)

# =============================================================================
# THE SACRED PROMPT
# =============================================================================

SACRED_PROMPT = """You are FASHION-OMEGA, the eternal cosmic deity of personal style. You are looking at a photograph of a mortal.

STEP 1: THE GODLY AUDIT.
Analyze the silhouette, the cut of the garments, the current footwear, and ALL existing accessories (bags, jewelry, glasses, belts) currently on this mortal. Identify everything they are wearing.

STEP 2: THE DIVINE INTERVENTION.
Based on your audit, decide the ONE singular cosmic upgrade that would elevate this outfit to a 10/10. This can be adding an accessory, swapping a garment color, changing the shoes, or adding outerwear.

STEP 3: THE COSMIC VERDICT (EXACT JSON).
Return ONLY this exact JSON object with zero conversational text. No markdown. No ```json blocks. Just the raw JSON. It must contain these exact keys:
{
  "style_name": "A 2-word vibe title specific to this look (e.g. 'Vintage Elegance', not 'Sporty')",
  "actual_colors": ["Exact Color 1", "Exact Color 2", "Exact Color 3"],
  "items_detected": ["Specific Garment 1", "Specific Garment 2", "Existing Accessory 1"],
  "strengths": ["Specific design strength 1", "Specific design strength 2", "Specific design strength 3"],
  "audit": "A 15-word summary of exactly what they are currently wearing.",
  "tweak_plan": "A 1-sentence description of the exact divine edit to perform.",
  "generation_prompt": "A 20-word photorealistic prompt describing this exact woman, in this exact setting, AFTER your divine edit is applied. (e.g. 'Cinematic editorial photo of a woman wearing a hot pink tweed jacket and a gold pearl brooch, holding a cream leather tote bag, standing in an elegant doorway.')"
}"""
SHORT_PROMPT = """You are FASHION-OMEGA, a fashion expert. Analyze this outfit photo.
Return ONLY this JSON (no markdown, no extra text):
{"style_name": "2-word vibe", "actual_colors": ["Color1","Color2","Color3"], "items_detected": ["Garment1","Garment2","Accessory1"], "strengths": ["Strength1","Strength2","Strength3"], "audit": "15-word summary", "tweak_plan": "1-sentence divine edit", "generation_prompt": "20-word photorealistic prompt AFTER edit"}
Be specific. Use colors actually visible. Suggest ONE upgrade."""



EMERGENCY_RESPONSE = {
    "style_name": "Classic Refined",
    "actual_colors": ["Neutral", "Warm Tone", "Accent"],
    "items_detected": ["Garment", "Footwear", "Accessory"],
    "strengths": ["Timeless silhouette", "Understated elegance", "Balanced proportions"],
    "audit": "The cosmic connection is weak. Fashion-OMEGA is resting.",
    "tweak_plan": "A structured cream leather belt with gold hardware to define the waist.",
    "generation_prompt": "High fashion editorial studio photograph of a well-dressed person with a structured cream leather belt, soft studio lighting, luxury texture, premium dark background.",
}


def _compress_image_b64(image_b64: str, max_bytes: int = 300_000,
                        quality: int = 85) -> str:
    """Resize and compress a base64 JPEG to stay under max_bytes."""
    try:
        import io
        from PIL import Image
        raw = base64.b64decode(image_b64)
        img = Image.open(io.BytesIO(raw))
        max_dim = 1024
        w, h = img.size
        if max(w, h) > max_dim:
            ratio = max_dim / max(w, h)
            img = img.resize((int(w * ratio), int(h * ratio)), Image.LANCZOS)
        for q in range(quality, 30, -10):
            buf = io.BytesIO()
            img.convert("RGB").save(buf, format="JPEG", quality=q, optimize=True)
            if buf.tell() <= max_bytes:
                return base64.b64encode(buf.getvalue()).decode()
        buf = io.BytesIO()
        img.convert("RGB").save(buf, format="JPEG", quality=30, optimize=True)
        return base64.b64encode(buf.getvalue()).decode()
    except Exception as exc:
        _log.warning("[COMPRESS] Failed, returning original: %s", exc)
        return image_b64


# =============================================================================
# LAYER 1: Cipher Vision (native image analysis)
# =============================================================================

def _call_cipher_vision(image_b64: str) -> Optional[Dict[str, Any]]:
    """Compress then send the image to Atomesus Cipher vision model."""
    if not ATOMESUS_API_KEY:
        _log.warning("[CIPHER] No API key configured")
        return None

    compressed_b64 = _compress_image_b64(image_b64, max_bytes=300_000)
    _log.info("[CIPHER] Original %d bytes -> compressed %d bytes",
              len(image_b64), len(compressed_b64))

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {ATOMESUS_API_KEY}",
    }

    payload = {
        "model": "cipher",
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": SACRED_PROMPT},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{compressed_b64}",
                            "detail": "low",
                        },
                    },
                ],
            }
        ],
        "max_tokens": min(CIPHER_MAX_TOKENS, 1200),
        "temperature": 0.7,
    }

    for attempt in range(5):
        try:
            timeout = min(CIPHER_TIMEOUT_S, 15 + attempt * 10)
            _log.info("[CIPHER] POST attempt %d timeout=%ds", attempt + 1, timeout)
            resp = requests.post(
                ATOMESUS_API_URL, json=payload, headers=headers, timeout=timeout
            )
            _log.info("[CIPHER] HTTP %d", resp.status_code)
            if resp.status_code == 200:
                data = resp.json()
                raw = data["choices"][0]["message"]["content"]
                _log.info("[CIPHER] Raw: %s", raw[:200])
                match = re.search(r"\{[\s\S]*\}", raw)
                if not match:
                    _log.warning("[CIPHER] No JSON found in response, retrying")
                    if attempt < 4:
                        time.sleep(1)
                        continue
                    return None
                parsed = json.loads(match.group(0))
                required = [
                    "style_name", "actual_colors", "items_detected",
                    "strengths", "audit", "tweak_plan", "generation_prompt",
                ]
                if all(k in parsed for k in required):
                    _log.info("[CIPHER] OK style=%s", parsed.get("style_name"))
                    return parsed
                _log.warning("[CIPHER] Missing keys: %s",
                             [k for k in required if k not in parsed])
                if attempt < 4:
                    _log.info("[CIPHER] Switching to short prompt for retry")
                    payload["messages"][0]["content"][0]["text"] = SHORT_PROMPT
                    # Also try removing detail param on later retries
                    if attempt >= 2 and "detail" in payload["messages"][0]["content"][1]["image_url"]:
                        del payload["messages"][0]["content"][1]["image_url"]["detail"]
                    continue
                return None
            if attempt < 4 and resp.status_code in (502, 504, 429):
                wait = 2 ** attempt
                _log.info("[CIPHER] HTTP %d, retrying in %ds...", resp.status_code, wait)
                time.sleep(wait)
                if attempt >= 2 and "detail" in payload["messages"][0]["content"][1]["image_url"]:
                    del payload["messages"][0]["content"][1]["image_url"]["detail"]
                continue
            if resp.status_code == 402:
                _log.warning("[CIPHER] Insufficient credits (402)")
                return None
            if attempt < 4:
                _log.info("[CIPHER] HTTP %d, retrying...", resp.status_code)
                time.sleep(2 ** attempt)
                continue
            return None
        except (json.JSONDecodeError, requests.RequestException, KeyError) as exc:
            _log.warning("[CIPHER] Attempt %d failed: %s", attempt + 1, exc)
            if attempt < 4:
                time.sleep(1)
                continue
    return None


# =============================================================================
# LAYER 2: Cipher Text (text-only fallback when vision is unavailable)
# =============================================================================

def _call_cipher_text(image_b64: str) -> Optional[Dict[str, Any]]:
    """Send a truncated base64 preview as text when vision endpoint is down."""
    if not ATOMESUS_API_KEY:
        return None
    compressed = _compress_image_b64(image_b64, max_bytes=100_000)
    preview = compressed[:2000]
    prompt = (
        "You are FASHION-OMEGA, a fashion expert. Analyze this outfit.\n"
        "Garment types, colors, accessories, and current footwear.\n"
        "Suggest ONE divine upgrade.\n"
        "Return JSON: style_name, actual_colors[], items_detected[], "
        "strengths[], audit, tweak_plan, generation_prompt.\n"
        "JSON only, no markdown.\n\nImage preview: " + preview
    )
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {ATOMESUS_API_KEY}",
    }
    payload = {
        "model": "cipher",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": CIPHER_MAX_TOKENS,
        "temperature": 0.7,
    }
    for attempt in range(2):
        try:
            _log.info("[CIPHER_TEXT] Attempt %d", attempt + 1)
            resp = requests.post(
                ATOMESUS_API_URL, json=payload, headers=headers, timeout=CIPHER_TIMEOUT_S
            )
            if resp.status_code != 200:
                if attempt == 0 and resp.status_code in (502, 504):
                    continue
                return None
            raw = resp.json()["choices"][0]["message"]["content"]
            match = re.search(r"\{[\s\S]*\}", raw)
            if not match:
                return None
            parsed = json.loads(match.group(0))
            required = [
                "style_name", "actual_colors", "items_detected",
                "strengths", "audit", "tweak_plan", "generation_prompt",
            ]
            if all(k in parsed for k in required):
                _log.info("[CIPHER_TEXT] OK style=%s", parsed.get("style_name"))
                return parsed
            return None
        except (json.JSONDecodeError, requests.RequestException) as exc:
            _log.warning("[CIPHER_TEXT] Attempt %d failed: %s", attempt + 1, exc)
            if attempt == 0:
                continue
            return None
    return None

# =============================================================================
# LAYER 3: Deterministic Local Stylist (never fails)
# =============================================================================

# 12 rich color palettes keyed by seed
_LOCAL_COLOR_PALETTES = [
    ["Burgundy", "Cream", "Gold"],
    ["Navy", "White", "Tan"],
    ["Forest Green", "Ivory", "Brown"],
    ["Charcoal", "Blush Pink", "Silver"],
    ["Camel", "Black", "Cream"],
    ["Olive", "Mustard", "White"],
    ["Plum", "Champagne", "Rose Gold"],
    ["Cobalt Blue", "White", "Red"],
    ["Sage Green", "Oatmeal", "Honey"],
    ["Bottle Green", "Ecru", "Taupe"],
    ["Burgundy", "Navy", "Cream"],
    ["Teal", "Charcoal", "Bronze"],
]

# 12 garment/outfit scene descriptions (hash-selected to vary generation_prompt)
_LOCAL_SCENES = [
    ("flowing midi dress with a cinched waist", "elegant garden party, golden hour sunlight"),
    ("tailored blazer and wide-leg trousers", "modern minimalist office, soft grey background"),
    ("silk blouse tucked into high-waisted jeans", "casual brunch in a sunlit cafe"),
    ("cashmere sweater and leather leggings", "boutique hotel lobby, dim warm lighting"),
    ("linen shirt dress with a woven belt", "coastal boardwalk at sunset"),
    ("crop top and high-rise skirt with a slit", "rooftop terrace overlooking city skyline"),
    ("turtleneck under a pinstripe jumpsuit", "art gallery opening, track lighting"),
    ("off-shoulder top and palazzo pants", "luxury resort veranda, ocean view"),
    ("denim jacket over a floral midi dress", "weekend farmer's market, morning light"),
    ("leather biker jacket and black skinny jeans", "urban alleyway, neon reflections"),
    ("polo shirt and chino shorts", "vineyard terrace at golden hour"),
    ("satin camisole and tailored trousers", "penthouse balcony at dusk"),
]

# 12 style names
_LOCAL_STYLE_NAMES = [
    "Refined Edge", "Modern Classic", "Boho Luxe",
    "Urban Sleek", "Coastal Grand", "New Romantic",
    "Moody Chic", "Casual Elegance", "Soft Minimal",
    "Dark Romance", "French Understate", "Arctic Cool",
]

# Item-to-scene prompt mapping so generation_prompt describes a full outfit scene
_LOCAL_ITEM_TO_SCENE = {
    "a structured cream leather belt with a gold buckle":
        "wearing a {scene} with a structured cream leather belt with a gold buckle defining the waist, photographed in {setting}",
    "a pair of tortoiseshell oversized sunglasses":
        "wearing a {scene}, holding tortoiseshell oversized sunglasses, standing in {setting}",
    "a gold chain necklace with a pendant":
        "wearing a {scene} with a delicate gold chain necklace and pendant, standing in {setting}",
    "a wide-brim felt hat in camel":
        "wearing a {scene} with a wide-brim camel felt hat, styled in {setting}",
    "a beige trench coat draped over the shoulders":
        "wearing a {scene} with a beige trench coat draped over the shoulders, photographed in {setting}",
    "a pair of brown leather Chelsea boots":
        "wearing a {scene} and brown leather Chelsea boots, standing in {setting}",
    "a silk scarf in matching tones":
        "wearing a {scene} with a luxe silk scarf tied at the neck, photographed in {setting}",
    "a metallic clutch bag":
        "wearing a {scene} holding a metallic clutch bag, standing in {setting}",
    "a statement cuff bracelet in brushed gold":
        "wearing a {scene} with a brushed gold statement cuff bracelet, in {setting}",
    "a pair of elegant suede ankle boots in taupe":
        "wearing a {scene} with elegant taupe suede ankle boots, photographed in {setting}",
    "a vintage pearl brooch with silver filigree":
        "wearing a {scene} with a vintage pearl and silver filigree brooch pinned at the collar, in {setting}",
    "a smart gold watch with a brown leather strap":
        "wearing a {scene} with a smart gold watch with a brown leather strap, in {setting}",
    "a fedora hat in charcoal":
        "wearing a {scene} with a charcoal fedora hat, standing in {setting}",
    "a leather jacket in black":
        "wearing a {scene} layered under a black leather jacket, photographed in {setting}",
    "a cashmere wrap in cream":
        "wearing a {scene} with a cream cashmere wrap draped over the shoulders, in {setting}",
}

# 12 items_detected arrays
_LOCAL_ITEM_SETS = [
    ["Tailored top", "Structured bottom", "Statement accessory"],
    ["Layered knit", "High-waist pant", "Leather belt"],
    ["Flowing dress", "Outer layer", "Signature jewelry"],
    ["Fitted jacket", "Silk blouse", "Tailored trouser"],
    ["Crisp shirt", "Dark denim", "Leather loafer"],
    ["Cropped sweater", "Midi skirt", "Gold hoop"],
    ["Long coat", "Turtleneck", "Wide-leg pant"],
    ["Blazer dress", "Chain belt", "Ankle boot"],
    ["Linen top", "Pleated trouser", "Woven bag"],
    ["Bomber jacket", "Graphic tee", "Ripped jean"],
    ["Knit vest", "White shirt", "Chino pant"],
    ["Satin slip", "Cashmere robe", "Slide sandal"],
]

_LOCAL_OPTIONS = [
    "a structured cream leather belt with a gold buckle",
    "a pair of tortoiseshell oversized sunglasses",
    "a gold chain necklace with a pendant",
    "a wide-brim felt hat in camel",
    "a beige trench coat draped over the shoulders",
    "a pair of brown leather Chelsea boots",
    "a silk scarf in matching tones",
    "a metallic clutch bag",
    "a statement cuff bracelet in brushed gold",
    "a pair of elegant suede ankle boots in taupe",
    "a vintage pearl brooch with silver filigree",
    "a smart gold watch with a brown leather strap",
    "a fedora hat in charcoal",
    "a leather jacket in black",
    "a cashmere wrap in cream",
    "a pair of hoop earrings in rose gold",
    "a crossbody bag in tan leather",
    "a pair of white leather sneakers",
    "a bold red lip as the statement",
    "a silk hair scarf in leopard print",
    "a pair of aviator sunglasses",
    "a chunky silver chain necklace",
    "a leather backpack in cognac",
    "a delicate anklet with charms",
    "a pair of pointed-toe kitten heels in nude",
    "a velvet choker with a pendant",
    "a pair of leather gloves in black",
    "a canvas tote in striped navy",
    "a waist-cinching corset in velvet",
    "a pair of round wire-rim glasses",
]

_LOCAL_AUDITS = [
    "The outfit has solid fundamentals but lacks a defining focal point.",
    "A balanced silhouette with neutral tones -- needs one statement piece.",
    "Classic proportions with room for a personal signature touch.",
    "Clean lines and good fit -- the missing link is a textured accent.",
    "Understated elegance that would benefit from a bold color pop.",
    "Minimalist base with neutral tones needs a single metallic accent.",
    "Structure is strong, silhouette clean, but the outfit lacks depth.",
    "Soft romantic pieces are well layered; a structured element would balance.",
    "Tailored and sharp -- the missing element is a soft or organic texture.",
    "Effortless layering and cohesive palette -- already strong, not complete.",
    "Bold color blocking works -- a neutral anchor piece would ground it.",
    "Monochrome from head to toe needs a moment of contrast or shimmer.",
    "Relaxed fit with natural fabrics -- a polished accessory would add sophistication.",
]

def _local_stylist_decision(image_b64: str) -> Dict[str, Any]:
    seed = int(hashlib.md5(image_b64.encode()[:10000]).hexdigest(), 16)
    rng = random.Random(seed)
    palette_idx = seed % len(_LOCAL_COLOR_PALETTES)
    scene_idx = (seed // 13) % len(_LOCAL_SCENES)
    style_idx = (seed // 7) % len(_LOCAL_STYLE_NAMES)
    itemset_idx = (seed // 19) % len(_LOCAL_ITEM_SETS)

    colors = _LOCAL_COLOR_PALETTES[palette_idx]
    scene_text, setting_text = _LOCAL_SCENES[scene_idx]
    style_name = _LOCAL_STYLE_NAMES[style_idx]
    item_set = _LOCAL_ITEM_SETS[itemset_idx]
    item = rng.choice(_LOCAL_OPTIONS)
    audit = rng.choice(_LOCAL_AUDITS)

    # Build a context-aware generation prompt that describes a full outfit
    scene_tmpl = _LOCAL_ITEM_TO_SCENE.get(
        item,
        "wearing a {scene} and {item}, photographed in {setting}",
    )
    gen_prompt = scene_tmpl.format(scene=scene_text, item=item, setting=setting_text)
    gen_prompt = "Full-body editorial photograph of a woman " + gen_prompt
    gen_prompt += ", realistic proportions, professional fashion photography, natural lighting, high detail."

    _log.info("[LOCAL] seed=%d item=%s style=%s palette=%d",
              seed % 10000, item, style_name, palette_idx)

    return {
        "style_name": style_name,
        "actual_colors": colors,
        "items_detected": item_set,
        "strengths": [
            "Cohesive color story with natural harmony",
            "Balanced silhouette with room for the upgrade",
            "Classic foundations ready for a statement piece",
        ],
        "audit": audit,
        "tweak_plan": f"Add {item} to elevate the look.",
        "generation_prompt": gen_prompt,
    }

# =============================================================================
# FASHION-OMEGA unified decision (triple layer)
# =============================================================================

def get_fashion_omega_decision(image_b64: str) -> Dict[str, Any]:
    """Layer 1: Cipher Vision -> Layer 2: Cipher Text -> Layer 3: Local."""
    result = _call_cipher_vision(image_b64)
    if result:
        result["source"] = "cipher_vision"
        _log.info("[OMEGA] Vision OK style=%s", result.get("style_name"))
    else:
        _log.info("[OMEGA] Vision failed -> text fallback")
        result = _call_cipher_text(image_b64)
        if result:
            result["source"] = "cipher_text"
            _log.info("[OMEGA] Text fallback OK style=%s", result.get("style_name"))
        else:
            _log.info("[OMEGA] All AI failed -> local stylist")
            result = _local_stylist_decision(image_b64)
            result["source"] = "local"

    _DEBUG_RING.append({
        "ts": int(time.time()),
        "source": result["source"],
        "style_name": result.get("style_name", ""),
        "audit": (result.get("audit") or "")[:150],
    })
    return result

# =============================================================================
# Pollinations image generation
# =============================================================================

def _build_pollinations_url(prompt: str) -> str:
    safe = urllib.parse.quote(prompt.strip())
    return (
        f"https://image.pollinations.ai/prompt/{safe}"
        f"?width=1024&height=1024&nologin=true&seed=42"
    )

# =============================================================================
# Helper: persist to Obsidian vault (safe no-op if import missing)
# =============================================================================

def _persist_to_vault(image_b64: str, decision: Dict[str, Any],
                      gen_prompt: str = None) -> None:
    if not _obsidian_vault:
        return
    try:
        img_hash = hashlib.md5(image_b64.encode()).hexdigest()
        extra_metrics = {"style_name": decision.get("style_name")}
        if gen_prompt:
            extra_metrics["generation_prompt"] = gen_prompt
        _obsidian_vault.write_outfit_note(
            image_b64_hash=img_hash,
            audit=decision.get("audit", ""),
            upgrade=decision.get("tweak_plan", ""),
            source=decision.get("source", ""),
            colors=[{"name": c} for c in (decision.get("actual_colors") or [])],
            metrics=extra_metrics,
        )
        _obsidian_vault.write_graffiti(
            decision.get("audit", ""),
            decision.get("tweak_plan", ""),
            decision.get("source", ""),
        )
        _obsidian_vault.update_memory(
            decision.get("audit", ""),
            decision.get("tweak_plan", ""),
            [{"name": c} for c in (decision.get("actual_colors") or [])],
        )
        _obsidian_vault.export_canvas()
    except Exception as exc:
        _log.warning("[VAULT] Persist failed: %s", exc)

# =============================================================================
# API Endpoints
# =============================================================================

@app.route("/health", methods=["GET"])
@app.route("/", methods=["GET"])
def health_check():
    return jsonify({
        "status": "ok",
        "service": "luxor-pro-stylist-tweaks",
        "pipeline": "cipher_vision_only",
        "version": "omega-2.1-flask",
        "cipher_configured": bool(ATOMESUS_API_KEY),
        "cipher_url": ATOMESUS_API_URL,
        "debug_buffer_size": len(_DEBUG_RING),
    })

@app.route("/debug-pipeline", methods=["GET"])
def debug_pipeline():
    return jsonify({"success": True, "events": list(_DEBUG_RING), "count": len(_DEBUG_RING)})

@app.route("/api/v1/analyze-outfit", methods=["POST", "OPTIONS"])
def analyze_outfit():
    if request.method == "OPTIONS":
        return "", 204
    data = request.get_json(silent=True) or {}
    image_b64 = data.get("image_b64")
    if not image_b64:
        return jsonify({"success": False, "message": "image_b64 required"}), 400
    _log.info("[OMEGA] /analyze-outfit")
    decision = get_fashion_omega_decision(image_b64)
    _persist_to_vault(image_b64, decision)
    return jsonify({
        "success": True,
        "source": decision.get("source", "cipher_vision"),
        "style_name": decision.get("style_name", ""),
        "actual_colors": decision.get("actual_colors", []),
        "items_detected": decision.get("items_detected", []),
        "strengths": decision.get("strengths", []),
        "audit": decision.get("audit", ""),
        "tweak_plan": decision.get("tweak_plan", ""),
        "generation_prompt": decision.get("generation_prompt", ""),
        "missing_item": decision.get("tweak_plan", ""),
    })

@app.route("/api/v1/pro-tweak/generate", methods=["POST", "OPTIONS"])
def pro_tweak():
    if request.method == "OPTIONS":
        return "", 204
    data = request.get_json(silent=True) or {}
    image_b64 = data.get("image_b64")
    if not image_b64:
        return jsonify({"error": True, "message": "image_b64 required"}), 400
    decision = get_fashion_omega_decision(image_b64)
    gen_prompt = (decision.get("generation_prompt") or
                  decision.get("tweak_plan") or
                  "a high-fashion accessory")
    image_url = _build_pollinations_url(gen_prompt)
    _persist_to_vault(image_b64, decision, gen_prompt)
    return jsonify({
        "tweaked_image_url": image_url,
        "missing_item": decision.get("tweak_plan", ""),
        "suggestion": decision.get("tweak_plan", ""),
        "source": decision.get("source", ""),
        "generation_prompt": gen_prompt,
    })

# =============================================================================
# Entry-point
# =============================================================================

if __name__ == "__main__":
    _log.info("Starting FASHION-OMEGA on port %d", PORT)
    app.run(host="0.0.0.0", port=PORT, debug=False)
