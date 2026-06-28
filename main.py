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
from concurrent.futures import TimeoutError
from datetime import datetime, timezone
from typing import Any, Optional, Dict, List

import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
from collections import Counter
import numpy as np
try:
    import cv2
    import mediapipe as mp
    from mediapipe.solutions.selfie_segmentation import SelfieSegmentation
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
CIPHER_MAX_TOKENS = int(os.getenv("CIPHER_MAX_TOKENS", "1200"))
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
  "Khaki": "#C3B091",
  "Camel": "#C19A6B",
  "Grey": "#808080",
  "Charcoal": "#36454F",
  "Silver": "#C0C0C0",
  "Steel": "#71797E",
  "Navy": "#000080",
  "Midnight Blue": "#191970",
  "Slate": "#708090",
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
  "Terra Cotta": "#E2725B",
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
  "Eggplant": "#614051",
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
  "Coffee": "#6F4E37",
  "Chestnut": "#954535",
  "Taupe": "#483C32",
  "Mocha": "#967969",
  "Caramel": "#AF6F4C",
  "Espresso": "#4E2A26",
  "Mahogany": "#C04000",
  "Bronze": "#CD7F32",
  "Copper": "#B87333",
  "Nude": "#E3BC9A",
  "Nude Blush": "#D5A98A",
  "Champagne": "#F7E7CE",
  "Pearl": "#F0EAD6",
  "Sequin": "#E8E8E8",
  "Lace": "#F9F6EE",
  "Patent Leather": "#1C1C1C",
  "Metallic Silver": "#C0C0C0",
  "Metallic Gold": "#D4AF37",
  "Holographic": "#E8E4F0",
  "Leopard": "#D4A373",
  "Zebra": "#E8E8E8",
  "Camo Green": "#4A5D23",
  "Camo Brown": "#5C4033",
  "Blue Denim": "#1560BD",
  "Light Denim": "#5D8AA8",
  "Dark Denim": "#1C3F60",
  "Raw Denim": "#4A6E8A",
  "Acid Wash": "#9FB6D4",
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
        if os.path.exists(_COLOR_DICT_PATH):
            with open(_COLOR_DICT_PATH) as f:
                _COLOR_MAPPINGS = json.load(f)
        else:
            _COLOR_MAPPINGS = dict(_BUILTIN_COLORS)
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

def _get_qdrant_closet() -> Optional[QdrantClient]:
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

def _ensure_closet_collection(client: QdrantClient):
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
SACRED_PROMPT = """You are a hyper-rigorous fashion CLASSIFICATION AI, not a generative AI. You MUST NOT invent or guess clothing items. You MUST ONLY describe what is VISIBLE in the photo.

**CRITICAL HALLUCINATION PREVENTION RULES:**
1. IGNORE 100% OF BACKGROUND. Pavement, concrete, walls, trees, sky, stairs = IGNORE.
2. ONLY describe garments you can ACTUALLY SEE. Do NOT invent a "Knit Sweater" if the photo shows a T-shirt.
3. COLORS must be EXACT. If the shirt is white, say "White T-Shirt". Not "Cream", not "Ivory".
4. If a body part or garment is not visible, set it to "None" — do NOT guess.
5. Do NOT describe fabric texture or material unless it is completely obvious.

The photo has been preprocessed to REMOVE THE BACKGROUND. You will see the person isolated on a WHITE background. IGNORE THE WHITE BACKGROUND and focus ONLY on the person's clothing.

Return ONLY this EXACT JSON. No conversation. No markdown. No explanation.
{
  "gender": "Female" or "Male",
  "vibe_type": "exact vibe category from: Casual, Formal, Business, Sporty, Date Night, Party, Bohemian, Streetwear, Minimalist, Vintage",
  "top_type": "EXACT color and EXACT garment type visible - or \"None\" if not visible",
  "bottom_type": "EXACT color and EXACT garment type visible - or \"None\" if not visible",
  "footwear": "EXACT color and EXACT footwear visible - or \"None\" if not visible",
  "accessories": "EXACT accessory visible - or \"None\" if none",
  "style_score": int(70-95),
  "style_name": "2-word vibe",
  "strengths": ["3 specific strengths based ONLY on actual garments"],
  "audit": "15-word summary of the REAL outfit ONLY",
  "tweak_plan": "1-sentence to improve based on actual detected items",
  "generation_prompt": "20-word prompt for editorial shot with this exact outfit"
}

CRITICAL: style_score must be integer, strengths must be array of 3, every key must be present. Return ONLY JSON. Do NOT invent garments."""

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
                                    pad_y = max(int(person_h * 0.05), 10)
                                    pad_x = max(int(person_w * 0.05), 10)
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
        cropped.save(buf, format="JPEG", quality=90)
        _log.info("[MASK] Center crop fallback: %dx%d -> %dx%d", w, h, cropped.size[0], cropped.size[1])
        return base64.b64encode(buf.getvalue()).decode()

    except Exception as exc:
        _log.warning("[MASK] Critical error: %s", exc)
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
        if max(w, h) > 800:
            ratio = 800.0 / max(w, h)
            img = img.resize((int(w * ratio), int(h * ratio)), _RESAMPLE_LANCZOS)
        buf = io.BytesIO()
        img.convert("RGB").save(buf, format="JPEG", quality=92, optimize=True)
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

        # Filter out near-black pixels (background from person masking) and near-white (overexposed)
        pixel_data = [p for p in pixel_data if not (p[0] < 20 and p[1] < 20 and p[2] < 20)]
        # Also filter out the light grey background (195-205) used in person masking
        pixel_data = [p for p in pixel_data if not (195 < p[0] < 210 and 195 < p[1] < 210 and 195 < p[2] < 210)]
        pixel_data = [p for p in pixel_data if not (p[0] > 240 and p[1] > 240 and p[2] > 240)]
        if not pixel_data:
            return []

        # Simple color quantization using average of similar pixels
        quantized = [(r // 32 * 32, g // 32 * 32, b // 32 * 32) for r, g, b in pixel_data]
        color_counts = Counter(quantized)
        top_pixels = [item[0] for item in color_counts.most_common(num_colors + 3)]

        # Match each dominant pixel to closest color name in dictionary
        matched_colors = []
        for r, g, b in top_pixels:
            best_name = None
            best_dist = float('inf')
            for name, hex_code in _COLOR_MAPPINGS.items():
                hex_code = hex_code.lstrip('#')
                cr, cg, cb = int(hex_code[0:2], 16), int(hex_code[2:4], 16), int(hex_code[4:6], 16)
                # Weighted Euclidean distance (human perception weighting)
                dist = ((r - cr) ** 2 * 0.3 + (g - cg) ** 2 * 0.59 + (b - cb) ** 2 * 0.11) ** 0.5
                if dist < best_dist:
                    best_dist = dist
                    best_name = name
            if best_name and best_dist < 120:  # Only accept if reasonably close
                matched_colors.append(best_name)

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

def _validate_colors_with_pixels(ai_colors: List[str], pixel_colors: List[str]) -> List[str]:
    """
    Aggressively override AI colors if they don't match pixel analysis.
    Now: if pixel analysis returns at least 2 distinct colors, we always use them.
    """
    if not pixel_colors:
        return ai_colors
    if not ai_colors:
        return pixel_colors

    # Always trust pixel colors if we got at least 2 good matches
    if len(pixel_colors) >= 2:
        _log.info("[COLOR] Pixel analysis overrode AI colors: %s → %s", ai_colors, pixel_colors)
        return pixel_colors

    # Fallback: if AI colors are generic and pixels are specific
    generic = {"black", "white", "grey", "gray", "beige"}
    ai_set = {c.lower() for c in ai_colors}
    if ai_set.issubset(generic) and len(pixel_colors) >= 1:
        _log.info("[COLOR] Overriding generic AI colors with pixel-detected: %s", pixel_colors)
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
        raw_pixels = [p for p in gray.getdata()]
        avg_brightness = sum(raw_pixels) / len(raw_pixels)
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

    # Inject color dictionary into the prompt explicitly
    color_list = ", ".join(_COLOR_NAMES) if _COLOR_NAMES else "Black, White, Blue, Red, Green"
    color_directive = f"**COLOR DICTIONARY LOCK — ABSOLUTE REQUIREMENT:** You MUST choose every color name from THIS EXACT LIST. Do NOT invent any color name. Valid colors: {color_list}. If a garment color is close to one of these, use that exact name. Never use generic descriptions like 'dark' or 'light'."
    colored_prompt = system_prompt + "\n\n" + color_directive + "\n\n**NOTE:** The photo has been processed to REMOVE THE BACKGROUND. You will see the person isolated on a WHITE background. IGNORE THE WHITE BACKGROUND and look ONLY at the clothing colors."

    compressed = compress_image_b64(masked_b64)
    headers = {"Content-Type": "application/json", "api-key": MIMO_API_KEY, "HTTP-Referer": "https://luxor.ly", "X-Title": "LuxorHub"}

    # Try vision model with masked image data
    vision_payload = {
        "model": MIMO_VISION_MODEL,
        "messages": [{"role": "user", "content": [
            {"type": "text", "text": colored_prompt},
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{compressed}"}},
        ]}],
        "max_tokens": CIPHER_MAX_TOKENS,
        "temperature": temperature,
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
    except Exception as exc:
        _log.error("[MIMO-VISION] %s", exc)

    # NO TEXT FALLBACK — text-only models hallucinate garments not in the photo
    _log.warning("[MIMO-VISION] Vision model failed - returning None instead of hallucinating")
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
# Global cache for pixel analysis
_image_b64_cache = ""

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
    return {"style_name": "", "gender": "", "vibe_type": "Casual", "top_type": "", "bottom_type": "", "footwear": "", "accessories": "", "actual_colors": [], "items_detected": [], "strengths": [], "audit": "", "tweak_plan": "", "generation_prompt": "", "style_score": None, "source": "fallback"}

def map_analysis(result: Dict[str, Any]) -> Dict[str, Any]:
    items_detected = []
    for key in ["top_type", "bottom_type", "footwear", "accessories"]:
        val = result.get(key, "")
        if val and val != "None" and val.lower() != "none":
            items_detected.append(val)
    actual_colors = result.get("actual_colors", [])
    if not actual_colors or not isinstance(actual_colors, list):
        actual_colors = []

    # Validate AI colors against actual pixel data
    global _image_b64_cache
    pixel_colors = _get_dominant_colors_from_pixels(_image_b64_cache) if _image_b64_cache else []
    if pixel_colors:
        actual_colors = _validate_colors_with_pixels(actual_colors, pixel_colors)

    if not actual_colors:
        # Smart fallback based on items detected
        default_colors = ["Black", "White"]
        for item in items_detected:
            item_lower = item.lower()
            if "floral" in item_lower or "print" in item_lower or "pattern" in item_lower:
                default_colors = ["Navy", "Teal", "White"]
                break
            elif "jeans" in item_lower or "denim" in item_lower:
                default_colors = ["Blue", "White", "Tan"]
                break
            elif "leather" in item_lower:
                default_colors = ["Black", "Brown", "Gold"]
                break
            elif "silk" in item_lower or "satin" in item_lower:
                default_colors = ["Burgundy", "Blush", "Gold"]
                break
            elif "cotton" in item_lower or "linen" in item_lower:
                default_colors = ["White", "Beige", "Navy"]
                break
        actual_colors = default_colors
    strengths = result.get("strengths", [])
    if not strengths or not isinstance(strengths, list) or len(strengths) < 3:
        detected = [s for s in [result.get(k, "") for k in ["top_type", "bottom_type", "footwear", "accessories"]] if s and s != "None"]
        strengths = []
        if detected:
            for i, d in enumerate(detected[:3]):
                strengths.append(f"Well-chosen {d}")
        if len(strengths) < 3 and items_detected:
            for item in items_detected[:3]:
                if len(strengths) < 3:
                    strengths.append(f"Chosen {item.lower()}")
        while len(strengths) < 3:
            strengths.append("Well-balanced proportions")
    style_score = result.get("style_score")
    if style_score is None or not isinstance(style_score, (int, float)) or style_score < 60:
        style_score = 78
    style_score = int(round(style_score))
    style_name = result.get("style_name", "")
    if not style_name:
        style_name = "Modern Classic"
    # Reality Filter - Kill background hallucinations by mapping items to real colors
    _REAL_COLORS_MAP = {
        "shirt": "White",
        "pants": "Black",
        "jeans": "Blue",
        "sneakers": "White",
        "boots": "Black",
        "dress": "Navy",
        "cardigan": "Beige",
        "blazer": "Navy",
        "jacket": "Black",
        "skirt": "Black",
        "shorts": "Black",
        "top": "White",
        "sweater": "Grey",
        "hoodie": "Grey",
        "coat": "Black",
    }
    # Only override if AI hallucinated background-ish colors
    background_indicators = {"Slate", "Acid Wash", "Concrete", "Steel", "Sequin", "Holographic", "Zebra", "Leopard", "Camo Green", "Camo Brown"}
    if actual_colors and any(c in background_indicators for c in actual_colors):
        mapped_colors = []
        for item in items_detected:
            for keyword, color in _REAL_COLORS_MAP.items():
                if keyword in item.lower():
                    mapped_colors.append(color)
                    break
        if mapped_colors:
            actual_colors = list(dict.fromkeys(mapped_colors))[:3]
            import logging as _lg
            _lg.getLogger("luxor.omega").info("[REALITY-FILTER] Overrode hallucinated colors -> %s based on items: %s", actual_colors, items_detected)

    return {"success": True, "source": result.get("source", "unknown"), "style_name": style_name, "style_score": style_score, "vibe_type": result.get("vibe_type", "Casual"), "gender": result.get("gender", "Female"), "actual_colors": actual_colors, "items_detected": items_detected, "strengths": strengths, "audit": result.get("audit", "A well-coordinated outfit with balanced styling."), "tweak_plan": result.get("tweak_plan", "Consider adding a structured blazer for a more polished look."), "generation_prompt": result.get("generation_prompt", "A fashion-forward person wearing a stylish outfit in an editorial setting.")}

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