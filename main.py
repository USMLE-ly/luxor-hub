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
import re
import time
import urllib.parse
import uuid
from concurrent.futures import TimeoutError
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
    # For mediapipe >=0.10.x, use python.solutions path
    from mediapipe.python.solutions.selfie_segmentation import SelfieSegmentation
    _HAS_MEDIAPIPE = True
except ImportError:
    cv2: Any = None
    mp: Any = None
    SelfieSegmentation: Any = None
    _HAS_MEDIAPIPE = False
from dotenv import load_dotenv

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

# ---------------------------------------------------------------------------
# Environment
# ---------------------------------------------------------------------------
MIMO_API_KEY = os.getenv("MIMO_API_KEY", "sk-sryom8h5q2pvhbuibrgq5kfpnmqxrnuv5vjlnxkkic1u0oot")
MIMO_API_URL = "https://api.xiaomimimo.com/v1/chat/completions"
MIMO_VISION_MODEL = os.getenv("MIMO_VISION_MODEL", "mimo-v2-omni")
MIMO_TEXT_MODEL = os.getenv("MIMO_TEXT_MODEL", "mimo-v2.5-pro")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_VISION_MODEL = "qwen/qwen-2.5-vl-72b-instruct:free"
CIPHER_MAX_TOKENS = int(os.getenv("CIPHER_MAX_TOKENS", "1500"))
PORT = int(os.getenv("PORT", "5000"))

# Vercel Blob
BLOB_READ_WRITE_TOKEN = os.getenv("BLOB_READ_WRITE_TOKEN", "")

# Qdrant
QDRANT_URL = os.getenv("QDRANT_URL", "")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY", "")

_log.info("MiMo API key loaded: %s (masked: %s)", bool(MIMO_API_KEY), MIMO_API_KEY[:8] + "..." + MIMO_API_KEY[-4:] if MIMO_API_KEY else "NONE")
_log.info("MiMo vision model: %s", MIMO_VISION_MODEL)
_log.info("MiMo text model: %s", MIMO_TEXT_MODEL)
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

def _get_qdrant_closet() -> Any:
    global _qdrant_closet
    if _qdrant_closet is None and QDRANT_URL and QDRANT_API_KEY:
        try:
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
    if not client or qdrant_models is None:
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
    if not client or qdrant_models is None:
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
    if not client or qdrant_models is None:
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
SACRED_PROMPT = """ABSOLUTE REALITY RULES — CLASSIFY, DO NOT GENERATE:

1. COLORS: Use EXACTLY the color of the garment. If the shirt is BLUE, write "Blue T-Shirt", NOT "Navy" or "Charcoal".
2. GARMENTS: Identify the EXACT garment type. A T-Shirt is "T-Shirt", NOT "Sweater" or "Top".
3. PER ITEM: For each garment, state its EXACT Color + Type + Material/Pattern if visible.
4. BACKGROUND: The background has been REMOVED and replaced with WHITE. IGNORE the white. Look ONLY at the clothing on the person.
5. COLOR LOCK: Only use precise color names from the official dictionary provided. Do NOT invent color names.
6. ACCESSORIES: Look VERY carefully for ALL small accessories. Check for earrings, necklaces, bracelets, rings, watches, belts, scarves, hats, glasses, bags, and hair accessories. List EVERY visible accessory separately. Do NOT miss earrings or necklaces even if small.
7. NEVER hallucinate garments or colors. If something is not visible, set it to "None".
7. REALITY CHECK: If you cannot clearly identify an item, state exactly what is partially visible. Do NOT guess.

Return ONLY this valid JSON with NO extra text:
{
  "gender": "Female" or "Male",
  "vibe_type": "Casual | Formal | Business | Sporty | Date Night | Party | Bohemian | Streetwear | Minimalist | Vintage",
  "top_type": "Exact Color + Garment (e.g. 'Blue T-Shirt') or 'None'",
  "bottom_type": "Exact Color + Garment (e.g. 'Black Jeans') or 'None'",
  "footwear": "Exact Color + Footwear (e.g. 'White Sneakers') or 'None'",
  "accessories": "Comma-separated list of ALL accessories visible (e.g. 'Gold Hoop Earrings, Layered Necklace') or 'None'",
  "style_score": int(70-95),
  "style_name": "2-word vibe (e.g. 'Casual Chic')",
  "strengths": ["3 real, specific strengths based ONLY on actual garments in the photo"],
  "audit": "max 15 word outfit summary of the REAL clothing only",
  "tweak_plan": "1 specific improvement suggestion based on actual outfit",
  "generation_prompt": "20-word editorial prompt with this exact outfit"
}

CRITICAL RULES:
- style_score=int between 70-95
- strengths MUST be an array of exactly 3 strings
- Each strength MUST reference a real garment visible in the image
- ONLY output valid JSON. NO markdown. NO commentary. NO explanations."""

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
        # When MediaPipe is unavailable, use a tighter center crop
        # Assume person is in the center 50% of the image
        _log.info("[MASK] MediaPipe unavailable, using smart center crop")
        crop_ratio = 0.45  # Crop to center 45%
        cx, cy = w // 2, h // 2
        crop_size = int(min(w, h) * crop_ratio)
        left = max(0, cx - crop_size)
        top = max(0, cy - crop_size)
        right = min(w, cx + crop_size)
        bottom = min(h, cy + crop_size)
        cropped = img.crop((left, top, right, bottom))
        buf = io.BytesIO()
        cropped.save(buf, format="JPEG", quality=95)
        _log.info("[MASK] Center crop fallback: %dx%d -> %dx%d", w, h, cropped.size[0], cropped.size[1])
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
    """
    Extract dominant color names from image pixels using centroid matching.
    This now runs on the MASKED image (person only), so background shadows are gone.
    """
    global _COLOR_MAPPINGS, _COLOR_NAMES
    try:
        # First, mask out the background so we only analyze the person's clothing
        masked_b64 = _extract_person_center_crop(image_b64)
        raw = base64.b64decode(masked_b64)
        img = Image.open(io.BytesIO(raw))
        # Resize for speed
        img = img.resize((64, 96), Image.Resampling.LANCZOS)
        if img.mode != 'RGB':
            img = img.convert('RGB')
        pixel_array = np.array(img)
        pixel_data = pixel_array.reshape(-1, 3).tolist()

        # FILTER OUT white/near-white background pixels from the masked image
        # The person is isolated on a white background, so skip pixels > 90% white
        # Also skip pure-black edges from mask boundaries
        pixel_data = [
            p for p in pixel_data
            if not (p[0] > 230 and p[1] > 230 and p[2] > 230)
        ]
        if not pixel_data:
            _log.warning('[PIXEL] All pixels were white background - no clothing found')
            return []

        # Simple color quantization using average of similar pixels
        quantized = [(r // 32 * 32, g // 32 * 32, b // 32 * 32) for r, g, b in pixel_data]
        color_counts = Counter(quantized)
        top_pixels = [item[0] for item in color_counts.most_common(num_colors + 3)]

        # Re-rank by color saturation to prefer garment colors over skin tones
        # More saturated pixels are more likely to be clothing, less likely to be skin
        def _sat(rgb):
            r, g, b = [x/255.0 for x in rgb]
            mx, mn = max(r, g, b), min(r, g, b)
            return mx - mn
        top_pixels.sort(key=lambda x: _sat(x), reverse=True)

        # Match each dominant pixel to closest color name in dictionary
        # Common clothing colors get a preference boost (reduces edge-case matches)
        COMMON_CLOTHING_COLORS = {
            "Black", "White", "Navy", "Blue", "Red", "Green", "Grey", "Brown",
            "Beige", "Cream", "Ivory", "Tan", "Pink", "Purple", "Yellow",
            "Orange", "Gold", "Silver", "Teal", "Maroon", "Burgundy", "Olive",
            "Coral", "Mint", "Lavender", "Peach", "Turquoise", "Indigo",
            "Charcoal", "Denim", "Camel", "Mustard", "Blush", "Mauve",
            "Forest Green", "Sky Blue", "Royal Blue", "Baby Blue", "Hot Pink"
        }
        matched_colors = []
        for r, g, b in top_pixels:
            # Dark pixel rule: if all channels are very dark (<60), force to Black/Navy
            # This prevents edge artifacts (color cast at mask boundaries) from creating fake colors
            if max(r, g, b) < 120:
                if b > r + 20 and b > g + 20 and b > 60:
                    matched_colors.append("Navy")
                else:
                    matched_colors.append("Black")
                continue
            
            best_name = None
            best_score = float('inf')
            for name, hex_code in _COLOR_MAPPINGS.items():
                hex_code = hex_code.lstrip('#')
                cr, cg, cb = int(hex_code[0:2], 16), int(hex_code[2:4], 16), int(hex_code[4:6], 16)
                # Weighted Euclidean distance (human perception weighting)
                dist = ((r - cr) ** 2 * 0.3 + (g - cg) ** 2 * 0.59 + (b - cb) ** 2 * 0.11) ** 0.5
                # Apply preference boost: common clothing colors get a 15% distance bonus
                adjusted = dist * 0.85 if name in COMMON_CLOTHING_COLORS else dist
                if adjusted < best_score:
                    best_score = adjusted
                    best_dist = dist  # keep original for threshold check
                    best_name = name
            if best_name and best_dist < 120:  # Only accept if reasonably close
                matched_colors.append(best_name)

        # Filter out skin-tone colors that aren't actual garment colors
        SKIN_TONES = {"Beige", "Tan", "Nude", "Nude Blush", "Camel", "Taupe", 
                       "Caramel", "Mocha", "Bronze", "Copper", "Peach", "Apricot",
                       "Blush", "Dusty Rose", "Rose Gold", "Nude Glow"}
        # Also filter out background/nature colors that are never clothing
        BACKGROUND_COLORS = {"Moss", "Sage", "Olive", "Forest Green", "Hunter Green", 
                               "Army Green", "Brown", "Chocolate", "Chestnut", "Ochre",
                               "Rust", "Terra Cotta", "Leopard", "Zebra", "Metallic Silver",
                               "Metallic Gold", "Holographic", "Sequin", "Lace", "Patent Leather",
                               "Canary", "Honey", "Pumpkin"}
        matched_colors = [c for c in matched_colors if c not in SKIN_TONES and c not in BACKGROUND_COLORS]

        # Deduplicate and return
        seen = set()
        unique_colors = []
        for c in matched_colors:
            if c not in seen:
                seen.add(c)
                unique_colors.append(c)
        return unique_colors[:num_colors]
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

def _extract_image_features(image_b64: str) -> str:
    """Extract color/features from image locally, return text description."""
    try:
        raw = base64.b64decode(image_b64)
        img = Image.open(io.BytesIO(raw))
        # Resize for speed
        img_small = img.resize((32, 48), Image.Resampling.LANCZOS)
        # Ensure RGB for type checker
        if img_small.mode != 'RGB':
            img_small = img_small.convert('RGB')
        pixel_array = np.array(img_small)
        pixel_data = pixel_array.reshape(-1, 3).tolist()
        quantized = []
        for r, g, b in pixel_data:
            # Map to nearest color name
            quantized.append((r // 64 * 64, g // 64 * 64, b // 64 * 64))

        color_counts = Counter(quantized)
        top_colors = color_counts.most_common(5)

        # Convert RGB to color names using the color dictionary
        COMMON_CLOTHING_COLORS = {
            "Black", "White", "Navy", "Blue", "Red", "Green", "Grey", "Brown",
            "Beige", "Cream", "Ivory", "Tan", "Pink", "Purple", "Yellow",
            "Orange", "Gold", "Teal", "Maroon", "Burgundy", "Olive",
            "Coral", "Mint", "Lavender", "Peach", "Turquoise", "Indigo",
            "Charcoal", "Denim", "Camel", "Mustard", "Blush", "Mauve",
            "Forest Green", "Sky Blue", "Royal Blue", "Baby Blue", "Hot Pink"
        }
        color_names = []
        for (r, g, b), count in top_colors:
            best_name = "unknown"
            best_dist = float('inf')
            for name, hex_code in _COLOR_MAPPINGS.items():
                hex_code = hex_code.lstrip('#')
                cr, cg, cb = int(hex_code[0:2], 16), int(hex_code[2:4], 16), int(hex_code[4:6], 16)
                dist = ((r - cr) ** 2 * 0.3 + (g - cg) ** 2 * 0.59 + (b - cb) ** 2 * 0.11) ** 0.5
                adjusted = dist * 0.85 if name in COMMON_CLOTHING_COLORS else dist
                if adjusted < best_dist:
                    best_dist = dist
                    best_name = name
            if best_name and best_dist < 100 and best_name not in color_names:
                color_names.append(best_name)

        # Determine if image has a person-like shape (simple heuristic)
        w, h = img.size
        aspect = w / h

        features = []
        features.append(f"Image aspect ratio: {aspect:.2f}")
        features.append(f"Dominant colors: {', '.join(color_names)}")
        features.append(f"Image size: {w}x{h} pixels")

        # Simple brightness analysis
        gray = img.convert('L')
        raw_pixels = [p for p in gray.getdata()]
        avg_brightness = sum(int(p) if isinstance(p, (int, float)) else 0 for p in raw_pixels) / len(raw_pixels)
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
    if not MIMO_API_KEY:
        return None

    # Mask out background using person segmentation FIRST
    masked_b64 = _extract_person_center_crop(image_b64)
    
    # Also extract face/upper-body close-up for better accessory detection
    face_b64 = _extract_face_upper_crop(image_b64)

    # Inject color dictionary into the prompt explicitly
    color_list = ", ".join(_COLOR_NAMES) if _COLOR_NAMES else "Black, White, Blue, Red, Green"
    color_directive = f"**COLOR DICTIONARY LOCK — ABSOLUTE REQUIREMENT:** You MUST choose every color name from THIS EXACT LIST. Do NOT invent any color name. Valid colors: {color_list}. If a garment color is close to one of these, use that exact name. Never use generic descriptions like 'dark' or 'light'."
    colored_prompt = system_prompt + "\n\n" + color_directive + "\n\n**NOTE 1:** The first photo has been processed to REMOVE THE BACKGROUND. You will see the person isolated on a WHITE background. IGNORE THE WHITE BACKGROUND and look ONLY at the clothing colors.\n\n**NOTE 2:** The second photo is a CLOSE-UP of the upper body (head, neck, upper chest). LOOK VERY CAREFULLY at this image to detect SMALL accessories like earrings, necklaces, glasses, and hair accessories. This is critical - do not miss any jewelry."

    compressed = compress_image_b64(masked_b64)
    face_compressed = compress_image_b64(face_b64)
    headers = {"Content-Type": "application/json", "api-key": MIMO_API_KEY, "HTTP-Referer": "https://luxor.ly", "X-Title": "LuxorHub"}

    # Try vision model with BOTH images: full-body masked + face close-up
    vision_payload = {
        "model": MIMO_VISION_MODEL,
        "messages": [{"role": "user", "content": [
            {"type": "text", "text": colored_prompt},
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{compressed}"}},
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{face_compressed}"}},
        ]}],
        "max_tokens": CIPHER_MAX_TOKENS,
        "temperature": temperature,
        "response_format": {"type": "json_object"},
    }
    try:
        _log.info("[MIMO-VISION] Trying vision model=%s", MIMO_VISION_MODEL)
        resp = requests.post(MIMO_API_URL, json=vision_payload, headers=headers, timeout=60)
        _log.info("[MIMO-VISION] HTTP %s: %s", resp.status_code, resp.text[:200])
        if resp.status_code == 200:
            raw = resp.json()["choices"][0]["message"]["content"]
            match = re.search(r"\{[\s\S]*\}", raw)
            if match:
                result = json.loads(match.group(0))
                result["source"] = "cipher_vision"
                return result
        # If model not supported (400 with "Not supported model"), don't retry
        if resp.status_code == 400 and "Not supported model" in resp.text:
            _log.warning("[MIMO-VISION] Model %s not supported by this API key", MIMO_VISION_MODEL)
        else:
            _log.warning("[MIMO-VISION] Vision API returned %s, trying fallback", resp.status_code)
    except Exception as exc:
        _log.error("[MIMO-VISION] %s", exc)

    # === FALLBACK: Try OpenRouter as backup provider ===
    if OPENROUTER_API_KEY:
        try:
            _log.info("[OPENROUTER] Trying fallback vision model=%s", OPENROUTER_VISION_MODEL)
            or_headers = {"Content-Type": "application/json", "Authorization": f"Bearer {OPENROUTER_API_KEY}", "HTTP-Referer": "https://luxor.ly", "X-Title": "LuxorHub"}
            or_payload = {
                "model": OPENROUTER_VISION_MODEL,
                "messages": [{"role": "user", "content": [
                    {"type": "text", "text": colored_prompt},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{compressed}"}},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{face_compressed}"}},
                ]}],
                "max_tokens": CIPHER_MAX_TOKENS,
                "temperature": temperature,
            }
            or_resp = requests.post("https://openrouter.ai/api/v1/chat/completions", json=or_payload, headers=or_headers, timeout=60)
            _log.info("[OPENROUTER] HTTP %s: %s", or_resp.status_code, or_resp.text[:200])
            if or_resp.status_code == 200:
                or_raw = or_resp.json()["choices"][0]["message"]["content"]
                or_match = re.search(r"\{[\s\S]*\}", or_raw)
                if or_match:
                    or_result = json.loads(or_match.group(0))
                    or_result["source"] = "openrouter_vision"
                    return or_result
        except Exception as or_exc:
            _log.error("[OPENROUTER] %s", or_exc)

    _log.warning("[MIMO-VISION] All vision models failed - trying text-only fallback")
    
    # === FALLBACK: Use text model with locally extracted image features ===
    try:
        _log.info("[MIMO-TEXT-FALLBACK] Using text model with extracted image features")
        features = _extract_image_features(compressed)
        # Extract pixel colors for accurate color information
        pixel_colors = _get_dominant_colors_from_pixels(image_b64, num_colors=5)
        pixel_color_str = ", ".join(pixel_colors) if pixel_colors else "unknown"
        
        # Extract regional colors (top, bottom, footwear separately)
        regional = _extract_regional_colors(image_b64)
        top_colors = ", ".join(regional.get("top", [])) or "unknown"
        bottom_colors = ", ".join(regional.get("bottom", [])) or "unknown"
        footwear_colors = ", ".join(regional.get("footwear", [])) or "unknown"
        
        text_prompt = f"""You are a hyper-accurate fashion identification AI running without vision. Use the EXTRACTED DATA below to analyze the outfit.

CRITICAL RULES:
1. COLORS come ONLY from the extracted pixel data below. Never invent colors.
2. GARMENT TYPES must be reasonable inferences from the color distribution and image properties.
3. If the top region shows light colors and the bottom region shows dark colors, the person is wearing a light top with dark bottoms.
4. If only one color dominates all regions, the outfit is likely monochromatic.
5. NEVER reference background, environment, or setting. Focus ONLY on clothing.
6. Use colors ONLY from the official list: {color_list}

EXTRACTED COLOR DATA:
- Full image dominant colors: {pixel_color_str}
- Top region (upper body) colors: {top_colors}
- Bottom region (lower body) colors: {bottom_colors}
- Footwear region colors: {footwear_colors}
- Image features: {features[:200]}

Based on this data, generate a COMPLETE fashion analysis JSON.
- top_type: Use the top region color + a reasonable garment type
- bottom_type: Use the bottom region color + a reasonable garment type  
- footwear: Use footwear region color + reasonable footwear type
- accessories: "None" unless there are clear signs
- style_score: int 70-95 based on how well the colors complement each other
- style_name: 2-word vibe that fits the color story
- strengths: 3 specific observations about the actual detected colors and inferred garments
- audit: max 15 word summary of the inferred outfit
- tweak_plan: 1 specific improvement suggestion
- generation_prompt: 20-word editorial prompt
- vibe_type: one of: Casual, Formal, Business, Sporty, Date Night, Party, Bohemian, Streetwear, Minimalist, Vintage

Return ONLY valid JSON. No markdown. No explanations."""
        
        text_payload = {
            "model": MIMO_TEXT_MODEL,
            "messages": [{"role": "user", "content": text_prompt}],
            "max_tokens": CIPHER_MAX_TOKENS,
            "temperature": temperature,
            "response_format": {"type": "json_object"},
        }
        resp = requests.post(MIMO_API_URL, json=text_payload, headers=headers, timeout=30)
        _log.info("[MIMO-TEXT-FALLBACK] HTTP %s", resp.status_code)
        if resp.status_code == 200:
            raw = resp.json()["choices"][0]["message"]["content"]
            match = re.search(r"\{[\s\S]*\}", raw)
            if match:
                result = json.loads(match.group(0))
                result["source"] = "text_fallback"
                _log.info("[MIMO-TEXT-FALLBACK] Success! Style=%s Score=%s", 
                          result.get("style_name"), result.get("style_score"))
                return result
    except Exception as exc:
        _log.error("[MIMO-TEXT-FALLBACK] %s", exc)
    
    _log.warning("[MIMO-VISION] All models failed - returning None")
    return None

def call_groq_text(messages: List[Dict[str, str]], system_prompt: str = "", temperature: float = 0.7) -> Optional[Dict[str, Any]]:
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
            "max_tokens": CIPHER_MAX_TOKENS,
            "temperature": temperature,
        }
        try:
            _log.info("[MIMO-TEXT] Trying model=%s", model)
            resp = requests.post(MIMO_API_URL, json=payload, headers=headers, timeout=15)
            _log.info("[MIMO-TEXT] HTTP %s for %s (key=%s...)", resp.status_code, model, MIMO_API_KEY[:8] if MIMO_API_KEY else "NONE")
            if resp.status_code == 200:
                raw = resp.json()["choices"][0]["message"]["content"]
                match = re.search(r"\{[\s\S]*\}", raw)
                if match:
                    return json.loads(match.group(0))
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
# Based on removing AI patterns: "Well-chosen X", rule-of-three, generic praise
# ---------------------------------------------------------------------------
_STRENGTH_TEMPLATES = {
    "top": [
        "The {color} {garment} sets the tone — {quality}",
        "That {color} {garment} works because {reason}",
        "The {color} {garment} is the right kind of {adjective}",
    ],
    "bottom": [
        "The {color} {garment} keeps things grounded — {quality}",
        "Those {color} {garment} {detail}",
        "The {color} {garment} balance out the top nicely",
    ],
    "footwear": [
        "The {color} {garment} {detail}",
        "Smart call on the {color} {garment} — {quality}",
        "The {color} {garment} finish the look without stealing focus",
    ],
    "accessory": [
        "The {color} {garment} adds just the right amount of polish",
        "Nice touch with the {color} {garment} — {quality}",
        "The {color} {garment} pulls attention where it matters",
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
    },
    "bottom": {
        "qualities": [
            "they let the top do the talking",
            "the wash gives them character without being loud",
            "they're tailored well — not too tight, not too loose",
        ],
        "details": [
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
        "details": [
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
    },
}

def _humanize_strengths(items: List[str]) -> List[str]:
    """Generate human-sounding strength statements from detected items.
    Avoids classic AI patterns: 'Well-chosen X', rule-of-three, generic praise."""
    import random
    
    # Use a stable seed based on item content for reproducibility
    seed = hash("|".join(items)) & 0x7FFFFFFF
    rng = random.Random(seed)
    
    strengths = []
    for item in items[:4]:  # Max 4 items
        item_lower = item.lower()
        words = item.split()
        color = words[0] if len(words) > 0 else ""
        garment = " ".join(words[1:]) if len(words) > 1 else words[0]
        
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
        
        # Pick a random template and fill it
        template = rng.choice(templates)
        quality = rng.choice(details.get("qualities", [""])) if details.get("qualities") else ""
        adjective = rng.choice(details.get("adjectives", [""])) if details.get("adjectives") else ""
        reason = rng.choice(details.get("reasons", [""])) if details.get("reasons") else ""
        detail = rng.choice(details.get("details", [""])) if details.get("details") else ""
        
        strength = template.format(
            color=color, garment=garment,
            quality=quality, adjective=adjective,
            reason=reason, detail=detail
        )
        # Clean up: capitalize first letter, ensure it ends with period
        strength = strength[0].upper() + strength[1:]
        if not strength.endswith((".", "!", "?")):
            strength += "."
        strengths.append(strength)
    
    return strengths


def _humanize_audit(items: List[str], style_name: str) -> str:
    """Generate a natural-sounding outfit summary. Avoids 'A well-coordinated outfit...'"""
    if not items:
        return "Simple outfit that gets the job done."
    
    item_count = len(items)
    top = items[0] if item_count > 0 else ""
    bottom = items[1] if item_count > 1 else ""
    extra = items[2] if item_count > 2 else ""
    
    if item_count == 1:
        return f"A {top.lower()} doing the heavy lifting — sometimes that's all you need."
    elif item_count == 2:
        return f"{top} and {bottom.lower()}. Clean, intentional, nothing wasted."
    elif item_count >= 3:
        return f"{top}, {bottom.lower()}, and {extra.lower()} — each piece earns its place."
    return f"A {style_name.lower()} look built from {item_count} intentional pieces."


def _humanize_tweak(tweak: str, items: List[str]) -> str:
    """Humanize the tweak_plan — remove 'Consider adding...' boilerplate."""
    if not tweak or tweak.startswith("Consider"):
        # Generate a specific suggestion based on what's missing
        has_accessory = any(a in " ".join(items).lower() for a in ["necklace", "earring", "bracelet", "watch", "ring", "belt", "scarf"])
        has_layers = any(l in " ".join(items).lower() for l in ["jacket", "blazer", "cardigan", "coat"])
        
        if not has_accessory and not has_layers:
            return "Add a simple necklace or a structured jacket to take this up a notch."
        elif not has_accessory:
            return "Add a watch or a subtle necklace for some extra polish."
        elif not has_layers:
            return "Add a lightweight jacket or blazer to give this more structure."
        else:
            return "Add a belt or a different bag if you want to shift the vibe — this already works well."
    
    # Clean up common AI phrases in the AI-generated tweak
    tweak = tweak.replace("Consider adding ", "Try adding ")
    tweak = tweak.replace("Consider swapping ", "Swap ")
    tweak = tweak.replace("for a more polished look", "for a sharper feel")
    tweak = tweak.replace("for a more put-together appearance", "for a cleaner look")
    return tweak


# Global cache for pixel analysis
_image_b64_cache = ""

# Fashion Decision
# ---------------------------------------------------------------------------
def get_fashion_decision(image_b64: str) -> Dict[str, Any]:
    try:
        result = call_groq_vision(image_b64, SACRED_PROMPT, 0.2)
        if result:
            # Preserve the source from call_groq_vision (e.g. "text_fallback" or "cipher_vision")
            return result
    except TimeoutError:
        _log.warning("[PIPELINE] Timed out")
    except Exception as exc:
        _log.error("[PIPELINE] %s", exc)
    return {"style_name": "", "gender": "", "vibe_type": "Casual", "top_type": "", "bottom_type": "", "footwear": "", "accessories": "", "actual_colors": [], "items_detected": [], "strengths": [], "audit": "", "tweak_plan": "", "generation_prompt": "", "style_score": None, "source": "fallback"}

def map_analysis(result: Dict[str, Any]) -> Dict[str, Any]:
    items_detected = []
    # Debug: log what the AI actually returned
    _log.info("[MAP-DEBUG] AI returned: style_name=%s score=%s colors=%s top=%s bottom=%s footwear=%s",
              result.get("style_name"), result.get("style_score"), 
              result.get("actual_colors"),
              result.get("top_type"), result.get("bottom_type"), result.get("footwear"))
    for key in ["top_type", "bottom_type", "footwear", "accessories"]:
        val = result.get(key, "")
        if val and val != "None" and val.lower() != "none":
            items_detected.append(val)
    global _image_b64_cache

    # === STEP 1: Extract REAL colors from the masked image pixels (person only) ===
    pixel_colors = _get_dominant_colors_from_pixels(_image_b64_cache) if _image_b64_cache else []
    _log.info("[MAP] Pixel extraction returned: %s", pixel_colors)

    # === STEP 2: Use items-based colors (pixel-backed) for meaningful output ===
    if pixel_colors and len(pixel_colors) >= 1:
        # Extract the first color word from each detected item for a meaningful color list
        item_based_colors = []
        for key in ["top_type", "bottom_type", "footwear"]:
            val = result.get(key, "")
            if val and val != "None" and val.lower() != "none":
                first_word = val.split()[0].strip(',.!?;:').lower().capitalize()
                if first_word and first_word not in item_based_colors:
                    item_based_colors.append(first_word)
        # Use item-based colors if they exist, fall back to pixel colors
        if item_based_colors:
            actual_colors = item_based_colors[:3]
            _log.info("[MAP] Using item-derived colors: %s (pixel: %s)", actual_colors, pixel_colors)
        else:
            actual_colors = pixel_colors
            _log.info("[MAP] Using REAL pixel colors: %s", pixel_colors)
    else:
        # === STEP 3: Fallback to AI colors with validation ===
        actual_colors = result.get("actual_colors", [])
        if not actual_colors or not isinstance(actual_colors, list):
            actual_colors = []
        if pixel_colors:
            actual_colors = _validate_colors_with_pixels(actual_colors, pixel_colors)

        # === STEP 4: Reality filter — ONLY for AI hallucinated colors, NOT pixel colors ===
        background_indicators = {"Concrete", "Camo Green", "Camo Brown", "Acid Wash", "Slate", "Silver", "Khaki", "Coffee", "Charcoal", "Steel", "Espresso"}
        if actual_colors and any(c in background_indicators for c in actual_colors):
            _REAL_COLORS_MAP = {
                "shirt": "White", "pants": "Black", "jeans": "Blue", "sneakers": "White",
                "boots": "Black", "dress": "Navy", "cardigan": "Beige", "blazer": "Navy",
                "jacket": "Black", "skirt": "Black", "shorts": "Black", "top": "White",
                "sweater": "Grey", "hoodie": "Grey", "coat": "Black",
            }
            mapped_colors = []
            for item in items_detected:
                for keyword, color in _REAL_COLORS_MAP.items():
                    if keyword in item.lower():
                        mapped_colors.append(color)
                        break
            if mapped_colors:
                actual_colors = list(dict.fromkeys(mapped_colors))[:3]
                _log.info("[REALITY-FILTER] Overrode hallucinated colors -> %s (items: %s)", actual_colors, items_detected)

        # === STEP 5: If still no colors, smart fallback based on items ===
        if not actual_colors:
            default_colors = ["Black", "White"]
            for item in items_detected:
                item_lower = item.lower()
                if "floral" in item_lower or "print" in item_lower or "pattern" in item_lower:
                    default_colors = ["Navy", "Teal", "White"]; break
                elif "jeans" in item_lower or "denim" in item_lower:
                    default_colors = ["Blue", "White", "Tan"]; break
                elif "leather" in item_lower:
                    default_colors = ["Black", "Brown", "Gold"]; break
                elif "silk" in item_lower or "satin" in item_lower:
                    default_colors = ["Burgundy", "Blush", "Gold"]; break
                elif "cotton" in item_lower or "linen" in item_lower:
                    default_colors = ["White", "Beige", "Navy"]; break
            actual_colors = default_colors
    # ---- PHASE A: Clean up None values and merge accessories ----
    for item_key in ["top_type", "bottom_type", "footwear", "accessories"]:
        val = result.get(item_key, "")
        if val in ("None", "none", ""):
            if item_key == "accessories":
                result[item_key] = "None"
            else:
                result[item_key] = ""

    acc_val = result.get("accessories", "")
    if acc_val and acc_val != "Non Accessory" and "," in acc_val:
        parts = [p.strip() for p in acc_val.split(",") if p.strip()]
        if len(parts) >= 2:
            display = " + ".join(parts[:3])
            result["accessories"] = display

    # ---- PHASE B: Color correction BEFORE strength generation ----
    if pixel_colors and len(pixel_colors) >= 1:
        pixel_set = set(c.lower() for c in pixel_colors)
        color_words = set()
        for c in pixel_colors:
            for word in c.lower().split():
                color_words.add(word)
        
        for item_key in ["top_type", "bottom_type", "footwear"]:
            item_val = result.get(item_key, "")
            if not item_val or item_val in ("None", "none"):
                continue
            words = item_val.split()
            if len(words) < 2:
                continue
            
            first_word = words[0].strip(',.!?;:')
            HALLUCINATED = {"charcoal", "acid", "slate", "silver", "concrete", "khaki", "coffee", "burgundy", "camo"}
            
            # Fix strategy: correct hallucinated background colors, and fix grey→blue/navy when pixel colors confirm
            needs_correction = first_word.lower() in HALLUCINATED
            smart_override = False
            
            # Smart "grey" fix: if AI says grey but pixel colors contain blue/navy, correct to blue
            if not needs_correction and first_word.lower() in ("grey", "gray") and pixel_colors:
                blue_shades = {"blue", "navy", "denim", "steel blue", "sky blue", "royal blue", "cobalt", "ocean", "sapphire"}
                for pc in pixel_colors:
                    if pc.lower() in blue_shades:
                        needs_correction = True
                        smart_override = True
                        best_color = pc
                        break
            
            if needs_correction:
                best_color = ""
                if not smart_override:
                    best_color = pixel_colors[0]
                if item_key == "bottom_type" and any(bc in ['blue', 'denim', 'black', 'navy'] for bc in pixel_colors):
                    for bc in pixel_colors:
                        if bc.lower() in ('blue', 'black', 'navy', 'denim'):
                            best_color = bc
                            break
                elif item_key == "footwear" and any(fc in ['white', 'black', 'brown', 'beige'] for fc in pixel_colors):
                    for fc in pixel_colors:
                        if fc.lower() in ('white', 'black', 'brown', 'beige'):
                            best_color = fc
                            break
                words[0] = best_color
                corrected = ' '.join(words)
                result[item_key] = corrected
                _log.info("[COLOR-CORRECT] %s: '%s' -> '%s' (pixels: %s)", item_key, item_val, corrected, pixel_colors)

    # ---- PHASE C: Rebuild items_detected from color-corrected values ----
    items_detected = []
    for key in ["top_type", "bottom_type", "footwear", "accessories"]:
        val = result.get(key, "")
        if val and val != "None" and val.lower() != "none" and val != "Non Accessory":
            items_detected.append(val)

    # ---- PHASE D: Generate humanized strengths from CORRECTED items ----
    detected = [s for s in [result.get(k, "") for k in ["top_type", "bottom_type", "footwear", "accessories"]] if s and s != "None"]
    if detected:
        strengths = _humanize_strengths(detected)
    elif items_detected:
        strengths = _humanize_strengths(items_detected)
    else:
        strengths = ["The proportions work well together.", "The color palette makes sense for the context.", "It reads as intentional without being overdone."]

    style_score = result.get("style_score")
    if style_score is None or not isinstance(style_score, (int, float)) or style_score < 60:
        style_score = 78
    style_score = int(round(style_score))
    style_name = result.get("style_name", "")
    if not style_name:
        style_name = "Modern Classic"

    return {
        "success": True,
        "source": result.get("source", "unknown"),
        "style_name": style_name,
        "style_score": style_score,
        "vibe_type": result.get("vibe_type", "Casual"),
        "gender": result.get("gender", "Female"),
        "top_type": result.get("top_type", ""),
        "bottom_type": result.get("bottom_type", ""),
        "footwear": result.get("footwear", ""),
        "accessories": result.get("accessories", ""),
        "actual_colors": actual_colors,
        "items_detected": items_detected,
        "strengths": strengths,
        "audit": _humanize_audit(items_detected if items_detected else detected, style_name),
        "tweak_plan": _humanize_tweak(result.get("tweak_plan", ""), items_detected if items_detected else detected),
        "generation_prompt": result.get("generation_prompt", "A fashion-forward person wearing a stylish outfit in an editorial setting."),
    }

@app.route("/api/v1/analyze-outfit", methods=["POST", "OPTIONS"])
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
    except TimeoutError:
        _log.error("[ANALYZE] Timeout")
    except Exception as exc:
        _log.error("[ANALYZE] ERROR: %s", exc)
    return jsonify(map_analysis({"source": "fallback", "style_score": None}))

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
    # result should be a list of 2 outfits (or a dict with 'outfits' key)
    outfit_list = result if isinstance(result, list) else (result.get("outfits") if isinstance(result, dict) else None)
    if not isinstance(outfit_list, list) or not outfit_list:
        return jsonify({"success": False, "error": "Could not compose outfits"})

    # Use cast to help pyright narrow the type correctly
    outfit_list = cast("list[dict[str, Any]]", outfit_list)

    # Look up items by ID for each outfit
    outfit_options = []
    for opt_count, opt in enumerate(outfit_list):
        if opt_count >= 2:
            break
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
# ---------------------------------------------------------------------------
# Color Book PDF Upload
# ---------------------------------------------------------------------------
@app.route("/api/v1/upload-color-pdf", methods=["POST", "OPTIONS"])
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

@app.route("/api/v1/color-dictionary", methods=["GET", "OPTIONS"])
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
@app.route("/debug/analyze", methods=["POST"])
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

@app.route("/", methods=["GET"])
@app.route("/api/health", methods=["GET"])
@app.route("/health", methods=["GET"])
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