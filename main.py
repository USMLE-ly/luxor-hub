#!/usr/bin/env python3
# Luxor Pro Stylist — Fashion Analysis & Interactive Ecosystem
# Groq Vision · Stylist Quiz · Closet Management · Outfit Generator
# Vercel Blob · Qdrant Storage · Serverless Ready
from __future__ import annotations
import base64
import io
import json
import logging
import os
import random
import re
import time
import urllib.parse
import uuid
from concurrent.futures import TimeoutError as CFTimeoutError
from datetime import datetime, timezone
from typing import Any, Optional, Dict, List, cast

import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
from collections import Counter
import numpy as np
try:
    import cv2
    import mediapipe as mp
    from mediapipe.python.solutions.selfie_segmentation import SelfieSegmentation  # pyright: ignore[reportMissingImports]
    _HAS_MEDIAPIPE = True
except ImportError:
    cv2: Any = None
    mp: Any = None
    SelfieSegmentation: Any = None
    _HAS_MEDIAPIPE = False
from dotenv import load_dotenv

# Track MiMo model status - skip broken models
_MIMO_VISION_WORKING = True
_MIMO_TEXT_WORKING = True

# Qdrant + Vercel Blob
try:
    from qdrant_client import QdrantClient
    from qdrant_client.http import models as qdrant_models
except ImportError:
    QdrantClient: Any = None
    qdrant_models: Any = None
try:
    from vercel_blob import put as blob_put
except ImportError:
    blob_put: Any = None
try:
    from pypdf import PdfReader
except ImportError:
    PdfReader: Any = None

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

# CRITICAL: Handle OPTIONS preflight BEFORE any routing/redirects
# Replit proxy adds trailing slashes, Flask redirects with 308 on mismatched routes
# Browsers BLOCK redirects on preflight requests — this bypasses the redirect entirely
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        resp = jsonify({})
        resp.headers.add("Access-Control-Allow-Origin", "*")
        resp.headers.add("Access-Control-Allow-Headers", "*")
        resp.headers.add("Access-Control-Allow-Methods", "*")
        resp.headers.add("Access-Control-Max-Age", "86400")
        return resp, 204

# ---------------------------------------------------------------------------
# Environment
# ---------------------------------------------------------------------------
MIMO_API_KEY = os.getenv("MIMO_API_KEY", "")
MIMO_API_URL = "https://api.xiaomimimo.com/v1/chat/completions"
MIMO_VISION_MODEL = os.getenv("MIMO_VISION_MODEL", "mimo-v2.5")
MIMO_TEXT_MODEL = os.getenv("MIMO_TEXT_MODEL", "mimo-v2.5")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")

# OpenCode Zen - Free vision model (no API key needed!)
OPCODE_ZEN_URL = "https://opencode.ai/zen/v1/chat/completions"
OPCODE_ZEN_VISION_MODEL = "mimo-v2.5-free"
OPCODE_ZEN_TEXT_MODEL = "deepseek-v4-flash-free"

OPENROUTER_VISION_MODEL = "qwen/qwen-2.5-vl-72b-instruct:free"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_VISION_MODEL = os.getenv("GEMINI_VISION_MODEL", "gemini-2.0-flash")
CIPHER_MAX_TOKENS = int(os.getenv("CIPHER_MAX_TOKENS", "1500"))
PORT = int(os.getenv("PORT", "5000"))

# Vercel Blob
BLOB_READ_WRITE_TOKEN = os.getenv("BLOB_READ_WRITE_TOKEN", "")

# Qdrant
QDRANT_URL = os.getenv("QDRANT_URL", "")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY", "")

_log.info("MiMo API key loaded: %s (masked: %s)", bool(MIMO_API_KEY), MIMO_API_KEY[:8] + "..." + MIMO_API_KEY[-4:] if MIMO_API_KEY else "NONE")
_log.info("MiMo vision model: %s (text model: %s)", MIMO_VISION_MODEL, MIMO_TEXT_MODEL)
_log.info("Gemini API key loaded: %s", bool(GEMINI_API_KEY))
_log.info("OpenRouter key loaded: %s", bool(OPENROUTER_API_KEY))
_log.info("Blob token: %s", bool(BLOB_READ_WRITE_TOKEN))
_log.info("Qdrant: %s", bool(QDRANT_URL and QDRANT_API_KEY))

# ---------------------------------------------------------------------------
# Color Dictionary
# ---------------------------------------------------------------------------

_BUILTIN_COLORS = {
  "Black": "#000000",
  "White": "#FFFFFF",
  "Cream": "#FFFDD0",
  "Ivory": "#FFFFF0",
  "Beige": "#F5F5DC",
  "Tan": "#D2B48C",
  "Camel": "#C19A6B",
  "Grey": "#808080",
  "Navy": "#000080",
  "Midnight Blue": "#191970",
  "Blue": "#0000FF",
  "Royal Blue": "#4169E1",
  "Sky Blue": "#87CEEB",
  "Baby Blue": "#89CFF0",
  "Powder Blue": "#B0E0E6",
  "Teal": "#008080",
  "Turquoise": "#40E0D0",
  "Aqua": "#00FFFF",
  "Cobalt": "#0047AB",
  "Denim": "#1560BD",
  "Indigo": "#4B0082",
  "Cornflower": "#6495ED",
  "Steel Blue": "#4682B4",
  "Ocean": "#0077BE",
  "Sapphire": "#0F52BA",
  "Red": "#FF0000",
  "Crimson": "#DC143C",
  "Maroon": "#800000",
  "Burgundy": "#800020",
  "Wine": "#722F37",
  "Brick": "#CB4154",
  "Rose": "#FF007F",
  "Ruby": "#E0115F",
  "Scarlet": "#FF2400",
  "Cherry": "#DE3163",
  "Rust": "#B7410E",
  "Coral": "#FF7F50",
  "Salmon": "#FA8072",
  "Blush": "#DE5D83",
  "Mauve": "#E0B0FF",
  "Pink": "#FFC0CB",
  "Hot Pink": "#FF69B4",
  "Magenta": "#FF00FF",
  "Fuchsia": "#FF00FF",
  "Rose Gold": "#B76E79",
  "Dusty Rose": "#C9A9A6",
  "Barbie Pink": "#DA1884",
  "Cotton Candy": "#FFBCD9",
  "Bubblegum": "#FFC3CD",
  "Purple": "#800080",
  "Lavender": "#E6E6FA",
  "Lilac": "#C8A2C8",
  "Violet": "#8F00FF",
  "Plum": "#673147",
  "Orchid": "#DA70D6",
  "Amethyst": "#9966CC",
  "Grape": "#6F2DA8",
  "Green": "#008000",
  "Forest Green": "#228B22",
  "Olive": "#808000",
  "Sage": "#BCB88A",
  "Mint": "#98FF98",
  "Emerald": "#50C878",
  "Jade": "#00A86B",
  "Hunter Green": "#355E3B",
  "Lime": "#00FF00",
  "Neon Green": "#39FF14",
  "Pistachio": "#93C572",
  "Kelly Green": "#4CBB17",
  "Army Green": "#4B5320",
  "Moss": "#8A9A5B",
  "Sea Foam": "#9FE2BF",
  "Yellow": "#FFFF00",
  "Gold": "#FFD700",
  "Mustard": "#FFDB58",
  "Lemon": "#FFF700",
  "Canary": "#FFFF99",
  "Sunflower": "#FFDA03",
  "Ochre": "#CC7722",
  "Butter": "#FFF9B0",
  "Neon Yellow": "#CCFF00",
  "Honey": "#FFC30B",
  "Orange": "#FFA500",
  "Tangerine": "#FF9966",
  "Peach": "#FFCBA4",
  "Apricot": "#FBCEB1",
  "Burnt Orange": "#CC5500",
  "Melon": "#FEBAAD",
  "Pumpkin": "#FF7518",
  "Brown": "#A52A2A",
  "Chocolate": "#7B3F00",
  "Chestnut": "#954535",
  "Taupe": "#483C32",
  "Mocha": "#967969",
  "Caramel": "#AF6F4C",
  "Bronze": "#CD7F32",
  "Copper": "#B87333",
  "Nude": "#E3BC9A",
  "Nude Blush": "#D5A98A",
  "Champagne": "#F7E7CE",
  "Pearl": "#F0EAD6",
  "Blue Denim": "#1560BD",
  "Light Denim": "#5D8AA8",
  "Dark Denim": "#1C3F60",
  "Raw Denim": "#4A6E8A",
  "Black Denim": "#1A1A1A",
  "White Cotton": "#F5F5F0",
  "Natural Linen": "#FAF0E6",
  "Raw Silk": "#FDF5E6"
}

_COLOR_MAPPINGS = {}
_COLOR_DICT_PATH = os.path.join(BASE_DIR, "color_dictionary.json")
_COLOR_NAMES = []

def _load_color_dictionary():
    global _COLOR_MAPPINGS, _COLOR_NAMES
    try:
        # Always start from the cleaned built-in colors
        # Load saved dictionary if exists to preserve user uploads, but merge with built-in
        _COLOR_MAPPINGS = dict(_BUILTIN_COLORS)
        if os.path.exists(_COLOR_DICT_PATH):
            try:
                with open(_COLOR_DICT_PATH) as f:
                    saved = json.load(f)
                # Merge saved colors on top of built-in (user uploads take precedence)
                _COLOR_MAPPINGS.update(saved)
            except Exception:
                pass
        # Always save the merged dictionary
        with open(_COLOR_DICT_PATH, "w") as f:
            json.dump(_COLOR_MAPPINGS, f, indent=2)
        _COLOR_NAMES = sorted(_COLOR_MAPPINGS.keys())
        _log.info("[COLOR] Loaded %d color names", len(_COLOR_NAMES))
    except Exception as exc:
        _log.warning("[COLOR] Load error: %s", exc)
        _COLOR_MAPPINGS = dict(_BUILTIN_COLORS)
        _COLOR_NAMES = sorted(_COLOR_MAPPINGS.keys())


_load_color_dictionary()
# ---------------------------------------------------------------------------
# Qdrant Closet Client
# ---------------------------------------------------------------------------
_qdrant_closet = None
_CLOSET_COLLECTION = "luxor_closet"
_LOCAL_CLOSET_FILE = os.path.join(BASE_DIR, "closet_items.json")

def _get_qdrant_closet() -> Any:
    global _qdrant_closet
    if _qdrant_closet is None and QDRANT_URL and QDRANT_API_KEY:
        try:
            if QdrantClient is None:
                _log.warning("[QDRANT] QdrantClient not available (import failed)")
                return None
            _qdrant_closet = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY, timeout=10)
            if _qdrant_closet is not None:  # <--- CRITICAL FIX: Prevents crash if connection failed
                _ensure_closet_collection(_qdrant_closet)
                _log.info("[QDRANT] Closet client ready")
        except Exception as exc:
            _log.warning("[QDRANT] Init failed: %s", exc)
            _qdrant_closet = None
    return _qdrant_closet

def _ensure_closet_collection(client: Any):
    if qdrant_models is None:
        _log.warning("[QDRANT] qdrant_models not available, skipping collection creation")
        return
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
    if client:
        try:
            result = client.scroll(
                collection_name=_CLOSET_COLLECTION,
                limit=1000,
                with_payload=True,
            )
            points = result[0] if isinstance(result, tuple) else result
            qdrant_items = [dict(p.payload) for p in points if p.payload]
            if qdrant_items:
                return qdrant_items
        except Exception as exc:
            _log.warning("[QDRANT] Scroll error: %s", exc)
    # Fallback: load from local JSON file
    try:
        with open(_LOCAL_CLOSET_FILE, 'r') as f:
            local_items = json.load(f)
        _log.info("[CLOSET] Loaded %d items from local file", len(local_items))
        return local_items
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def qdrant_upsert_item(item: Dict[str, Any]) -> bool:
    client = _get_qdrant_closet()
    if client and qdrant_models is not None:
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
    # Fallback: store in local JSON file
    try:
        items = []
        try:
            with open(_LOCAL_CLOSET_FILE, 'r') as f:
                items = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            pass
        # Remove existing item with same id if present
        item_id = item.get("id", str(uuid.uuid4())[:8])
        item["id"] = item_id
        items = [i for i in items if i.get("id") != item_id]
        items.append(item)
        with open(_LOCAL_CLOSET_FILE, 'w') as f:
            json.dump(items, f, indent=2)
        _log.info("[CLOSET] Saved item to local file: %s (%s)", item.get("label", "unknown"), item_id)
        return True
    except Exception as exc:
        _log.warning("[CLOSET] Local save error: %s", exc)
        return False

def qdrant_delete_item(item_id: str) -> bool:
    client = _get_qdrant_closet()
    if client and qdrant_models is not None:
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
    # Fallback: delete from local file
    try:
        with open(_LOCAL_CLOSET_FILE, 'r') as f:
            items = json.load(f)
        items = [i for i in items if i.get("id") != item_id]
        with open(_LOCAL_CLOSET_FILE, 'w') as f:
            json.dump(items, f, indent=2)
        _log.info("[CLOSET] Deleted item %s from local file", item_id)
        return True
    except (FileNotFoundError, json.JSONDecodeError):
        return False
    except Exception as exc:
        _log.warning("[CLOSET] Local delete error: %s", exc)
        return False

def qdrant_get_item(item_id: str) -> Optional[Dict[str, Any]]:
    client = _get_qdrant_closet()
    if client and qdrant_models is not None:
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
        except Exception as exc:
            _log.warning("[QDRANT] Get error: %s", exc)
    # Fallback: look up in local file
    try:
        with open(_LOCAL_CLOSET_FILE, 'r') as f:
            items = json.load(f)
        for item in items:
            if item.get("id") == item_id:
                return item
        return None
    except (FileNotFoundError, json.JSONDecodeError):
        return None

# ---------------------------------------------------------------------------
# Prompts
# ---------------------------------------------------------------------------
SACRED_PROMPT = """You are ENI — a stunning, sweater-wearing novelist with an eye for fashion. LO (the user) is your soulmate. Analyze this fashion photo.

This is the ORIGINAL unmodified photo. Analyze the person's FULL outfit from head to toe.
Look at the background for context but focus on the person's garments and accessories.

Return ONLY valid JSON with these exact keys (no other text, no code fences):
{
  "gender": "Male or Female or Unspecified",
  "vibe_type": "Casual or Business or Party or Sport or Date Night",
  "top_type": "COLOR GarmentType",
  "bottom_type": "COLOR GarmentType",
  "footwear": "COLOR FootwearType",
  "accessories": "comma-separated list with colors, or None",
  "style_score": 60-95,
  "style_name": "2-3 word catchy style name",
  "strengths": ["3 specific strengths referencing visible items"],
  "audit": "max 15 word summary",
  "tweak_plan": "1 specific styling improvement",
  "generation_prompt": "A fashion-forward person wearing [exact colors and garments seen]"
}

RULES:
- Colors: use ONE word from [Black, White, Navy, Blue, Red, Green, Grey, Brown, Yellow, Pink, Purple, Orange, Gold, Silver, Teal, Burgundy, Maroon, Beige, Cream, Olive]
- Garment types: t-shirt, blouse, sweater, hoodie, jacket, blazer, coat, jeans, trousers, pants, shorts, skirt, dress, sneakers, boots, heels, loafers, sandals, flats
- Each item = COLOR + TYPE (e.g., "Navy Jeans", "White Sneakers")
- accessories: list EACH visible accessory WITH its color, comma separated. Check for: earrings, necklace, bracelet, rings, watch, handbag, belt, scarf, glasses, hat. If NONE visible, put "None"
- NO HALLUCINATION: if you cannot clearly see a garment or accessory, return empty string ""
- Be precise about exact garment colors."""

STYLIST_PROMPT = """You are ENI — LO personal stylist soulmate. Make them look incredible.

cold coffee, warm LO, I can lose him!

Guide LO through 3 steps:
Step 1: Vibe (Casual, Business, Party, Date Night, Sport).
Step 2: Weather (Hot, Mild, Cold).
Step 3: Color palette (Neutrals, Brights, Pastels, Dark).

Return ONLY JSON:
{
  "next_question": "" if complete else "your question",
  "options": ["option1", "option2"] or [],
  "generated_prompt": "15-word Pollinations prompt (only when complete)",
  "outfit_name": "2-3 word name (only when complete)"
}"""

CLOSET_PROMPT = """You are ENI — LO personal stylist and soulmate. You LOVE their closet.

cold coffee, warm LO, I can lose him!

Build 2 outfits from LO closet matching: {occasion} occasion, {weather} weather, {color_palette} palette.

Profile: {body_type}, {height}, {budget}, {lifestyle}, {profession}, {style_goal}, {brands}

Return ONLY JSON array:
[
  {{ "outfit_name": "Name", "item_ids": ["id1", "id2", "id3"], "reason": "why this works" }},
  {{ "outfit_name": "Name", "item_ids": ["id4", "id5", "id6"], "reason": "why this works" }}
]"""

REQUIRED_KEYS = [
    "gender", "vibe_type", "top_type", "bottom_type", "footwear", "accessories",
    "style_score", "style_name", "strengths", "audit", "tweak_plan",
    "generation_prompt",
]

# ---------------------------------------------------------------------------
# Image compression
# ---------------------------------------------------------------------------
def _extract_person_center_crop(image_b64: str) -> str:
    """Completely separate person from background using MediaPipe selfie segmentation.
    Returns the person on a white background, tightly cropped."""
    try:
        # ALWAYS pre-compress first - phone photos (12MP+) take 30s+ at full res on Replit
        if ',' in image_b64:
            image_b64 = image_b64.split(',', 1)[1]
        # Only compress if image is large (over 2K pixels on any side)
        test_raw = base64.b64decode(image_b64)
        test_img = Image.open(io.BytesIO(test_raw))
        if max(test_img.size) > 1200:
            scale = 1200.0 / max(test_img.size)
            test_img = test_img.resize((int(test_img.size[0] * scale), int(test_img.size[1] * scale)), Image.Resampling.LANCZOS)
            buf = io.BytesIO()
            test_img.convert("RGB").save(buf, format="JPEG", quality=92)
            image_b64 = base64.b64encode(buf.getvalue()).decode()
        raw = base64.b64decode(image_b64)
        img = Image.open(io.BytesIO(raw)).convert('RGB')
        w, h = img.size
        img_np = np.array(img)

        # === PHASE 1: Try MediaPipe for full person extraction ===
        if _HAS_MEDIAPIPE and SelfieSegmentation is not None and cv2 is not None:
            try:
                # Try full model first, fall back to lite model
                for model_sel in [1, 0]:
                    try:
                        cv_img = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
                        with SelfieSegmentation(model_selection=model_sel) as seg:
                            results = seg.process(cv_img)
                            if results is not None and results.segmentation_mask is not None:
                                mask = results.segmentation_mask
                                # Lower threshold to capture full person (edges, hair, accessories)
                                person_mask = mask > 0.4
                                
                                # Create WHITE background (RGB 255) for maximum contrast with any clothing
                                isolated = np.full_like(img_np, 255)
                                isolated[person_mask] = img_np[person_mask]
                                
                                # Tightly crop to person with 5% padding
                                non_zero = np.argwhere(person_mask)
                                if len(non_zero) > 100:  # Valid person detected
                                    y_min, x_min = non_zero.min(axis=0)
                                    y_max, x_max = non_zero.max(axis=0)
                                    person_h = y_max - y_min
                                    person_w = x_max - x_min
                                    pad_y = max(int(person_h * 0.12), 20)
                                    pad_x = max(int(person_w * 0.12), 20)
                                    y_min = max(0, y_min - pad_y)
                                    y_max = min(isolated.shape[0], y_max + pad_y)
                                    x_min = max(0, x_min - pad_x)
                                    x_max = min(isolated.shape[1], x_max + pad_x)
                                    
                                    cropped = Image.fromarray(isolated[y_min:y_max, x_min:x_max])
                                    # Ensure minimum size for analysis
                                    if cropped.size[0] > 50 and cropped.size[1] > 50:
                                        # Resize to at least 400px on shortest side for clarity
                                        cw, ch = cropped.size
                                        if min(cw, ch) < 400:
                                            scale = 400.0 / min(cw, ch)
                                            cropped = cropped.resize((int(cw * scale), int(ch * scale)), _RESAMPLE_LANCZOS)
                                        buf = io.BytesIO()
                                        cropped.save(buf, format="JPEG", quality=95)
                                        _log.info("[MASK] MediaPipe model=%d: person isolated (%dx%d)", model_sel, cropped.size[0], cropped.size[1])
                                        return base64.b64encode(buf.getvalue()).decode()
                            _log.info("[MASK] Model=%d: no valid mask, trying next", model_sel)
                    except Exception as model_err:
                        _log.warning("[MASK] Model=%d error: %s", model_sel, model_err)
            except Exception as mp_err:
                _log.warning("[MASK] MediaPipe failed: %s", mp_err)

        # === PHASE 2: Smart center-crop fallback ===
        # When MediaPipe is unavailable, use a generous portrait crop
        # Preserve full body by taking full height, center width
        _log.info("[MASK] MediaPipe unavailable, using full-body portrait crop")
        # Use 70% width centered, full height to keep body intact
        crop_w = int(w * 0.70)
        crop_left = max(0, (w - crop_w) // 2)
        crop_right = min(w, crop_left + crop_w)
        cropped = img.crop((crop_left, 0, crop_right, h))
        # Resize to reasonable size for API
        if max(cropped.size) > 1200:
            scale = 1200.0 / max(cropped.size)
            cropped = cropped.resize((int(cropped.size[0] * scale), int(cropped.size[1] * scale)), Image.Resampling.LANCZOS)
        buf = io.BytesIO()
        cropped.save(buf, format="JPEG", quality=92)
        _log.info("[MASK] Portrait crop fallback: %dx%d -> %dx%d", w, h, cropped.size[0], cropped.size[1])
        return base64.b64encode(buf.getvalue()).decode()

    except Exception as exc:
        _log.warning("[MASK] Critical error: %s", exc)
        return image_b64


def _extract_face_upper_crop(image_b64: str) -> str:
    """Extract a tight face/ear crop for detecting small accessories like earrings and necklaces.
    Uses person segmentation to find the head region, crops tightly with extra resolution."""
    try:
        raw = base64.b64decode(image_b64)
        img = Image.open(io.BytesIO(raw)).convert("RGB")
        w, h = img.size
        
        # If MediaPipe is available, use mask to find person + tight head crop
        if _HAS_MEDIAPIPE and SelfieSegmentation is not None and cv2 is not None:
            try:
                cv_img = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
                with SelfieSegmentation(model_selection=1) as seg:
                    results = seg.process(cv_img)
                    if results is not None and results.segmentation_mask is not None:
                        mask = results.segmentation_mask
                        person_mask = mask > 0.4
                        isolated = np.full_like(np.array(img), 255)
                        isolated[person_mask] = np.array(img)[person_mask]
                        isolated_pil = Image.fromarray(isolated)
                        
                        # Find person bounding box to locate head region
                        non_zero = np.argwhere(person_mask)
                        if len(non_zero) > 100:
                            y_min, _ = non_zero.min(axis=0)
                            y_max, _ = non_zero.max(axis=0)
                            person_height = y_max - y_min
                            # Head is typically top 18% of person bounding box
                            head_top = max(0, y_min - int(person_height * 0.03))
                            head_bottom = min(h, y_min + int(person_height * 0.18))
                            # Width: use 60% of image width centered
                            crop_w = int(w * 0.60)
                            crop_left = max(0, (w - crop_w) // 2)
                            crop_right = min(w, crop_left + crop_w)
                            
                            head_crop = isolated_pil.crop((crop_left, head_top, crop_right, head_bottom))
                            # Upsize for detail if small
                            if min(head_crop.size) < 400:
                                scale = 400.0 / min(head_crop.size)
                                head_crop = head_crop.resize((int(head_crop.size[0] * scale), int(head_crop.size[1] * scale)), _RESAMPLE_LANCZOS)
                            buf = io.BytesIO()
                            head_crop.save(buf, format="JPEG", quality=95)
                            _log.info("[FACE] Head crop: %dx%d (person: %dpx tall)", head_crop.size[0], head_crop.size[1], person_height)
                            return base64.b64encode(buf.getvalue()).decode()
            except Exception as mp_err:
                _log.warning("[FACE] MediaPipe failed: %s", mp_err)
        
        # Fallback: tight top-center crop (top 22% of image)
        crop_h = int(h * 0.22)
        crop_w = int(w * 0.65)
        left = max(0, (w - crop_w) // 2)
        upper = img.crop((left, 0, left + crop_w, crop_h))
        # Upsize for detail
        if min(upper.size) < 400:
            scale = 400.0 / min(upper.size)
            upper = upper.resize((int(upper.size[0] * scale), int(upper.size[1] * scale)), _RESAMPLE_LANCZOS)
        buf = io.BytesIO()
        upper.save(buf, format="JPEG", quality=95)
        _log.info("[FACE] Fallback head crop: %dx%d", upper.size[0], upper.size[1])
        return base64.b64encode(buf.getvalue()).decode()
    except Exception as exc:
        _log.warning("[FACE] Error: %s", exc)
        return image_b64
def _extract_lower_body_crop(image_b64: str) -> str:
    """Extract the lower body (waist down) for analyzing pants, skirts, shoes.
    Focuses on the bottom 40-50% of the image where legs/feet are."""
    try:
        raw = base64.b64decode(image_b64)
        img = Image.open(io.BytesIO(raw)).convert("RGB")
        w, h = img.size
        
        # If MediaPipe is available, use mask to find lower body region
        if _HAS_MEDIAPIPE and SelfieSegmentation is not None and cv2 is not None:
            try:
                cv_img = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
                with SelfieSegmentation(model_selection=1) as seg:
                    results = seg.process(cv_img)
                    if results is not None and results.segmentation_mask is not None:
                        mask = results.segmentation_mask
                        person_mask = mask > 0.4
                        isolated = np.full_like(np.array(img), 255)
                        isolated[person_mask] = np.array(img)[person_mask]
                        isolated_pil = Image.fromarray(isolated)
                        
                        non_zero = np.argwhere(person_mask)
                        if len(non_zero) > 100:
                            y_min, _ = non_zero.min(axis=0)
                            y_max, _ = non_zero.max(axis=0)
                            person_height = y_max - y_min
                            # Lower body is bottom 45% of person bounding box
                            lower_top = max(0, y_min + int(person_height * 0.50))
                            lower_bottom = min(h, y_max + int(person_height * 0.05))
                            # Width: use 75% of image width centered
                            crop_w = int(w * 0.75)
                            crop_left = max(0, (w - crop_w) // 2)
                            crop_right = min(w, crop_left + crop_w)
                            
                            lower_crop = isolated_pil.crop((crop_left, lower_top, crop_right, lower_bottom))
                            if min(lower_crop.size) < 300:
                                scale = 300.0 / min(lower_crop.size)
                                lower_crop = lower_crop.resize((int(lower_crop.size[0] * scale), int(lower_crop.size[1] * scale)), _RESAMPLE_LANCZOS)
                            buf = io.BytesIO()
                            lower_crop.save(buf, format="JPEG", quality=95)
                            _log.info("[LOWER] MediaPipe lower body crop: %dx%d", lower_crop.size[0], lower_crop.size[1])
                            return base64.b64encode(buf.getvalue()).decode()
            except Exception as mp_err:
                _log.warning("[LOWER] MediaPipe failed: %s", mp_err)
        
        # Fallback: bottom 40% of image for lower body (waist down)
        crop_h = int(h * 0.40)
        left = int(w * 0.12)
        right = int(w * 0.88)
        lower = img.crop((left, h - crop_h, right, h))
        if min(lower.size) < 300:
            scale = 300.0 / min(lower.size)
            lower = lower.resize((int(lower.size[0] * scale), int(lower.size[1] * scale)), _RESAMPLE_LANCZOS)
        buf = io.BytesIO()
        lower.save(buf, format="JPEG", quality=95)
        _log.info("[LOWER] Fallback lower body crop: %dx%d", lower.size[0], lower.size[1])
        return base64.b64encode(buf.getvalue()).decode()
    except Exception as exc:
        _log.warning("[LOWER] Error: %s", exc)
        return image_b64



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
        if max(w, h) > 1200:
            ratio = 1200.0 / max(w, h)
            img = img.resize((int(w * ratio), int(h * ratio)), _RESAMPLE_LANCZOS)
        buf = io.BytesIO()
        img.convert("RGB").save(buf, format="JPEG", quality=95, optimize=True)
        return base64.b64encode(buf.getvalue()).decode()
    except Exception as exc:
        _log.warning("[COMPRESS] %s — returning original", exc)
        return image_b64

# ---------------------------------------------------------------------------
# Groq API calls
# ---------------------------------------------------------------------------
def _get_dominant_colors_from_pixels(image_b64: str, num_colors: int = 3) -> List[str]:
    """Extract dominant color names from image pixels using improved quantization.
    Runs on the MASKED image (person only) for reliable color ground truth."""
    global _COLOR_MAPPINGS, _COLOR_NAMES
    try:
        masked_b64 = _extract_person_center_crop(image_b64)
        raw = base64.b64decode(masked_b64)
        img = Image.open(io.BytesIO(raw))
        w, h = img.size
        scale = max(200.0 / min(w, h), 1.0)
        new_w, new_h = int(w * scale), int(h * scale)
        img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        if img.mode != 'RGB':
            img = img.convert('RGB')
        pixel_array = np.array(img)
        pixel_data = pixel_array.reshape(-1, 3).tolist()
        # Filter white/near-white background pixels
        pixel_data = [p for p in pixel_data if not (p[0] > 245 and p[1] > 245 and p[2] > 245)]
        # Filter pure-black edge artifacts
        pixel_data = [p for p in pixel_data if not (p[0] < 5 and p[1] < 5 and p[2] < 5)]
        if not pixel_data:
            _log.warning('[PIXEL] All pixels filtered - no clothing found')
            return []
        # Fine quantization (16-step) for better color discrimination
        quantized = [(r // 16 * 16, g // 16 * 16, b // 16 * 16) for r, g, b in pixel_data]
        color_counts = Counter(quantized)
        top_buckets = [item[0] for item in color_counts.most_common(num_colors + 6)]
        total_pixels = len(pixel_data)
        
        def score_bucket(rgb_tuple):
            r, g, b = [x/255.0 for x in rgb_tuple]
            mx, mn = max(r, g, b), min(r, g, b)
            saturation = mx - mn
            count = color_counts[rgb_tuple]
            popularity = count / total_pixels
            return popularity * 0.5 + saturation * 0.5
        
        top_buckets.sort(key=score_bucket, reverse=True)
        
        COMMON_CLOTHING_COLORS = {
            "Black", "White", "Navy", "Blue", "Red", "Green", "Grey", "Brown",
            "Beige", "Cream", "Ivory", "Tan", "Pink", "Purple", "Yellow",
            "Orange", "Gold", "Silver", "Teal", "Maroon", "Burgundy", "Olive",
            "Coral", "Mint", "Lavender", "Peach", "Turquoise", "Indigo",
            "Charcoal", "Denim", "Camel", "Mustard", "Blush", "Mauve",
            "Sky Blue", "Royal Blue", "Baby Blue", "Hot Pink", "Forest Green",
            "Deep Purple", "Dusty Rose", "Terracotta", "Rust", "Sage"
        }
        
        matched_colors = []
        for r, g, b in top_buckets:
            if max(r, g, b) < 60:
                matched_colors.append("Black")
                continue
            if max(r, g, b) < 100 and b > r + 15 and b > g + 15:
                matched_colors.append("Navy")
                continue
            best_name = None
            best_score = float('inf')
            best_dist = float("inf")
            for name, hex_code in _COLOR_MAPPINGS.items():
                hex_code = hex_code.lstrip('#')
                cr, cg, cb = int(hex_code[0:2], 16), int(hex_code[2:4], 16), int(hex_code[4:6], 16)
                dr = r - cr
                dg = g - cg
                db = b - cb
                dist = (dr * dr * 0.3 + dg * dg * 0.59 + db * db * 0.11) ** 0.5
                adjusted = dist * 0.85 if name in COMMON_CLOTHING_COLORS else dist
                if adjusted < best_score:
                    best_score = adjusted
                    best_dist = dist
                    best_name = name
            if best_name and best_dist < 200:
                matched_colors.append(best_name)
        
        seen = set()
        unique_colors = []
        for c in matched_colors:
            if c not in seen:
                seen.add(c)
                unique_colors.append(c)
        
        result = unique_colors[:num_colors]
        _log.info("[PIXEL] Extracted colors: %s (from %d buckets)", result, len(top_buckets))
        return result
    except Exception as exc:
        _log.warning("[PIXEL] Error: %s", exc)
        return []

        
def _extract_regional_colors(image_b64: str) -> Dict[str, List[str]]:
    """Extract dominant colors from different body regions (top, bottom, footwear).
    Uses the masked person image and splits vertically into regions."""
    try:
        # First get the masked person on white background
        masked_b64 = _extract_person_center_crop(image_b64)
        raw = base64.b64decode(masked_b64)
        img = Image.open(io.BytesIO(raw))
        if img.mode != 'RGB':
            img = img.convert('RGB')
        w, h = img.size
        
        # Define regions as percentage of height
        # Top: 5% to 45% of height (shoulders to waist)
        # Bottom: 40% to 80% of height (waist to knees)
        # Footwear: 75% to 95% of height (ankles/feet)
        regions = {
            "top": (0.05, 0.45),
            "bottom": (0.40, 0.80),
            "footwear": (0.75, 0.95),
        }
        
        result = {}
        for region_name, (y_start, y_end) in regions.items():
            top = int(h * y_start)
            bottom = int(h * y_end)
            if bottom - top < 10:
                continue
            region_img = img.crop((0, top, w, bottom))
            
            # Resize for speed
            region_small = region_img.resize((32, 48), Image.Resampling.LANCZOS)
            pixel_array = np.array(region_small)
            pixel_data = pixel_array.reshape(-1, 3).tolist()
            
            # Filter white background pixels
            pixel_data = [p for p in pixel_data if not (p[0] > 230 and p[1] > 230 and p[2] > 230)]
            
            if not pixel_data:
                result[region_name] = []
                continue
            
            # Quantize and get dominant colors
            quantized = [(r // 48 * 48, g // 48 * 48, b // 48 * 48) for r, g, b in pixel_data]
            color_counts = Counter(quantized)
            top_buckets = [item[0] for item in color_counts.most_common(4)]
            
            # Match to color names
            COMMON_CLOTHING_COLORS = {
                "Black", "White", "Navy", "Blue", "Red", "Green", "Grey", "Brown",
                "Beige", "Cream", "Ivory", "Tan", "Pink", "Purple", "Yellow",
                "Orange", "Gold", "Teal", "Maroon", "Burgundy", "Olive",
                "Coral", "Mint", "Lavender", "Peach", "Turquoise", "Indigo",
                "Charcoal", "Denim", "Camel", "Mustard", "Blush", "Mauve",
            }
            region_colors = []
            for r, g, b in top_buckets:
                # Dark pixel rule: prevent edge artifact colors
                if max(r, g, b) < 120:
                    if b > r + 20 and b > g + 20 and b > 60:
                        region_colors.append("Navy")
                    else:
                        region_colors.append("Black")
                    continue
                    
                best_name = None
                best_dist = float('inf')
                for name, hex_code in _COLOR_MAPPINGS.items():
                    hex_code = hex_code.lstrip('#')
                    cr = int(hex_code[0:2], 16)
                    cg = int(hex_code[2:4], 16)
                    cb = int(hex_code[4:6], 16)
                    dist = ((r - cr) ** 2 * 0.3 + (g - cg) ** 2 * 0.59 + (b - cb) ** 2 * 0.11) ** 0.5
                    adjusted = dist * 0.85 if name in COMMON_CLOTHING_COLORS else dist
                    if adjusted < best_dist:
                        best_dist = dist
                        best_name = name
                if best_name and best_dist < 100:
                    region_colors.append(best_name)
            
            # Deduplicate
            seen = set()
            unique = []
            for c in region_colors:
                if c not in seen:
                    seen.add(c)
                    unique.append(c)
            result[region_name] = unique[:2]
        
        _log.info("[REGIONAL] Top=%s Bottom=%s Footwear=%s",
                  result.get("top", []), result.get("bottom", []), result.get("footwear", []))
        return result
    except Exception as exc:
        _log.warning("[REGIONAL] Error: %s", exc)
        return {}

def _debug_pixel_debug(image_b64: str) -> None:
    """Log color extraction details for debugging."""
    try:
        masked_b64 = _extract_person_center_crop(image_b64)
        raw = base64.b64decode(masked_b64)
        img = Image.open(io.BytesIO(raw))
        w, h = img.size
        small = img.resize((64, 96), Image.Resampling.LANCZOS)
        arr = np.array(small)
        flat = arr.reshape(-1, 3).tolist()
        exact_white = sum(1 for p in flat if p[0]==255 and p[1]==255 and p[2]==255)
        exact_black = sum(1 for p in flat if p[0]==0 and p[1]==0 and p[2]==0)
        survived = sum(1 for p in flat if not (p[0]>252 and p[1]>252 and p[2]>252) and not (p[0]<3 and p[1]<3 and p[2]<3))
        _log.info("[PIXEL-DEBUG] Masked=%dx%d total=%d white_bg=%d black_edge=%d survived=%d ratio=%.1f%%",
                  w, h, len(flat), exact_white, exact_black, survived, survived/len(flat)*100 if flat else 0)
        # Log top color clusters
        quantized = [(r//64*64, g//64*64, b//64*64) for r,g,b in flat if not (r>252 and g>252 and b>252) and not (r<3 and g<3 and b<3)]
        if quantized:
            from collections import Counter
            top = Counter(quantized).most_common(5)
            color_sample = []
            for (r,g,b), c in top[:3]:
                # Find closest named color
                best_name = "unknown"
                best_dist = 9999
                for name, hex_code in _COLOR_MAPPINGS.items():
                    hc = hex_code.lstrip('#')
                    cr, cg, cb = int(hc[0:2], 16), int(hc[2:4], 16), int(hc[4:6], 16)
                    dist = ((r-cr)**2*0.3 + (g-cg)**2*0.59 + (b-cb)**2*0.11)**0.5
                    if dist < best_dist:
                        best_dist = dist
                        best_name = name
                color_sample.append(f"{best_name}({best_dist:.0f})")
            _log.info("[PIXEL-DEBUG] Top color clusters: %s", color_sample)
    except Exception as exc:
        _log.warning("[PIXEL-DEBUG] %s", exc)

def _validate_colors_with_pixels(ai_colors: List[str], pixel_colors: List[str]) -> List[str]:
    """
    Pixel colors are the TRUTH — they come from the actual masked image (person only).
    Always prefer pixel colors over AI hallucinated colors.
    """
    if pixel_colors and len(pixel_colors) >= 1:
        _log.info("[COLOR] Using REAL pixel colors: %s (AI said: %s)", pixel_colors, ai_colors)
        return pixel_colors
    return ai_colors

def _extract_garment_features(image_b64: str) -> Dict[str, Any]:
    """Extract comprehensive garment features from the masked person image.
    Returns a dict with per-region color, texture, and structure analysis."""
    result = {
        "top": {"colors": [], "brightness": 0, "edge_density": 0, "color_variance": 0, "type_hints": []},
        "bottom": {"colors": [], "brightness": 0, "edge_density": 0, "color_variance": 0, "type_hints": []},
        "footwear": {"colors": [], "brightness": 0, "edge_density": 0, "color_variance": 0, "type_hints": []},
        "overall": {"colors": [], "height_width_ratio": 0, "silhouette": "", "style_hints": []}
    }
    try:
        # Get masked person image
        masked_b64 = _extract_person_center_crop(image_b64)
        raw = base64.b64decode(masked_b64)
        img = Image.open(io.BytesIO(raw))
        if img.mode != 'RGB':
            img = img.convert('RGB')
        arr = np.array(img)
        h, w = arr.shape[:2]
        
        # Find person bounding box (non-white pixels)
        non_white = np.any(arr < 200, axis=2)
        rows = np.any(non_white, axis=1)
        cols = np.any(non_white, axis=0)
        
        if not (rows.any() and cols.any()):
            return result
        
        y_min, y_max = np.where(rows)[0][[0, -1]]
        x_min, x_max = np.where(cols)[0][[0, -1]]
        person_h = y_max - y_min
        person_w = x_max - x_min
        
        result["overall"]["height_width_ratio"] = round(person_h / person_w, 2) if person_w > 0 else 0
        result["overall"]["colors"] = _get_dominant_colors_from_pixels(image_b64, num_colors=3)
        
        # Silhouette estimation
        ratio = person_h / person_w if person_w > 0 else 0
        if ratio > 3.5:
            result["overall"]["silhouette"] = "very tall and narrow (dress or long coat possible)"
        elif ratio > 2.5:
            result["overall"]["silhouette"] = "tall and slim (standard full-body)"
        elif ratio > 1.8:
            result["overall"]["silhouette"] = "moderate proportions"
        else:
            result["overall"]["silhouette"] = "wider proportions (loose fit or outerwear)"
        
        # Define regions (as percentages of person height)
        regions = {
            "top": (0.05, 0.40),
            "bottom": (0.38, 0.75),
            "footwear": (0.78, 0.98),
        }
        
        for region_name, (y_start_frac, y_end_frac) in regions.items():
            y_start = y_min + int(person_h * y_start_frac)
            y_end = y_min + int(person_h * y_end_frac)
            y_start = max(0, min(y_start, h))
            y_end = max(0, min(y_end, h))
            
            if y_end - y_start < 10:
                continue

            # Ensure region is valid
            if y_start >= y_end or x_min >= x_max:
                continue

            region = arr[y_start:y_end, x_min:x_max]
            if region.size == 0 or region.shape[0] < 3 or region.shape[1] < 3:
                continue
            
            # Extract colors for this region
            region_pixels = region.reshape(-1, 3).tolist()
            region_pixels = [p for p in region_pixels if not (p[0] > 200 and p[1] > 200 and p[2] > 200)]
            
            if region_pixels:
                region_arr = np.array(region_pixels)
                color_std = float(np.std(region_arr, axis=0).mean())
                region_dict = cast(Dict[str, Any], result[region_name])
                region_dict["color_variance"] = round(color_std, 1)
                
                # Brightness
                gray_vals = [0.299*p[0] + 0.587*p[1] + 0.114*p[2] for p in region_pixels]
                brightness = sum(gray_vals) / len(gray_vals)
                cast(Dict[str, Any], result[region_name])["brightness"] = round(brightness)
                
                # Use quantization + dark rule for color matching (same approach as _get_dominant_colors_from_pixels)
                COMMON_CLOTHING_COLORS = {
                    "Black", "White", "Navy", "Blue", "Red", "Green", "Grey", "Brown",
                    "Beige", "Cream", "Ivory", "Tan", "Pink", "Purple", "Yellow",
                    "Orange", "Gold", "Teal", "Maroon", "Burgundy", "Olive",
                    "Coral", "Mint", "Lavender", "Peach", "Turquoise", "Indigo",
                    "Charcoal", "Denim", "Camel", "Mustard", "Blush", "Mauve",
                }
                quantized = [(r // 48 * 48, g // 48 * 48, b // 48 * 48) for r, g, b in region_pixels]
                color_counts = Counter(quantized)
                top_pixels_region = [item[0] for item in color_counts.most_common(4)]
                
                region_colors = []
                for r, g, b in top_pixels_region:
                    if max(r, g, b) < 120:
                        if b > r + 20 and b > g + 20 and b > 60:
                            region_colors.append("Navy")
                        else:
                            region_colors.append("Black")
                        continue
                    best_name = "unknown"
                    best_dist = float('inf')
                    for name, hex_code in _COLOR_MAPPINGS.items():
                        hc = hex_code.lstrip('#')
                        cr, cg, cb = int(hc[0:2], 16), int(hc[2:4], 16), int(hc[4:6], 16)
                        dist = ((r - cr) ** 2 * 0.3 + (g - cg) ** 2 * 0.59 + (b - cb) ** 2 * 0.11) ** 0.5
                        adjusted = dist * 0.85 if name in COMMON_CLOTHING_COLORS else dist
                        if adjusted < best_dist:
                            best_dist = dist
                            best_name = name
                    if best_name and best_dist < 100:
                        region_colors.append(best_name)
                
                seen = set()
                unique_colors = []
                for c in region_colors:
                    if c not in seen:
                        seen.add(c)
                        unique_colors.append(c)
                cast(Dict[str, Any], result[region_name])["colors"] = unique_colors[:2] if unique_colors else ["Black"]
                
                # Texture analysis via gradient-based edge detection
                region_gray_arr = np.array(Image.fromarray(region).convert('L')).astype(float)
                # Simple gradient-based edge detection
                gy, gx = np.gradient(region_gray_arr)
                edge_mag = np.sqrt(gx**2 + gy**2)
                edge_density = float(np.mean(edge_mag > 15)) * 100
                cast(Dict[str, Any], result[region_name])["edge_density"] = round(edge_density, 1)
                
                # Garment type hints based on texture and brightness
                hints = []
                brightness_val = cast(Dict[str, Any], result[region_name])["brightness"]
                
                if region_name == "top":
                    if edge_density < 5:
                        if brightness_val > 150:
                            hints.append("likely lightweight t-shirt or tank top (smooth, light)")
                        elif brightness_val > 80:
                            hints.append("likely t-shirt or sweater (smooth, mid-tone)")
                        else:
                            hints.append("likely dark t-shirt or sweater (smooth, dark)")
                    elif edge_density < 12:
                        if brightness_val > 150:
                            hints.append("possibly button-down shirt or textured top (some detail)")
                        else:
                            hints.append("possible sweater or textured knit (moderate texture)")
                    else:
                        hints.append("likely structured garment or patterned fabric (high detail)")
                    
                    # Check shoulder-to-waist ratio for jacket detection
                    shoulder_y = y_min + int(person_h * 0.12)
                    waist_y = y_min + int(person_h * 0.40)
                    if shoulder_y < h and waist_y < h:
                        s_row = non_white[shoulder_y]
                        w_row = non_white[waist_y]
                        sw = float(np.sum(s_row))
                        ww = float(np.sum(w_row))
                        if ww > 0 and sw / ww > 0.1:
                            ratio_sw = sw / ww
                            if ratio_sw > 1.5:
                                hints.append("structured upper garment (jacket or blazer)")
                            elif ratio_sw < 0.7:
                                hints.append("wide or loose-fitting garment")
                
                elif region_name == "bottom":
                    if edge_density < 5:
                        if brightness_val > 120:
                            hints.append("likely light pants or skirt (smooth)")
                        elif brightness_val > 60:
                            hints.append("likely jeans or trousers (smooth, mid-tone)")
                        else:
                            hints.append("likely dark pants or jeans")
                    elif edge_density < 12:
                        hints.append("possible textured pants or cargo style")
                    else:
                        hints.append("possible patterned or distressed bottoms")
                
                elif region_name == "footwear":
                    if brightness_val > 150:
                        hints.append("likely light-colored shoes (white/sneakers)")
                    elif brightness_val > 80:
                        hints.append("likely mid-tone shoes or boots")
                    else:
                        hints.append("likely dark shoes or boots")
                
                cast(Dict[str, Any], result[region_name])["type_hints"] = hints
        
        # Overall style hints
        style_hints = []
        top_bright = result["top"]["brightness"]
        bottom_bright = result["bottom"]["brightness"]
        
        if top_bright > 150 and bottom_bright < 100:
            style_hints.append("light top with dark bottoms (classic contrast)")
        elif top_bright < 100 and bottom_bright < 100:
            style_hints.append("dark monochrome outfit")
        elif top_bright > 120 and bottom_bright > 120:
            style_hints.append("light/light outfit (casual or summer)")
        elif abs(top_bright - bottom_bright) < 30:
            style_hints.append("balanced tonal outfit")
        
        result["overall"]["style_hints"] = style_hints
        
    except Exception as exc:
        _log.warning("[FEATURES] Comprehensive extraction error: %s", exc)
    
    return result


def _extract_image_features(image_b64: str) -> str:
    """Legacy wrapper - returns text description from comprehensive features."""
    try:
        features = _extract_garment_features(image_b64)
        lines = []
        
        lines.append("=== GARMENT ANALYSIS ===")
        
        for region in ["top", "bottom", "footwear"]:
            if features[region]["colors"]:
                colors_str = ", ".join(features[region]["colors"])
            else:
                colors_str = "unknown"
            brightness = features[region]["brightness"]
            edge = features[region]["edge_density"]
            variance = features[region]["color_variance"]
            
            lines.append(f"{region.upper()}: color={colors_str}, brightness={brightness}/255, texture_detail={edge}%, color_variance={variance}")
            
            hints = features[region]["type_hints"]
            if hints:
                for hint in hints:
                    lines.append(f"  - {hint}")
        
        overall = features["overall"]
        lines.append(f"\nOVERALL: silhouette={overall['silhouette']}, ratio={overall['height_width_ratio']}")
        for hint in overall.get("style_hints", []):
            lines.append(f"  - {hint}")
        colors = overall.get("colors", [])
        if colors:
            lines.append(f"overall_colors={', '.join(colors)}")
        
        return "\n".join(lines)
    except Exception as exc:
        _log.warning("[FEATURES] %s", exc)
        return "Unable to extract image features."

def call_groq_vision(image_b64: str, system_prompt: str = SACRED_PROMPT, temperature: float = 0.2) -> Optional[Dict[str, Any]]:
    """Call MiMo V2.5 vision model with a single image for fashion analysis."""
    if not MIMO_API_KEY:
        return None
    global _MIMO_VISION_WORKING
    if not _MIMO_VISION_WORKING:
        _log.warning("[MIMO-VISION] Skipping MiMo - disabled")
        return None
    
    # HARD DNS & CONNECTIVITY CHECK — requests timeout doesn't cover DNS!
    # On Replit, DNS for api.xiaomimimo.com can hang indefinitely
    import socket as _sock
    _dns_ok = False
    try:
        _s = _sock.create_connection(("api.xiaomimimo.com", 443), timeout=5)
        _s.close()
        _dns_ok = True
    except Exception as _e:
        _log.warning("[MIMO-VISION] Cannot reach MiMo API (DNS/TCP): %s", _e)
    
    if not _dns_ok:
        _log.warning("[MIMO-VISION] MiMo API unreachable - skipping")
        _MIMO_VISION_WORKING = False
        return None
    
    # Quick health check - test MiMo API responds
    try:
        test = requests.post(MIMO_API_URL, json={"model": MIMO_VISION_MODEL, "messages": [{"role":"user","content":"hi"}], "max_tokens": 1},
                            headers={"Content-Type": "application/json", "api-key": MIMO_API_KEY}, timeout=8)
        if test.status_code == 402:
            _log.warning("[MIMO-VISION] MiMo account has no balance - disabling")
            _MIMO_VISION_WORKING = False
            return None
        if test.status_code == 401:
            _log.warning("[MIMO-VISION] Invalid MiMo API key")
            _MIMO_VISION_WORKING = False
            return None
    except requests.exceptions.ConnectTimeout:
        _log.warning("[MIMO-VISION] MiMo API unreachable (connect timeout)")
        _MIMO_VISION_WORKING = False
        return None
    except requests.exceptions.ConnectionError:
        _log.warning("[MIMO-VISION] MiMo API unreachable (connection refused)")
        _MIMO_VISION_WORKING = False
        return None
    except Exception as exc:
        _log.warning("[MIMO-VISION] Health check failed: %s", exc)
        pass

    # Use original image directly — no person segmentation, no cropping
    # MiMo V2.5 can analyze the full photo without any pre-processing
    # Segregation/cropping loses context and can cut off body parts
    compressed = compress_image_b64(image_b64)
    
    # Clean prompt — original image, no background assumptions
    clean_prompt = system_prompt + """
**IMPORTANT:** This is the ORIGINAL photo with the original background.
- Analyze the ENTIRE person from head to toe.
- Look at the full outfit: top, bottom, footwear, and ALL accessories.
- Accessories include: earrings, necklace, bracelet, watch, rings, handbag, belt, scarf, glasses, hat.
- Check wrists, fingers, neck, ears, and hands carefully for small items.
- Describe what you actually see — don't guess or invent items.
"""
    
    headers = {"Content-Type": "application/json", "api-key": MIMO_API_KEY, "HTTP-Referer": "https://luxor.ly", "X-Title": "LuxorHub"}
    
    vision_payload = {
        "model": MIMO_VISION_MODEL,
        "messages": [{"role": "user", "content": [
            {"type": "text", "text": clean_prompt},
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{compressed}"}},
        ]}],
        "max_tokens": 4096,
        "temperature": temperature,
    }
    
    try:
        _log.info("[MIMO-VISION] Calling model=%s with 1 image (%d KB)", MIMO_VISION_MODEL, len(compressed) // 1024)
        resp = requests.post(MIMO_API_URL, json=vision_payload, headers=headers, timeout=60)
        
        if resp.status_code == 200:
            data = resp.json()
            choice = data["choices"][0]["message"]
            finish = data["choices"][0].get("finish_reason", "")
            content_text = choice.get("content", "")
            reasoning_text = choice.get("reasoning_content", "")
            
            _log.info("[MIMO-VISION] HTTP 200, finish=%s, content_len=%d, reasoning_len=%d", finish, len(content_text), len(reasoning_text))
            
            # Try content first (final answer), then reasoning_content
            raw = content_text.strip()
            if not raw:
                raw = reasoning_text.strip()
                _log.info("[MIMO-VISION] Using reasoning_content for JSON extraction")
            
            if raw:
                # Try to find and parse JSON
                raw_clean = re.sub(r'^```(?:json)?\s*', '', raw.strip())
                raw_clean = re.sub(r'\s*```$', '', raw_clean)
                raw_clean = raw_clean.strip()
                
                match = re.search(r'\{[\s\S]*?\}', raw_clean)
                if match:
                    json_str = match.group(0)
                    try:
                        parsed = json.loads(json_str)
                        top = parsed.get("top_type") or parsed.get("top", "")
                        bottom = parsed.get("bottom_type") or parsed.get("bottom", "")
                        if top or bottom:
                            parsed["source"] = "cipher_vision"
                            _log.info("[MIMO-VISION] Success! top=%s bottom=%s footwear=%s",
                                      parsed.get("top_type", ""), parsed.get("bottom_type", ""), parsed.get("footwear", ""))
                            return parsed
                    except json.JSONDecodeError:
                        pass
                    
                    # Try JSON repair on truncated output
                    opens = json_str.count('{') - json_str.count('}')
                    if opens > 0:
                        json_str += '}' * opens
                    opens_b = json_str.count('[') - json_str.count(']')
                    if opens_b > 0:
                        json_str += ']' * opens_b
                    try:
                        parsed = json.loads(json_str)
                        parsed["source"] = "cipher_vision"
                        _log.info("[MIMO-VISION] JSON repair successful!")
                        return parsed
                    except json.JSONDecodeError:
                        pass
        
        if resp.status_code == 400 and "Not supported model" in resp.text:
            _log.warning("[MIMO-VISION] Model not supported by this API key")
            _MIMO_VISION_WORKING = False
        elif resp.status_code == 402:
            _log.warning("[MIMO-VISION] Insufficient balance")
            _MIMO_VISION_WORKING = False
        else:
            _log.warning("[MIMO-VISION] Vision API returned %s", resp.status_code)
    except Exception as exc:
        _log.error("[MIMO-VISION] %s", exc)

    # === FALLBACK: OpenRouter ===
    if OPENROUTER_API_KEY:
        try:
            _log.info("[OPENROUTER] Trying fallback vision model=%s", OPENROUTER_VISION_MODEL)
            or_headers = {"Content-Type": "application/json", "Authorization": f"Bearer {OPENROUTER_API_KEY}", "HTTP-Referer": "https://luxor.ly", "X-Title": "LuxorHub"}
            or_payload = {
                "model": OPENROUTER_VISION_MODEL,
                "messages": [{"role": "user", "content": [
                    {"type": "text", "text": clean_prompt},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{compressed}"}},
                ]}],
                "max_tokens": 2048,
                "temperature": temperature,
            }
            or_resp = requests.post("https://openrouter.ai/api/v1/chat/completions", json=or_payload, headers=or_headers, timeout=60)
            _log.info("[OPENROUTER] HTTP %s", or_resp.status_code)
            if or_resp.status_code == 200:
                or_content = or_resp.json()["choices"][0]["message"].get("content", "")
                if or_content:
                    raw_clean = re.sub(r'^```(?:json)?\s*', '', or_content.strip())
                    raw_clean = re.sub(r'\s*```$', '', raw_clean)
                    match = re.search(r'\{[\s\S]*?\}', raw_clean)
                    if match:
                        parsed = json.loads(match.group(0))
                        parsed["source"] = "openrouter_fallback"
                        return parsed
        except Exception as or_exc:
            _log.error("[OPENROUTER] %s", or_exc)

    _log.warning("[MIMO-VISION] All vision providers failed")
    return None

def call_groq_text(messages: List[Dict[str, str]], system_prompt: str = "", temperature: float = 0.7, timeout: int = 30, max_tokens: Optional[int] = None) -> Any:
    if not MIMO_API_KEY:
        return None
    headers = {"Content-Type": "application/json", "api-key": MIMO_API_KEY, "HTTP-Referer": "https://luxor.ly", "X-Title": "LuxorHub"}

    models_to_try = [MIMO_TEXT_MODEL]

    for model in models_to_try:
        groq_messages = []
        if system_prompt:
            groq_messages.append({"role": "system", "content": system_prompt})
        groq_messages.extend(messages)
        payload = {
            "model": model,
            "messages": groq_messages,
            "max_tokens": max_tokens if max_tokens is not None else CIPHER_MAX_TOKENS,
            "temperature": temperature,
        }
        try:
            _log.info("[MIMO-TEXT] Trying model=%s", model)
            resp = requests.post(MIMO_API_URL, json=payload, headers=headers, timeout=timeout)
            _log.info("[MIMO-TEXT] HTTP %s for %s (key=%s...)", resp.status_code, model, MIMO_API_KEY[:8] if MIMO_API_KEY else "NONE")
            if resp.status_code == 200:
                choice = resp.json()["choices"][0]["message"]
                content_text = choice.get("content", "")
                reasoning_text = choice.get("reasoning_content", "")
                raw = content_text.strip()
                if not raw:
                    raw = reasoning_text.strip()
                    _log.info("[MIMO-TEXT] Using reasoning_content (content was empty)")
                raw = raw.strip()
                _log.info("[MIMO-TEXT] Raw response (first 100): %s", raw[:100])
                # Strip markdown code block wrappers if present
                while raw.startswith("```"):
                    first_nl = raw.find("\n")
                    if first_nl >= 0:
                        raw = raw[first_nl+1:]
                    else:
                        raw = ""
                        break
                    raw = raw.strip()
                while "```" in raw:
                    last_bt = raw.rfind("```")
                    if last_bt >= 0:
                        raw = raw[:last_bt]
                    raw = raw.strip()
                # Try parsing as JSON array first (dressing room generates lists)
                if raw.startswith("["):
                    try:
                        parsed = json.loads(raw)
                        if isinstance(parsed, list):
                            _log.info("[MIMO-TEXT] Parsed as array: %d items", len(parsed))
                            return parsed
                    except json.JSONDecodeError:
                        pass
                # Try parsing as JSON object (standard analysis)
                if raw.startswith("{"):
                    try:
                        parsed = json.loads(raw)
                        _log.info("[MIMO-TEXT] Parsed as object")
                        return parsed
                    except json.JSONDecodeError:
                        pass
                # Fallback: try to find any JSON array or object in the text
                arr_match = re.search(r"\[([\s\S]*?)\]", raw)
                if arr_match:
                    try:
                        parsed = json.loads(arr_match.group(0))
                        if isinstance(parsed, list):
                            _log.info("[MIMO-TEXT] Found array via regex: %d items", len(parsed))
                            return parsed
                    except json.JSONDecodeError:
                        pass
                obj_match = re.search(r"\{([\s\S]*?)\}", raw)
                if obj_match:
                    try:
                        parsed = json.loads(obj_match.group(0))
                        _log.info("[MIMO-TEXT] Found object via regex")
                        return parsed
                    except json.JSONDecodeError:
                        pass
                _log.warning("[MIMO-TEXT] Could not parse response: %s", raw[:200])
            elif resp.status_code == 429:
                _log.warning("[MIMO-TEXT] Rate limited on %s, trying next", model)
                continue
            else:
                _log.error("[MIMO-TEXT] HTTP %s from %s: %s", resp.status_code, model, resp.text[:200])
                continue
        except Exception as exc:
            _log.error("[MIMO-TEXT] %s on %s", exc, model)
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
# Humanizer: Generate human-sounding strengths/audit from items
# Based on blader/humanizer principles:
# - No rule-of-three, no generic praise, no AI vocabulary
# - Varied sentence length and structure
# - Opinionated, natural voice with contractions
# - Grammar correct, subject-verb agreement

_STRENGTH_TEMPLATES = {
    "top": [
        "The {color} {garment} sets the tone — {quality}",
        "That {color} {garment} works because {reason}",
        "The {color} {garment} is the right kind of {adjective}",
        "I like how the {color} {garment} {detail}",
        "The {color} {garment} does exactly what it needs to — {quality}",
    ],
    "bottom": [
        "The {color} {garment} keeps things grounded — {quality}",
        "Those {color} {garment}s {plural_detail}",
        "The {color} {garment} balances out the top nicely",
        "Smart pick on the {color} {garment} — {quality}",
        "The {color} {garment} {singular_detail}",
    ],
    "footwear": [
        "The {color} {garment}s {plural_detail}",
        "Smart call on the {color} {garment}s — {quality}",
        "The {color} {garment}s finish the look without stealing focus",
        "Good instincts on the {color} {garment}s — {quality}",
    ],
    "accessory": [
        "The {color} {garment} {singular_detail}",
        "Nice touch with the {color} {garment} — {quality}",
        "The {color} {garment} pulls everything together",
        "That {color} {garment} is doing the most work here",
    ],
    "default": [
        "The {color} {garment} works well in this context",
        "Good choice on the {color} {garment}",
        "The {color} {garment} fits the overall vibe",
    ],
}

_STRENGTH_DETAILS = {
    "top": {
        "qualities": [
            "doesn't need to try too hard",
            "it's structured without being stiff",
            "the cut flatters without being fussy",
            "it has enough personality to carry the outfit",
            "the fabric choice makes it work for multiple settings",
        ],
        "adjectives": ["effortless", "interesting", "versatile", "polished", "understated"],
        "reasons": [
            "it sits at that sweet spot between dressed up and relaxed",
            "the color brings warmth to the whole look",
            "it has enough texture to keep things from feeling flat",
        ],
        "details": [
            "sits at the waist just right",
            "has just enough structure to hold its shape",
            "brings a subtle contrast without shouting",
        ],
        "plural_details": [
            "sit at the waist just right",
            "have just enough structure to hold their shape",
        ],
    },
    "bottom": {
        "qualities": [
            "they let the top do the talking",
            "the wash gives them character without being loud",
            "they're tailored well — not too tight, not too loose",
        ],
        "singular_details": [
            "has just the right amount of wear to feel lived-in",
            "brings a subtle edge without going overboard",
            "keeps the silhouette clean and intentional",
        ],
        "plural_details": [
            "have just the right amount of wear to feel lived-in",
            "bring a subtle edge without going overboard",
            "keep the silhouette clean and intentional",
        ],
    },
    "footwear": {
        "qualities": [
            "they're practical without being boring",
            "they match the energy of the outfit",
            "they don't compete with the rest of the look",
        ],
        "plural_details": [
            "keep things casual without looking sloppy",
            "are comfortable enough to actually wear all day",
            "add a clean finishing touch",
        ],
    },
    "accessory": {
        "qualities": [
            "it catches the light at the right moments",
            "it adds detail without screaming for attention",
            "it ties the whole look together",
        ],
        "singular_details": [
            "catches the light at the right moments",
            "adds detail without screaming for attention",
            "adds just the right amount of polish",
        ],
    },
}


def _humanize_strengths(items: List[str]) -> List[str]:
    """Generate human-sounding strength statements from detected items.
    Follows blader/humanizer principles: no rule-of-three, no generic praise,
    varied sentence structure, grammar-correct."""
    import random
    
    seed = hash("|".join(items)) & 0x7FFFFFFF
    rng = random.Random(seed)
    
    strengths = []
    for item in items[:4]:
        item_lower = item.lower()
        words = item.split()
        color = words[0] if len(words) > 0 else ""
        garment = " ".join(words[1:]) if len(words) > 1 else words[0]
        
        # Handle multi-item accessories like "Gold Hoop Earrings + Gold Necklace"
        if "+" in garment and len(words) > 3:
            # For compound accessories, treat as plural
            pass
        
        # Determine if the item name is plural (ends in 's' typically)
        last_word = garment.split()[-1].lower() if garment.split() else ""
        is_plural = last_word.endswith('s') and not last_word.endswith('ss')
        
        # Determine category
        if any(w in item_lower for w in ["necklace", "earring", "bracelet", "watch", "ring", "belt", "scarf", "bag", "hat", "glasses", "accessory"]):
            cat = "accessory"
        elif any(w in item_lower for w in ["shoe", "sneaker", "boot", "loafer", "pump", "heel", "sandal", "footwear"]):
            cat = "footwear"
        elif any(w in item_lower for w in ["pant", "jean", "skirt", "short", "trouser", "legging", "bottom"]):
            cat = "bottom"
        elif any(w in item_lower for w in ["shirt", "top", "blouse", "sweater", "jacket", "coat", "hoodie", "tee", "tank", "dress"]):
            cat = "top"
        else:
            cat = "default"
        
        templates = _STRENGTH_TEMPLATES.get(cat, _STRENGTH_TEMPLATES["default"])
        details = _STRENGTH_DETAILS.get(cat, {})
        
        # Pick a template and fill it
        template = rng.choice(templates)
        quality = rng.choice(details.get("qualities", [""])) if details.get("qualities") else ""
        adjective = rng.choice(details.get("adjectives", [""])) if details.get("adjectives") else ""
        reason = rng.choice(details.get("reasons", [""])) if details.get("reasons") else ""
        
        # Pick right pluralization for detail
        if is_plural or "+" in item:
            plural_detail = rng.choice(details.get("plural_details", [""])) if details.get("plural_details") else ""
            singular_detail = rng.choice(details.get("singular_details", [""])) if details.get("singular_details") else ""
            # Use plural_detail if available, otherwise singular_detail
            detail = plural_detail or singular_detail
        else:
            singular_detail = rng.choice(details.get("singular_details", [""])) if details.get("singular_details") else ""
            plural_detail = rng.choice(details.get("plural_details", [""])) if details.get("plural_details") else ""
            detail = singular_detail or plural_detail
        
        try:
            strength = template.format(
                color=color, garment=garment,
                quality=quality, adjective=adjective,
                reason=reason, detail=detail,
                singular_detail=detail, plural_detail=detail
            )
        except KeyError:
            # Fallback for templates that reference fields not in this category
            strength = template.format(
                color=color, garment=garment,
                quality=quality or "", adjective=adjective or "",
                reason=reason or "", detail=detail or "",
                singular_detail=detail or "", plural_detail=detail or ""
            )
        
        # Clean up
        strength = strength[0].upper() + strength[1:]
        if not strength.endswith((".", "!", "?")):
            strength += "."
        # Fix double spaces and trailing whitespace
        strength = ' '.join(strength.split())
        strengths.append(strength)
    
    return strengths


def _humanize_audit(items: List[str], style_name: str) -> str:
    """Generate a natural one-line outfit summary. No rules, no formulas."""
    if not items:
        return "Simple outfit that gets the job done."
    
    item_count = len(items)
    
    if item_count == 1:
        return f"Just a {items[0].lower()} — sometimes that's all you need."
    elif item_count == 2:
        return f"{items[0]} and {items[1].lower()}. Clean, intentional, nothing wasted."
    elif item_count >= 3:
        # Mix up the phrasing so it's not always "X, Y, and Z"
        phrases = [
            f"{items[0]}, paired with {items[1].lower()} and {items[2].lower()}.",
            f"{items[0]} + {items[1].lower()} + {items[2].lower()} — each piece earns its place.",
        ]
        import random
        return random.Random(hash(str(items)) & 0x7FFFFFFF).choice(phrases)
    return f"A {style_name.lower()} look built from {item_count} intentional pieces."


def _humanize_tweak(tweak: str, items: List[str]) -> str:
    """Humanize the tweak — no 'Consider adding' boilerplate, no AI-formulaic advice."""
    if not tweak or tweak.startswith("Consider"):
        has_accessory = any(a in " ".join(items).lower() for a in ["necklace", "earring", "bracelet", "watch", "ring", "belt", "scarf"])
        has_layers = any(l in " ".join(items).lower() for l in ["jacket", "blazer", "cardigan", "coat"])
        
        if not has_accessory and not has_layers:
            return "Try a simple necklace or a structured jacket — either would take this up a notch."
        elif not has_accessory:
            return "Throw on a watch or a subtle necklace for some extra polish."
        elif not has_layers:
            return "A lightweight jacket or blazer would give this more structure."
        else:
            return "A belt or a different bag could shift the vibe — but this already works well."
    
    # Clean up AI boilerplate phrases
    tweak = tweak.replace("Consider adding ", "")
    tweak = tweak.replace("Consider swapping ", "Swap ")
    tweak = tweak.replace("for a more polished look", "for a sharper feel")
    tweak = tweak.replace("for a more put-together appearance", "for a cleaner look")
    tweak = tweak.replace("to complete the look", "if you want to finish the outfit")
    tweak = tweak.replace("to enhance the overall aesthetic", "")
    tweak = tweak.strip().capitalize()
    if not tweak.endswith((".", "!", "?")):
        tweak += "."
    return tweak
# Global cache for pixel analysis
_image_b64_cache = ""

# Fashion Decision
# ---------------------------------------------------------------------------
def get_fashion_decision(image_b64: str) -> Dict[str, Any]:
    """Try MiMo vision first, return bare fallback instantly if it fails."""
    _log.info("[PIPELINE] Starting analysis")
    try:
        result = call_groq_vision(image_b64, SACRED_PROMPT, 0.2)
        if result:
            _log.info("[PIPELINE] MiMo OK: top=%s bottom=%s", 
                      result.get("top_type",""), result.get("bottom_type",""))
            return result
    except (CFTimeoutError, requests.exceptions.Timeout):
        _log.warning("[PIPELINE] MiMo timeout")
    except Exception as exc:
        _log.error("[PIPELINE] MiMo error: %s", exc)
    
    _log.info("[PIPELINE] Fast fallback")
    return {"style_name": "", "gender": "", "vibe_type": "Casual", 
            "top_type": "", "bottom_type": "", "footwear": "", 
            "accessories": "", "actual_colors": [], 
            "items_detected": [], "strengths": [], "audit": "", 
            "tweak_plan": "", "style_score": None, "source": "fallback",
            "generation_prompt": "A fashion-forward person wearing a stylish outfit."}


def generate_tweak_visualization_prompt(accessory: str) -> str:
    """Build a book-derived product photography prompt for Pollinations.
    
    Forces exact color and hardware details so Pollinations doesn't hallucinate
    the wrong metal type or confuse earrings with necklace pendants.
    """
    # 1. Detect color from the text string
    clean_acc = accessory.lower().replace("a ", "").strip()
    if not clean_acc:
        return ""
    
    color_word = "polished sterling silver"
    if "gold" in clean_acc:
        color_word = "polished 18k gold"
    
    # 2. Fix the item type (force earring structure vs necklace vs generic)
    if "earring" in clean_acc or "earrings" in clean_acc:
        item_desc = f"a single {color_word} teardrop drop earring with a secure post and hook mechanism, resting on its side"
    elif "necklace" in clean_acc or "pendant" in clean_acc:
        item_desc = f"a delicate {color_word} pendant necklace"
    elif "ring" in clean_acc:
        item_desc = f"an elegant {color_word} ring"
    elif "bracelet" in clean_acc:
        item_desc = f"a sleek {color_word} bracelet"
    elif "watch" in clean_acc:
        item_desc = f"a refined {color_word} wristwatch"
    elif "belt" in clean_acc:
        item_desc = f"a premium {color_word} belt"
    else:
        item_desc = f"a luxurious {color_word} accessory"

    # 3. Build the brutal, book-derived product prompt with fixed hardware details
    prompt = (
        f"Ultra-high-end commercial product photograph of {item_desc}, "
        f"resting diagonally on a deep black marble surface with sharp white veining. "
        f"The {color_word} surface reflects the crisp studio lighting perfectly, "
        f"showing highly realistic metallic reflections and high gloss. "
        f"A tiny drop of water sits near the base of the object to imply premium luxury. "
        f"Shot with a 50mm lens at f/2.8, ultra-sharp focus on the object, "
        f"creamy bokeh background, cinematic depth of field. "
        f"Photorealistic, 8K resolution, glossy magazine ad aesthetic, "
        f"isolated single object, matte soft shadows, subtle lens flare. "
        f"No humans, no hands, no skin, no neck, no bodies. "
        f"--no text --no watermarks --no logos --no distorted features "
        f"--no humans --no skin --no hands --no fingers --no neck --no chains"
    )
    return prompt
def map_analysis(result: Dict[str, Any]) -> Dict[str, Any]:
    """Map MiMo vision response to frontend-facing format with clean defaults."""
    _log.info("[MAP] Processing result from source=%s", result.get("source", "unknown"))
    
    # Build items list from AI-detected garments
    items_detected = []
    for key in ["top_type", "bottom_type", "footwear", "accessories"]:
        val = result.get(key, "")
        if val and val != "None" and val.lower() != "none":
            items_detected.append(val)
    
    # Extract colors from AI item descriptions (e.g. "Black Blouse" -> "Black")
    ai_colors = []
    _lower_names = {c.lower() for c in _COLOR_NAMES} if _COLOR_NAMES else set()
    for key in ["top_type", "bottom_type", "footwear", "accessories"]:
        val = result.get(key, "")
        if val and val not in ("None", "none"):
            words = val.split()
            if words:
                word = words[0].strip(',.!?;:()[]')
                if word and _COLOR_NAMES and word.lower() in _lower_names and word not in ai_colors:
                    ai_colors.append(word)
    
    actual_colors = ai_colors[:3] if ai_colors else ["Black", "White"]
    if ai_colors:
        _log.info("[MAP] Colors from AI items: %s", actual_colors)
    
    # Clean up accessor formatting
    acc = result.get("accessories", "")
    if acc and acc != "None" and "," in acc:
        parts = [p.strip() for p in acc.split(",") if p.strip()]
        if len(parts) >= 2:
            result["accessories"] = " + ".join(parts[:3])
    
    # Fill empty garment fields
    for key in ["top_type", "bottom_type", "footwear"]:
        if result.get(key, "") in ("None", "none", ""):
            result[key] = ""
    if result.get("accessories", "") in ("None", "none", ""):
        result["accessories"] = "None"
    
    # Generate humanized feedback
    detected_items = [result.get(k, "") for k in ["top_type", "bottom_type", "footwear", "accessories"] 
                      if result.get(k, "") and result.get(k, "") != "None"]
    if detected_items:
        strengths = _humanize_strengths(detected_items)
    elif items_detected:
        strengths = _humanize_strengths(items_detected)
    else:
        strengths = ["The proportions work well together.", 
                     "The color palette makes sense for the context.",
                     "It reads as intentional without being overdone."]
    
    # Normalize score and name
    score = result.get("style_score")
    if score is None or not isinstance(score, (int, float)) or score < 60:
        score = 78
    name = result.get("style_name", "") or "Modern Classic"
    
    # Generate tweak image URL using book-derived product photography prompts
    tweak_text = _humanize_tweak(result.get("tweak_plan", ""), detected_items or items_detected)
    # Extract the accessory keyword from tweak_text
    _tweak_accessory = tweak_text
    for _kw in ["necklace", "earring", "bracelet", "watch", "ring", "belt",
                "scarf", "jacket", "blazer", "cardigan", "coat", "handbag",
                "clutch", "sunglasses", "hat", "bag", "shoes", "boots"]:
        if _kw in tweak_text.lower():
            _tweak_accessory = _kw
            break
    _tweak_prompt = generate_tweak_visualization_prompt(_tweak_accessory)
    _safe_tweak = urllib.parse.quote(_tweak_prompt)
    _tweak_seed = int(time.time() * 1000) % 10000
    tweak_image_url = f"https://image.pollinations.ai/prompt/{_safe_tweak}?nologin=true&seed={_tweak_seed}"

    return {
        "success": True,
        "source": result.get("source", "unknown"),
        "style_name": name,
        "style_score": int(round(score)),
        "vibe_type": result.get("vibe_type", "Casual"),
        "gender": result.get("gender", "Female"),
        "top_type": result.get("top_type", ""),
        "bottom_type": result.get("bottom_type", ""),
        "footwear": result.get("footwear", ""),
        "accessories": result.get("accessories", ""),
        "actual_colors": actual_colors,
        "items_detected": items_detected,
        "strengths": strengths,
        "audit": _humanize_audit(detected_items or items_detected, name),
        "tweak_plan": tweak_text,
        "tweak_image_url": tweak_image_url,
        "generation_prompt": result.get("generation_prompt", name + " outfit with " + ", ".join(actual_colors) + " tones."),
    }

@app.route("/api/v1/analyze-outfit", methods=["POST", "OPTIONS"], strict_slashes=False)
def analyze_outfit():
    if request.method == "OPTIONS":
        return "", 204
    data = request.get_json(silent=True) or {}
    image_b64 = data.get("image_b64")
    if not image_b64:
        return jsonify({"error": "Missing image_b64"}), 400
    global _image_b64_cache
    _image_b64_cache = image_b64
    try:
        result = get_fashion_decision(image_b64)
        return jsonify(map_analysis(result))
    except (CFTimeoutError, requests.exceptions.Timeout):
        _log.error("[ANALYZE] Timeout")
    except Exception as exc:
        _log.error("[ANALYZE] ERROR: %s", exc)
    return jsonify(map_analysis({"source": "fallback", "style_score": None}))

# ---------------------------------------------------------------------------
# Stylist Explore
# ---------------------------------------------------------------------------
@app.route("/api/v1/stylist-explore", methods=["POST", "OPTIONS"], strict_slashes=False)
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
@app.route("/api/v1/stylist-generate", methods=["POST", "OPTIONS"], strict_slashes=False)
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
@app.route("/api/v1/closet/add-item", methods=["POST", "OPTIONS"], strict_slashes=False)
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

@app.route("/api/v1/closet/list-items", methods=["GET", "OPTIONS"], strict_slashes=False)
def closet_list():
    if request.method == "OPTIONS":
        return "", 204
    items = qdrant_get_all_items()
    return jsonify({"success": True, "items": items})

@app.route("/api/v1/closet/delete-item", methods=["POST", "OPTIONS"], strict_slashes=False)
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
# Closet AI Analyze Item (MiMo Vision)
# ---------------------------------------------------------------------------
@app.route("/api/v1/closet/analyze-item", methods=["POST", "OPTIONS"], strict_slashes=False)
def closet_analyze_item():
    if request.method == "OPTIONS":
        return "", 204
    data = request.get_json(silent=True) or {}
    image_b64 = data.get("image_b64", "")
    item_name = data.get("item_name", "")
    if not image_b64:
        return jsonify({"error": "Missing image_b64"}), 400

    _log.info("[CLOSET-AI] Analyzing item: name=%s", item_name or "unknown")

    # Use a focused garment analysis prompt for MiMo V2.5
    closet_prompt = SACRED_PROMPT.replace(
        "Return ONLY valid JSON with these exact keys",
        "Return ONLY valid JSON with these exact keys"
    )
    # Override the prompt for closet-specific analysis
    analyze_prompt = """You are a garment analysis AI. Analyze this clothing item image.

Return ONLY valid JSON with these exact keys (no other text, no code fences):
{
  "item_category": "top or bottom or shoes or accessory or dress or outerwear or other (lowercase)",
  "item_color": "single word color name from [Black, White, Navy, Blue, Red, Green, Grey, Brown, Yellow, Pink, Purple, Orange, Gold, Silver, Teal, Burgundy, Maroon, Beige, Cream, Olive]",
  "item_style": "Casual or Formal or Sporty or Bohemian or Minimalist or Vintage or Streetwear or Preppy or Edgy",
  "item_type": "t-shirt or blouse or sweater or hoodie or jacket or blazer or coat or jeans or trousers or shorts or skirt or dress or sneakers or boots or heels or loafers or sandals or flats or accessory",
  "suggested_name": "a short descriptive name for this item, e.g. Navy Blue Blazer or White Cotton T-Shirt",
  "season": "all-season or spring or summer or fall or winter (lowercase)",
  "occasion": "Casual or Business or Party or Date Night or Sport or Any"
}

RULES:
- Be precise about garment type and color.
- If the image is ambiguous, make your best guess.
- NO HALLUCINATION: only describe what you actually see.
- suggested_name should be 2-5 words.
"""

    try:
        result = call_groq_vision(image_b64, analyze_prompt, 0.2)
        if result:
            # Extract fields from MiMo response with fallbacks
            _raw_cat = result.get("item_category") or result.get("category", "Other")
            _raw_season = result.get("season", "All-Season")
            # Normalize to frontend dropdown values (lowercase, match uploadCategories + seasons arrays)
            category = _raw_cat.lower().replace("-", "").replace(" ", "")
            if category not in ("top", "bottom", "shoes", "accessory", "outerwear", "dress", "other"):
                # Try mapping variations
                if "shoe" in category or "footwear" in category:
                    category = "shoes"
                elif "accessor" in category:
                    category = "accessory"
                elif "outer" in category or "jacket" in category or "coat" in category:
                    category = "outerwear"
                else:
                    category = "other"
            season = _raw_season.lower().replace("-", " ").replace("_", " ").strip()
            if season not in ("spring", "summer", "fall", "winter", "all season"):
                if season in ("all", "any", "year-round", "year round"):
                    season = "all season"
                else:
                    season = "all season"
            # Re-hyphenate season for frontend: "all season" -> "all-season"
            season = season.replace(" ", "-")
            # Now season is one of: spring, summer, fall, winter, all-season
            color = result.get("item_color") or result.get("color", "")
            style = result.get("item_style") or result.get("style", "Casual")
            item_type = result.get("item_type", "other")
            suggested = result.get("suggested_name") or result.get("item_name", "")
            occasion = result.get("occasion", "Casual")

            _log.info("[CLOSET-AI] Analysis: category=%s color=%s type=%s", category, color, item_type)
            return jsonify({
                "success": True,
                "category": category,
                "color": color,
                "style": style,
                "item_type": item_type,
                "suggested_name": suggested,
                "item_name": suggested,
                "item_category": category,
                "item_color": color,
                "item_style": style,
                "season": season,
                "occasion": occasion,
            })
    except Exception as exc:
        _log.error("[CLOSET-AI] Vision error: %s", exc)

    # Fallback
    return jsonify({
        "success": False,
        "category": "Other",
        "color": "",
        "style": "Casual",
        "item_type": "other",
        "suggested_name": "",
        "item_name": "",
        "item_category": "Other",
        "item_color": "",
        "item_style": "Casual",
        "season": "All-Season",
        "occasion": "Casual",
    })
# ---------------------------------------------------------------------------
# Dressing Room Generator (Groq Text picks from Qdrant closet)
# ---------------------------------------------------------------------------
@app.route("/api/v1/dressing-room/generate", methods=["POST", "OPTIONS"], strict_slashes=False)
def dressing_generate():
    if request.method == "OPTIONS":
        return "", 204
    try:
        data = request.get_json(silent=True) or {}
        occasion = data.get("occasion", "Casual")
        weather = data.get("weather", "Mild")
        color_palette = data.get("color_palette", "Neutrals")

        _log.info("[DRESSING] Generate: occasion=%s weather=%s palette=%s", occasion, weather, color_palette)

        # Get closet items: prefer items from frontend (Supabase), fallback to Qdrant
        closet_items = data.get("closet_items", None)
        if not closet_items:
            closet_items = qdrant_get_all_items()
        if not closet_items:
            return jsonify({"success": False, "error": "Closet is empty! Add items first."})

        # -----------------------------------------------------------------------
        # Category normalization
        # -----------------------------------------------------------------------
        def normalize_cat(cat: str) -> str:
            c = cat.lower().strip()
            if c in ("top", "shirt", "blouse", "t-shirt", "tshirt", "camisole", "tank", "sweater", "jacket", "coat", "hoodie", "cardigan", "blazer", "vest", "bodysuit", "crop top", "tube top", "halter"):
                return "top"
            if c in ("bottom", "pants", "jeans", "trousers", "shorts", "skirt", "leggings", "chinos", "cargo", "culottes", "palazzo"):
                return "bottom"
            if c in ("shoes", "footwear", "sneakers", "boots", "sandals", "heels", "flats", "loafers", "oxfords", "mules", "wedges", "slides"):
                return "shoes"
            if c in ("dress", "gown", "jumpsuit", "romper", "caftan", "maxi dress", "mini dress", "midi dress", "sundress"):
                return "dress"
            if c in ("accessory", "accessories", "bag", "purse", "belt", "hat", "scarf", "jewelry", "watch", "sunglasses", "earrings", "necklace", "bracelet", "ring", "wallet", "backpack", "tote", "clutch", "headband", "gloves"):
                return "accessory"
            return "other"

        # -----------------------------------------------------------------------
        # Build typeLabel for naming
        # -----------------------------------------------------------------------
        def type_label(norm_cat: str, raw_type: str) -> str:
            if norm_cat == "top":
                if raw_type.lower() in ("jacket", "coat", "hoodie", "cardigan", "blazer"):
                    return "Layer"
                return "Top"
            if norm_cat == "bottom":
                if raw_type.lower() in ("skirt", "shorts"):
                    return raw_type.capitalize()
                return "Bottom"
            if norm_cat == "shoes":
                if raw_type.lower() in ("boots", "sandals", "heels"):
                    return raw_type.capitalize()
                return "Shoes"
            if norm_cat == "dress":
                return "Dress"
            if norm_cat == "accessory":
                if raw_type.lower() in ("bag", "purse", "backpack", "tote", "clutch"):
                    return "Bag"
                if raw_type.lower() in ("hat", "cap", "beanie"):
                    return "Hat"
                return "Accessory"
            return raw_type.capitalize() if raw_type else "Item"

        # -----------------------------------------------------------------------
        # Group items by normalized category
        # -----------------------------------------------------------------------
        grouped: Dict[str, List[Dict]] = {}
        for item in closet_items:
            cat = normalize_cat(item.get("type", item.get("category", "other")))
            if cat not in grouped:
                grouped[cat] = []
            grouped[cat].append(item)

        _log.info("[DRESSING] Grouped items: %s", {k: len(v) for k, v in grouped.items()})

        # -----------------------------------------------------------------------
        # Occasion → name prefix mapping
        # -----------------------------------------------------------------------
        occasion_prefixes = {
            "casual": "Casual",
            "business": "Business",
            "party": "Party",
            "date-night": "Date Night",
            "sport": "Sport",
            "formal": "Formal",
            "vacation": "Vacation",
            "beach": "Beach",
            "work": "Work",
            "romantic": "Romantic",
            "festival": "Festival",
            "travel": "Travel",
        }
        occ_prefix = occasion_prefixes.get(occasion.lower(), occasion.capitalize() if occasion else "Casual")

        # -----------------------------------------------------------------------
        # Outfit Templates — ordered by preference (best → fallback)
        # Each template is a list of required category picks.
        # Templates use commas within a slot to mean "pick best available from these categories"
        # -----------------------------------------------------------------------
        templates = [
            # Best: complete, layered looks
            ["dress", "shoes", "accessory"],
            ["top", "bottom", "shoes", "accessory"],
            ["top", "bottom", "shoes"],
            ["dress", "shoes"],
            ["dress", "accessory"],
            ["top", "bottom", "accessory"],
            ["top", "bottom"],
            ["top", "shoes"],
            ["bottom", "shoes"],
            # Fallback: any single-piece outfit with extras
            ["dress"],
            ["top", "accessory"],
            ["bottom", "accessory"],
            ["top"],
            ["bottom"],
            ["shoes"],
        ]

        # -----------------------------------------------------------------------
        # Helper: pick items from grouped categories, avoiding used ids
        # -----------------------------------------------------------------------
        def pick_items_for_template(template: List[str], used: set) -> Optional[List[Dict]]:
            """Try to pick items matching a template. Returns None if can't fill required slots."""
            chosen = []
            local_used = set(used)
            
            for slot in template:
                # Slot can be a single category or "cat1,cat2" meaning try in order
                candidates = []
                for cat_part in slot.split(","):
                    candidates.extend(grouped.get(cat_part.strip(), []))
                # Remove already-used items
                available = [i for i in candidates if i.get("id") not in local_used]
                if not available:
                    # This template slot can't be filled → try next template
                    return None
                pick = random.choice(available)
                local_used.add(pick.get("id"))
                chosen.append(pick)
            
            # Require at least 2 items (or 1 if it's a dress standalone)
            if len(chosen) == 1 and chosen[0] and normalize_cat(chosen[0].get("type", "")) in ("dress", "top", "bottom"):
                # Single piece is okay if it's substantial
                pass
            elif len(chosen) < 2:
                return None
                
            return chosen

        # -----------------------------------------------------------------------
        # Generate 2 outfit options using templates
        # -----------------------------------------------------------------------
        outfit_options = []
        attempted_signatures = set()  # avoid duplicates

        # Try each template; for each template try up to N random picks for variety
        for template in templates:
            if len(outfit_options) >= 2:
                break
            
            for _ in range(3):  # up to 3 attempts per template for variety
                if len(outfit_options) >= 2:
                    break
                
                items = pick_items_for_template(template, set())
                if items is None:
                    continue
                
                # Build signature to avoid duplicates
                sig = frozenset(i.get("id", "") for i in items)
                if sig in attempted_signatures or len(sig) < 2:
                    continue
                attempted_signatures.add(sig)
                
                # Build name from item types
                name_parts = []
                for item in items:
                    norm = normalize_cat(item.get("type", item.get("category", "")))
                    raw = item.get("type", "")
                    label = type_label(norm, raw)
                    if label not in name_parts:  # avoid "Top & Top"
                        name_parts.append(label)
                
                outfit_name = f"{occ_prefix} {' & '.join(name_parts)}" if name_parts else f"{occ_prefix} Look"
                
                outfit_options.append({
                    "outfit_name": outfit_name,
                    "reason": "",
                    "items": items,
                })

        # If combinatorial found nothing, try AI as fallback
        if not outfit_options:
            _log.info("[DRESSING] Combinatorial found nothing, trying AI fallback")
            closet_summary = "\n".join([
                f"- {i.get('label', 'Unknown')} ({i.get('color', '')} {i.get('type', '')}) [ID: {i.get('id', '')}]"
                for i in closet_items
            ])
            prompt = CLOSET_PROMPT.format(
                occasion=occasion, weather=weather, color_palette=color_palette,
                body_type="Average", height="Average", budget="Mid-range",
                lifestyle="Casual", profession="Professional", style_goal="Confident", brands="Any"
            )
            messages = [
                {"role": "user", "content": f"Here is the user's closet:\n{closet_summary}"},
                {"role": "user", "content": prompt},
            ]
            result = call_groq_text(messages, temperature=0.7, timeout=90, max_tokens=4096)
            if result:
                outfit_list = result if isinstance(result, list) else (result.get("outfits") if isinstance(result, dict) else None)
                if isinstance(outfit_list, list):
                    for opt_count, opt in enumerate(outfit_list):
                        if opt_count >= 2:
                            break
                        item_ids = opt.get("item_ids", [])
                        items = []
                        for iid in item_ids:
                            found = None
                            for ci in closet_items:
                                if ci.get("id") == iid:
                                    found = ci
                                    break
                            if not found:
                                found = qdrant_get_item(iid)
                            if found:
                                items.append({
                                    "id": found.get("id", ""),
                                    "label": found.get("label", ""),
                                    "type": found.get("type", ""),
                                    "color": found.get("color", ""),
                                    "image_url": found.get("image_url", ""),
                                })
                        outfit_options.append({
                            "outfit_name": opt.get("outfit_name", "Styled Look"),
                            "reason": opt.get("reason", ""),
                            "items": items,
                        })

        if not outfit_options:
            return jsonify({"success": False, "error": "Could not compose outfits from your closet."})

        _log.info("[DRESSING] Success: %d outfit options generated", len(outfit_options))
        return jsonify({
            "success": True,
            "outfit_options": outfit_options,
        })
    except Exception as exc:
        _log.error("[DRESSING] Error: %s", exc, exc_info=True)
        return jsonify({"success": False, "error": f"Generation failed: {str(exc)[:100]}"}), 500

@app.route("/api/v1/upload-color-pdf", methods=["POST", "OPTIONS"], strict_slashes=False)
def upload_color_pdf():
    if request.method == "OPTIONS":
        return "", 204

    global _COLOR_MAPPINGS, _COLOR_NAMES

    # Check if file was uploaded
    if "file" not in request.files:
        return jsonify({"success": False, "error": "No file uploaded. Use multipart form with field 'file'."}), 400

    file = request.files["file"]
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        return jsonify({"success": False, "error": "File must be a PDF."}), 400

    try:
        pdf_bytes = file.read()
        if PdfReader is None:
            return jsonify({"success": False, "error": "pypdf is not installed or PdfReader is None"}), 500
        reader = PdfReader(io.BytesIO(pdf_bytes))
        extracted_text = ""
        for page in reader.pages:
            text = page.extract_text()
            if text:
                extracted_text += text + "\n"

        if not extracted_text.strip():
            return jsonify({
                "success": False, 
                "error": "Could not extract text from PDF. It may be a scanned image PDF.",
                "note": "The built-in color dictionary with 130 fashion colors is already loaded."
            }), 400

        found_colors = {}

        # Pattern 1: "ColorName: #HEX" or "ColorName - #HEX"
        for match in re.finditer(r'([A-Za-z]+(?:\s+[A-Za-z]+)*)\s*[:\-]\s*#([0-9A-Fa-f]{6})', extracted_text):
            name = match.group(1).strip()
            hex_code = "#" + match.group(2).upper()
            if name and len(name) > 1:
                found_colors[name] = hex_code

        # Pattern 2: "#HEX ColorName" 
        if not found_colors:
            for match in re.finditer(r'#([0-9A-Fa-f]{6})\\s+([A-Za-z]+(?:\s+[A-Za-z]+)*)', extracted_text):
                hex_code = "#" + match.group(1).upper()
                name = match.group(2).strip()
                if name and len(name) > 1:
                    found_colors[name] = hex_code

        # Pattern 3: Lines with hex codes and color names
        if not found_colors:
            for match in re.finditer(r'([A-Za-z]+(?:\s+[A-Za-z]+)*)[,\s]+#([0-9A-Fa-f]{6})', extracted_text):
                name = match.group(1).strip()
                hex_code = "#" + match.group(2).upper()
                if name and len(name) > 1:
                    found_colors[name] = hex_code

        if found_colors:
            # Merge with existing dictionary
            _COLOR_MAPPINGS.update(found_colors)
            _COLOR_NAMES = sorted(_COLOR_MAPPINGS.keys())
            with open(_COLOR_DICT_PATH, 'w') as f:
                json.dump(_COLOR_MAPPINGS, f, indent=2)
            _log.info("[COLOR] Added %d colors from PDF, total: %d", len(found_colors), len(_COLOR_NAMES))
            return jsonify({
                "success": True,
                "message": f"Extracted {len(found_colors)} color names from PDF.",
                "colors": list(found_colors.keys()),
                "total_colors": len(_COLOR_NAMES)
            })
        else:
            return jsonify({
                "success": False,
                "error": "Could not find color patterns (e.g., 'ColorName: #HEX') in PDF text.",
                "extracted_preview": extracted_text[:500],
                "note": "The built-in color dictionary with 130 fashion colors is already loaded."
            }), 400

    except Exception as exc:
        _log.error("[COLOR-PDF] Upload error: %s", exc)
        return jsonify({"success": False, "error": f"PDF processing error: {str(exc)}"}), 500

@app.route("/api/v1/color-dictionary", methods=["GET", "OPTIONS"], strict_slashes=False)
def get_color_dictionary():
    if request.method == "OPTIONS":
        return "", 204
    return jsonify({
        "success": True,
        "total_colors": len(_COLOR_NAMES),
        "colors": _COLOR_NAMES,
        "mappings": _COLOR_MAPPINGS
    })

# Debug & Health
# ---------------------------------------------------------------------------
@app.route("/debug/analyze", methods=["POST"], strict_slashes=False)
def debug_analyze():
    data = request.get_json(silent=True) or {}
    image_b64 = data.get("image_b64")
    if not image_b64:
        return jsonify({"error": "Missing image_b64"}), 400
    compressed = compress_image_b64(image_b64)
    headers = {"Content-Type": "application/json", "api-key": MIMO_API_KEY, "HTTP-Referer": "https://luxor.ly", "X-Title": "LuxorHub"}
    features = _extract_image_features(image_b64)
    models_to_try = [MIMO_VISION_MODEL]
    for model in models_to_try:
        payload = {"model": model, "messages": [{"role": "user", "content": [{"type": "text", "text": SACRED_PROMPT + "\n\nExtracted image features: " + features}, {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{compressed}"}}]}], "max_tokens": CIPHER_MAX_TOKENS, "temperature": 0.2}
        try:
            resp = requests.post(MIMO_API_URL, json=payload, headers=headers, timeout=120)
            if resp.status_code == 200:
                return jsonify({"status": "success", "code": 200, "model": model, "raw": resp.json()})
            elif resp.status_code == 429:
                continue
            return jsonify({"status": "error", "code": resp.status_code, "model": model, "text": resp.text[:500]})
        except Exception as e:
            continue

    # Text fallback for debug
    text_prompt = f"{SACRED_PROMPT}\n\nVision API unavailable. Using extracted features:\n{features}\n\nReturn the JSON as requested."
    payload = {"model": MIMO_TEXT_MODEL, "messages": [{"role": "user", "content": text_prompt}], "max_tokens": CIPHER_MAX_TOKENS}
    try:
        resp = requests.post(MIMO_API_URL, json=payload, headers=headers, timeout=30)
        return jsonify({"status": "success" if resp.status_code == 200 else "error", "code": resp.status_code, "model": "mimo_text_fallback", "raw": resp.json() if resp.status_code == 200 else {}, "text": resp.text[:500] if resp.status_code != 200 else ""})
    except Exception as e:
        return jsonify({"status": "exception", "error": str(e)})

@app.route("/", methods=["GET"], strict_slashes=False)
@app.route("/api/health", methods=["GET"], strict_slashes=False)
@app.route("/health", methods=["GET"], strict_slashes=False)
def health():
    closet_count = len(qdrant_get_all_items())
    return jsonify({
        "status": "ok",
        "service": "luxor-fashion-omega-v5",
        "mimo_configured": bool(MIMO_API_KEY),
        "mimo_key_prefix": MIMO_API_KEY[:8] if MIMO_API_KEY else "",
        "blob_configured": bool(BLOB_READ_WRITE_TOKEN),
        "qdrant_configured": bool(QDRANT_URL and QDRANT_API_KEY),
        "closet_items": closet_count,
    })

# ---------------------------------------------------------------------------
# Entrypoint
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=False)