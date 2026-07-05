#!/usr/bin/env python3
# Luxor Pro Stylist — Fashion Analysis & Interactive Ecosystem
# MiMo Vision 2.5 · Stylist Quiz · Closet Management · Outfit Generator
# Vercel Blob · Qdrant Storage · Serverless Ready
from __future__ import annotations
import base64
import io
import json
import logging
import os
import random
import re
import sys
import time
import urllib.parse
import uuid
from concurrent.futures import TimeoutError as CFTimeoutError
from datetime import datetime, timezone
from typing import Any, Optional, Dict, List, cast
import threading

import requests
from flask import Flask, request, jsonify, send_from_directory, make_response
from flask_cors import CORS
from PIL import Image
from collections import Counter
import numpy as np
try:
    import cv2
    import mediapipe as mp
    from mediapipe.python.solutions.selfie_segmentation import SelfieSegmentation  # type: ignore  # pyright: ignore[reportMissingImports]
    _HAS_MEDIAPIPE = True
except ImportError:
    cv2: Any = None
    mp: Any = None
    SelfieSegmentation: Any = None
    _HAS_MEDIAPIPE = False
from dotenv import load_dotenv
import traceback

# Track MiMo model status - skip broken models
# MiMo client status — no global flags (checked fresh per request)

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
CORS(app, resources={r"/*": {"origins": "*"}})

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
# Configuration imported from backend.config (single source of truth)
from backend.config import (
    log_config,
    MIMO_API_KEY, MIMO_API_URL, MIMO_VISION_MODEL, MIMO_TEXT_MODEL,
    CIPHER_MAX_TOKENS, PORT, BLOB_READ_WRITE_TOKEN, QDRANT_URL, QDRANT_API_KEY,
)
log_config()
_log.info("Config loaded from backend.config module")

# ---------------------------------------------------------------------------
from backend.ai.prompts import SACRED_PROMPT, STYLIST_PROMPT
# Module-based function imports (replace main.py duplicates)
from backend.image.preprocess import compress_image_b64
from backend.ai.mimo_client import call_mimo_vision, call_mimo_text, _extract_first_json
from backend.services.fashion_service import (
    get_fashion_decision, map_analysis,
    _humanize_strengths, _humanize_audit, _humanize_tweak,
    set_color_names,
)

# Route initializers from backend/routes/ modular modules
from backend.routes.analyze import init_routes as init_analyze_routes
from backend.routes.health import init_routes as init_health_routes

init_analyze_routes(app)

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
set_color_names(_COLOR_NAMES)
# ---------------------------------------------------------------------------
# Qdrant Closet Client
# ---------------------------------------------------------------------------
_LOCAL_CLOSET_FILE = os.path.join(BASE_DIR, "closet_items.json")
_qdrant_closet: Any = None
_CLOSET_COLLECTION = "luxor_closet"
_json_lock = threading.Lock()
def _qdrant_error(stage: str, error: str, details: str = "") -> Dict[str, Any]:
    """Return a structured error dict for Qdrant failures."""
    return {
        "success": False,
        "service": "qdrant",
        "stage": stage,
        "error": error,
        "details": details,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


def _migrate_json_to_qdrant():
    """Migrate items from closet_items.json that aren't yet in Qdrant.
    Called exactly once during startup, after Qdrant connection is verified.
    """
    try:
        from uuid import uuid5, NAMESPACE_DNS
        import json as _json
        client = _qdrant_closet
        if not client:
            _log.error("[QDRANT] Migration skipped — Qdrant client is None")
            return
        # Verify collection exists
        _ensure_closet_collection(client)
        result = client.scroll(
            collection_name=_CLOSET_COLLECTION, limit=5000, with_payload=True
        )
        points = result[0] if isinstance(result, tuple) else result
        qdrant_ids = {p.payload.get("id") for p in points if p.payload and p.payload.get("id")}
        if not os.path.exists(_LOCAL_CLOSET_FILE):
            _log.info("[QDRANT] No local JSON file to migrate")
            return
        with open(_LOCAL_CLOSET_FILE, "r") as f:
            json_items = _json.load(f)
        if not isinstance(json_items, list):
            return
        to_migrate = [i for i in json_items if i.get("id") and i["id"] not in qdrant_ids]
        if to_migrate:
            _log.info("[QDRANT] Migrating %d items from JSON to Qdrant", len(to_migrate))
            for item in to_migrate:
                point_id = str(uuid5(NAMESPACE_DNS, item["id"]))
                client.upsert(
                    collection_name=_CLOSET_COLLECTION,
                    points=[qdrant_models.PointStruct(
                        id=point_id,
                        vector=[0.0, 0.0, 0.0, 0.0],
                        payload=item,
                    )]
                )
            _log.info("[QDRANT] Migration complete — %d items migrated", len(to_migrate))
        else:
            _log.info("[QDRANT] No items to migrate — Qdrant is already in sync")
    except Exception as exc:
        _log.error("[QDRANT] Migration failed: %s", exc)
        raise  # Fail fast during startup


def _ensure_closet_collection(client: Any):
    """Ensure the Qdrant collection exists with proper schema.
    Raises on failure — called during startup, no silent passes."""
    if qdrant_models is None:
        raise RuntimeError("Qdrant models not available (import failed)")
    _log.info("[QDRANT] Verifying collection '%s'...", _CLOSET_COLLECTION)
    try:
        collections = client.get_collections()
        names = [c.name for c in collections.collections]
        if _CLOSET_COLLECTION not in names:
            _log.info("[QDRANT] Creating collection '%s'...", _CLOSET_COLLECTION)
            client.create_collection(
                collection_name=_CLOSET_COLLECTION,
                vectors_config=qdrant_models.VectorParams(
                    size=4, distance=qdrant_models.Distance.COSINE
                ),
            )
            _log.info("[QDRANT] Created collection '%s'", _CLOSET_COLLECTION)
        # Ensure payload index on id for fast lookups and deletes
        try:
            client.create_payload_index(
                collection_name=_CLOSET_COLLECTION,
                field_name="id",
                field_schema=qdrant_models.PayloadSchemaType.KEYWORD,
            )
            _log.info("[QDRANT] Payload index on 'id' ready")
        except Exception:
            pass  # Index already exists — acceptable
        # Ensure payload index on user_id for per-user filtering
        try:
            client.create_payload_index(
                collection_name=_CLOSET_COLLECTION,
                field_name="user_id",
                field_schema=qdrant_models.PayloadSchemaType.KEYWORD,
            )
            _log.info("[QDRANT] Payload index on 'user_id' ready")
        except Exception:
            pass  # Index already exists — acceptable
        _log.info("[QDRANT] Collection '%s' verified OK", _CLOSET_COLLECTION)
    except Exception as exc:
        _log.error("[QDRANT] Collection verification failed: %s", exc)
        raise


def _init_qdrant():
    """Initialize Qdrant client at startup — called ONCE at module load.
    Fail fast if Qdrant is unavailable. No lazy init, no silent None.
    """
    global _qdrant_closet
    _log.info("[QDRANT] Starting initialization...")

    if QdrantClient is None:
        raise RuntimeError("QdrantClient not available (import failed)")

    if not QDRANT_URL or not QDRANT_API_KEY:
        raise RuntimeError(
            "QDRANT_URL and QDRANT_API_KEY must be set in environment"
        )

    _log.info("[QDRANT] Connecting to Qdrant Cloud at %s...", QDRANT_URL.split("//")[1].split(".")[0] + ".qdrant.io")
    _qdrant_closet = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY, timeout=10)

    # Verify connection explicitly
    _log.info("[QDRANT] Verifying connection...")
    try:
        _qdrant_closet.get_collections()
    except Exception as e:
        raise RuntimeError(f"Qdrant connection verification failed: {e}")

    _log.info("[QDRANT] Connection OK. Ensuring collection...")
    _ensure_closet_collection(_qdrant_closet)

    _log.info("[QDRANT] Running JSON migration...")
    _migrate_json_to_qdrant()

    # Reverse sync: if JSON is missing or empty, restore from Qdrant
    try:
        if not os.path.exists(_LOCAL_CLOSET_FILE) or os.path.getsize(_LOCAL_CLOSET_FILE) < 10:
            qdrant_all = qdrant_get_all_items()
            if qdrant_all:
                with open(_LOCAL_CLOSET_FILE, "w") as f:
                    json.dump(qdrant_all, f, indent=2)
                _log.info("[QDRANT] Restored closet_items.json from Qdrant (%d items)", len(qdrant_all))
    except Exception as rs:
        _log.warning("[QDRANT] Reverse sync skipped: %s", rs)
    
    _log.info("[QDRANT] Qdrant ready — client initialized, collections OK")


# Eager initialization at module load time — gracefully degrades to JSON-only if Qdrant is unavailable
try:
    _init_qdrant()
except Exception as _qdrant_init_err:
    _log.critical("[QDRANT] Failed to initialize Qdrant: %s — running in JSON-only mode", _qdrant_init_err)
    _qdrant_closet = None

# Register health routes after Qdrant init attempt
init_health_routes(app, get_closet_count=lambda: (len(qdrant_get_all_items()) if _qdrant_closet is not None else 0))



def qdrant_get_all_items(timeout: float = 8.0, user_id: str = "") -> List[Dict[str, Any]]:
    """Get all closet items from Qdrant with a timeout.
    If user_id is provided, only return items belonging to that user.
    Raises on failure — no silent fallback. Caller handles fallback.
    """
    from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeout

    client = _qdrant_closet
    if client is None:
        raise RuntimeError("Qdrant closet client is not initialized")

    def _do_scroll():
        scroll_filter = None
        if user_id and qdrant_models is not None:
            scroll_filter = qdrant_models.Filter(
                must=[qdrant_models.FieldCondition(
                    key="user_id", match=qdrant_models.MatchValue(value=user_id)
                )]
            )
        result = client.scroll(
            collection_name=_CLOSET_COLLECTION,
            limit=1000,
            with_payload=True,
            scroll_filter=scroll_filter,
        )
        points = result[0] if isinstance(result, tuple) else result
        return [dict(p.payload) for p in points if p.payload]

    with ThreadPoolExecutor(max_workers=1) as executor:
        future = executor.submit(_do_scroll)
        try:
            items = future.result(timeout=timeout)
            _log.info("[QDRANT] Scrolled %d items from collection (user_id=%s)", len(items), user_id or "all")
            return items
        except FuturesTimeout:
            _log.error("[QDRANT] Scroll timed out after %ss", timeout)
            raise TimeoutError(f"Qdrant scroll timed out after {timeout}s")
        except Exception as exc:
            _log.error("[QDRANT] Scroll error: %s", exc)
            raise
def qdrant_upsert_item(item: Dict[str, Any]) -> bool:
    """Upsert an item to BOTH Qdrant Cloud and local JSON.
    Qdrant errors are logged as errors (not warnings) but do not block
    the local JSON save, ensuring the item is always persisted.
    Returns True if at least one storage layer succeeded.
    """
    item_id = item.get("id", str(uuid.uuid4())[:8])
    item["id"] = item_id
    qdrant_ok = False
    json_ok = False

    # 1. Upsert to Qdrant Cloud
    client = _qdrant_closet
    if client is not None and qdrant_models is not None:
        try:
            from uuid import uuid5, NAMESPACE_DNS
            point_id = str(uuid5(NAMESPACE_DNS, item_id))
            client.upsert(
                collection_name=_CLOSET_COLLECTION,
                points=[qdrant_models.PointStruct(
                    id=point_id,
                    vector=[0.0, 0.0, 0.0, 0.0],
                    payload=item,
                )]
            )
            _log.info("[QDRANT] Upserted item %s to Qdrant Cloud", item_id)
            qdrant_ok = True
        except Exception as exc:
            _log.error("[QDRANT] Cloud upsert FAILED for item %s: %s", item_id, exc)

    # 2. Always write to local JSON file as secondary persistence
    try:
        with _json_lock:
            items = []
            try:
                with open(_LOCAL_CLOSET_FILE, 'r') as f:
                    items = json.load(f)
            except (FileNotFoundError, json.JSONDecodeError):
                pass
            items = [i for i in items if i.get("id") != item_id]
            items.append(item)
            with open(_LOCAL_CLOSET_FILE, 'w') as f:
                json.dump(items, f, indent=2)
        _log.info("[CLOSET] Saved item to local file: %s (%s)", item.get("label", "unknown"), item_id)
        json_ok = True
    except Exception as exc:
        _log.error("[CLOSET] Local save FAILED for item %s: %s", item_id, exc)

    if not qdrant_ok and json_ok:
        _log.warning("[QDRANT] Item %s saved to local file only (Qdrant unavailable)", item_id)
    elif qdrant_ok and not json_ok:
        _log.warning("[QDRANT] Item %s saved to Qdrant only (local file unavailable)", item_id)
    elif not qdrant_ok and not json_ok:
        _log.error("[QDRANT] Item %s FAILED to persist to ANY storage layer", item_id)
        return False

    return True


def qdrant_delete_item(item_id: str) -> bool:
    """Delete an item from both Qdrant Cloud and local JSON.
    Returns True if deletion succeeded in at least one layer.
    """
    qdrant_ok = False
    json_ok = False

    # 1. Delete from Qdrant Cloud
    client = _qdrant_closet
    if client is not None and qdrant_models is not None:
        try:
            client.delete(
                collection_name=_CLOSET_COLLECTION,
                points_selector=qdrant_models.Filter(
                    must=[qdrant_models.FieldCondition(
                        key="id", match=qdrant_models.MatchValue(value=item_id)
                    )]
                ),
            )
            _log.info("[QDRANT] Deleted item %s from Qdrant Cloud", item_id)
            qdrant_ok = True
        except Exception as exc:
            _log.error("[QDRANT] Cloud delete FAILED for item %s: %s", item_id, exc)

    # 2. Always delete from local file
    try:
        with _json_lock:
            with open(_LOCAL_CLOSET_FILE, 'r') as f:
                items = json.load(f)
            items = [i for i in items if i.get("id") != item_id]
            with open(_LOCAL_CLOSET_FILE, 'w') as f:
                json.dump(items, f, indent=2)
        _log.info("[CLOSET] Deleted item %s from local file", item_id)
        json_ok = True
    except (FileNotFoundError, json.JSONDecodeError):
        _log.info("[CLOSET] No local file to delete from (fresh state)")
        json_ok = True  # Not an error — nothing to delete
    except Exception as exc:
        _log.error("[CLOSET] Local delete FAILED for item %s: %s", item_id, exc)

    if not qdrant_ok and json_ok:
        _log.warning("[QDRANT] Item %s deleted from local file only (Qdrant unavailable)", item_id)
    elif qdrant_ok and not json_ok:
        _log.warning("[QDRANT] Item %s deleted from Qdrant only (local file unavailable)", item_id)

    return qdrant_ok or json_ok


def qdrant_get_item(item_id: str) -> Optional[Dict[str, Any]]:
    """Get a single item by ID. No silent fallback."""
    client = _qdrant_closet
    if client is None:
        raise RuntimeError("Qdrant closet client is not initialized")
    if qdrant_models is None:
        raise RuntimeError("Qdrant models not available")
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
        _log.error("[QDRANT] Get error for item %s: %s", item_id, exc)
        raise
# Prompts
# ---------------------------------------------------------------------------
CLOSET_PROMPT = """You are a professional fashion stylist. Given a user's closet items, select outfits that work well together.

Criteria: {occasion} occasion, {weather} weather, {color_palette} color palette.

RULES:
1. Only use item IDs that exist in the list I provide — do NOT invent IDs
2. Pick items that coordinate in color and style for the given occasion/weather
3. Each outfit needs: at minimum a top+bottom OR a dress, plus shoes if available
4. A complete outfit typically has: top + bottom + shoes OR dress + shoes
5. Return up to 2 outfits maximum
6. Do NOT generate any text outside the JSON

Return ONLY this JSON array format:
[
  {{ "outfit_name": "short style name", "item_ids": ["id1", "id2", "id3"], "reason": "why these items work for the occasion/weather" }},
  {{ "outfit_name": "short style name", "item_ids": ["id4", "id5", "id6"], "reason": "why these items work for the occasion/weather" }}
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

    result = call_mimo_text(messages, STYLIST_PROMPT, temperature=0.8)
    if not result:
        return jsonify({"next_question": "Tell me what kind of vibe you are going for today?", "options": ["Casual", "Business", "Party", "Date Night", "Sport"], "generated_prompt": "", "outfit_name": ""})

    next_q = result.get("next_question", "")
    options = result.get("options", [])
    gen_prompt = result.get("generated_prompt", "")
    outfit_name = result.get("outfit_name", "")

    if gen_prompt and not next_q:
        safe = urllib.parse.quote(gen_prompt)
        image_url = f"https://image.pollinations.ai/prompt/{safe}?width=1024&height=1536&nologin=true&seed={seed}&model=sana"
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

    prompt = f"SUBJECT: HYPERREALISTIC FULL-BODY FASHION EDITORIAL PHOTOGRAPH OF A WOMAN STANDING CONFIDENTLY, WEARING A {vibe} STYLE OUTFIT, DESIGNED FOR {weather} WEATHER, USING A {color} COLOR PALETTE. TWO VISIBLE LEGS, TWO ARMS, NATURAL HUMAN PROPORTIONS. NO DEFORMITIES, NO EXTRA LIMBS. COMPLETE OUTFIT FROM HEAD TO TOE WITH SHOES VISIBLE AT THE BOTTOM OF THE FRAME. MEDIUM: 8K ULTRA-PHOTOREALISTIC FASHION PHOTOGRAPH, DSLR FULL-FRAME CLARITY. ENVIRONMENT: MINIMALIST HIGH-END FASHION STUDIO WITH SOFT GRADIENT BACKDROP. LIGHTING: SOFT DIFFUSED STUDIO LIGHTING WITH PROFESSIONAL BALANCE. COLOR: TRUE-TO-LIFE COLOR CALIBRATION. MOOD: {vibe}, CONFIDENT, MODERN LUXURY. COMPOSITION: SHOT WITH AN 85MM FASHION LENS ON A FULL-FRAME SENSOR. FULL-BODY FRAMING FROM HEAD TO TOE, CENTERED COMPOSITION. SHOES CLEARLY VISIBLE AT THE BOTTOM OF THE FRAME."
    safe = urllib.parse.quote(prompt)
    seed = int(time.time() * 1000)
    image_url = f"https://image.pollinations.ai/prompt/{safe}?width=1024&height=1536&nologin=true&seed={seed}&model=sana"

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
    try:
        if request.method == "OPTIONS":
            return "", 204
        import socket as _socket_timeout
        _socket_timeout.setdefaulttimeout(25)
        data = request.get_json(silent=True) or {}
        item_type = data.get("type", data.get("category", "other"))
        label = data.get("label", data.get("name", ""))
        color = data.get("color", "")
        category = data.get("category", data.get("type", "other"))
        brand = data.get("brand", "")
        season = data.get("season", "all-season")
        occasion = data.get("occasion", "")
        style = data.get("style", "")
        notes = data.get("notes", "")
        price = data.get("price", None)
        image_b64 = data.get("image_b64", "")
        user_id = data.get("user_id", "")

        if not label and not image_b64:
            return jsonify({"error": "Need label or image"}), 400

        # Upload image: prefer Vercel Blob, fallback to local disk
        image_url = ""
        if image_b64:
            image_url = upload_image_to_blob(image_b64)
            if not image_url:
                try:
                    raw = base64.b64decode(image_b64)
                    fname = f"{uuid.uuid4().hex[:16]}.jpg"
                    local_path = os.path.join(BASE_DIR, "public", "images", fname)
                    os.makedirs(os.path.dirname(local_path), exist_ok=True)
                    with open(local_path, "wb") as f:
                        f.write(raw)
                    image_url = f"/images/{fname}"
                    _log.info("[CLOSET] Saved image locally: %s", local_path)
                except Exception as exc:
                    _log.warning("[CLOSET] Local image save failed: %s", exc)

        # Build item
        item_id = str(uuid.uuid4())[:8]
        now = datetime.now(timezone.utc).isoformat()
        item = {
            "id": item_id,
            "type": item_type,
            "label": label,
            "name": label,
            "color": color,
            "category": category,
            "brand": brand,
            "season": season,
            "occasion": occasion,
            "style": style,
            "notes": notes,
            "price": price,
            "user_id": user_id,
            "image_url": image_url or "",
            "photo_url": image_url or "",
            "image_data_b64": image_b64 or "",  # Persist image data across restarts
            "created_at": now,
        }

        # ---- Persist to Qdrant Cloud + JSON (dual-write) ----
        print(f"[ADD-DEBUG] Received: {label} ({item_id})", flush=True)
        print(f"[ADD-DEBUG] Writing to JSON at path: {os.path.abspath(_LOCAL_CLOSET_FILE)}", flush=True)
        ok = qdrant_upsert_item(item)
        if not ok:
            _log.error("[CLOSET] Failed to persist item %s", item_id)
            return jsonify({"error": "Storage unavailable"}), 503
        
        # Debug: confirm base64 was persisted
        if image_b64:
            print(f"[ADD-DEBUG] Saved Base64 for '{label}', b64 length: {len(image_b64)}", flush=True)
        
        # Verify the write by reading back
        try:
            with open(_LOCAL_CLOSET_FILE, 'r') as f:
                verify_items = json.load(f)
            print(f"[ADD-DEBUG] Save successful. Total items in JSON: {len(verify_items)}", flush=True)
        except Exception as ve:
            print(f"[ADD-DEBUG] Verification read failed: {ve}", flush=True)
        
        return jsonify({"success": True, "item": item})
    except Exception as e:
        import traceback
        print("=== CRITICAL ERROR IN /api/v1/closet/add-item ===", flush=True)
        traceback.print_exc()
        print("================================================", flush=True)
        return jsonify(_qdrant_error("upsert", str(e), traceback.format_exc())), 500
@app.route("/api/v1/closet/list-items", methods=["GET", "OPTIONS"], strict_slashes=False)
def closet_list():
    """List all closet items — Qdrant first (persistent), JSON fallback.
    Supports ?user_id=xxx for per-user filtering.
    """
    if request.method == "OPTIONS":
        return "", 204
    # Primary: fetch from Qdrant Cloud (persists across restarts)
    uid = request.args.get("user_id", "")
    try:
        items = qdrant_get_all_items(user_id=uid)
        _log.info("[CLOSET] list-items returning %d items from Qdrant", len(items))
        return jsonify({"success": True, "items": items})
    except Exception as qe:
        _log.warning("[CLOSET] Qdrant read failed: %s — falling back to JSON", qe)
    # Fallback: read from local JSON file
    try:
        print(f"[LIST-DEBUG] Reading from: {os.path.abspath(_LOCAL_CLOSET_FILE)}", flush=True)
        with open(_LOCAL_CLOSET_FILE, "r") as f:
            items = json.load(f)
            if isinstance(items, list):
                # Filter by user_id if provided
                if uid:
                    items = [i for i in items if i.get("user_id") == uid]
                _log.info("[CLOSET] list-items returning %d items from JSON fallback (user_id=%s)", len(items), uid or "all")
                return jsonify({"success": True, "items": items})
    except FileNotFoundError:
        _log.info("[CLOSET] No JSON file yet — returning empty")
    except json.JSONDecodeError as e:
        _log.error("[CLOSET] Corrupt JSON: %s — returning empty", e)
    except Exception as e:
        _log.error("[CLOSET] JSON fallback error: %s — returning empty", e)
    return jsonify({"success": True, "items": []})
@app.route("/api/v1/closet/delete-item", methods=["POST", "OPTIONS"], strict_slashes=False)
def closet_delete():
    try:
        if request.method == "OPTIONS":
            return "", 204
        data = request.get_json(silent=True) or {}
        item_id = data.get("id", "")
        if not item_id:
            return jsonify({"error": "Missing id"}), 400

        # Delete from Qdrant Cloud AND local JSON file (dual-delete)
        ok = qdrant_delete_item(item_id)
        if not ok:
            _log.error("[CLOSET] Failed to delete item %s from all storage layers", item_id)
            return jsonify(_qdrant_error("delete", "Storage unavailable", f"Item {item_id} could not be deleted from any layer")), 503

        # Read current state from file to report accurate counts
        json_path = _LOCAL_CLOSET_FILE
        remaining = 0
        try:
            if os.path.exists(json_path):
                with open(json_path, "r") as f:
                    items = json.load(f)
                    if isinstance(items, list):
                        remaining = len(items)
        except Exception:
            pass
        return jsonify({"success": True, "removed": 1, "remaining": remaining})
    except Exception as e:
        _log.error("[CLOSET] delete-item error: %s", e)
        return jsonify(_qdrant_error("delete", str(e), "Exception in delete endpoint")), 500
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
        result = call_mimo_vision(image_b64, analyze_prompt, 0.2)
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

# ---------------------------------------------------------------------------
# Style Analysis & Recommendations (MiMo Vision 2.5)
# ---------------------------------------------------------------------------
STYLE_ANALYSIS_PROMPT = """You are ENI, a professional fashion analyst and personal stylist. Analyze this person's photo and return ONLY valid JSON.

Look at the ENTIRE person from head to toe. Be honest and precise.

Return EXACTLY this JSON structure with your best estimates:
{
  "face_shape": "oval|round|square|heart|diamond|oblong|triangle|unknown",
  "body_type": "ectomorph|mesomorph|endomorph|unknown",
  "height_estimation": "short|average|tall",
  "weight_estimation": "slim|average|overweight",
  "bmi_category": "underweight|normal|overweight|obese",
  "body_proportions": "balanced|long_torso|long_legs|short_torso|short_legs",
  "shoulder_width": "narrow|average|broad",
  "waist_to_hip_ratio": "low|medium|high",
  "head_size_relative": "small|average|large",
  "neck_length": "short|average|long",
  "leg_length": "short|average|long",
  "arm_proportions": "short|average|long",
  "skin_tone": "fair|light|medium|tan|brown|dark|deep",
  "skin_undertone": "cool|warm|neutral|olive",
  "hair_color": "black|brown|blonde|red|gray|white|other",
  "eye_shape": "almond|round|hooded|monolid|downturned|upturned|unknown",
  "eye_size": "small|medium|large",
  "nose_shape": "straight|aquiline|button|broad|pointed|flat|unknown",
  "lip_shape": "thin|medium|full|asymmetric|unknown",
  "age_estimation": "teens|20s|30s|40s|50s|60s+",
  "gender_presentation": "masculine|feminine|androgynous",
  "overall_style_profile": "brief 1-sentence description of their current style from this photo",
  "outfit_description": "brief description of what they are currently wearing",
  "current_style_score": "1-10 rating of their current outfit",
  "current_style_strengths": ["strength1", "strength2"],
  "current_style_improvements": ["improvement1", "improvement2"]
}

IMPORTANT: Base everything on what you actually see. Do not guess body measurements. Use relative terms like short/average/tall. Be honest but respectful."""

RECOMMENDATION_PROMPT = """You are ENI, a brutally honest but respectful personal fashion stylist. Based on this person's style analysis data, generate personalized recommendations.

Analysis data:
{analysis_json}

Return EXACTLY this JSON structure:
{{
  "color_analysis": {{
    "best_colors": ["color1", "color2", "color3", "color4", "color5"],
    "colors_to_avoid": ["color1", "color2", "color3"],
    "best_accessory_colors": ["color1", "color2"],
    "best_shoe_colors": ["color1", "color2"],
    "best_jewelry_metals": ["gold", "silver", "rose_gold"],
    "explanation": "Brief explanation of color recommendations based on skin tone and undertone"
  }},
  "face_recommendations": {{
    "best_collar_types": ["type1", "type2"],
    "best_neckline_styles": ["style1", "style2"],
    "glasses_recommendation": "advice about glasses frames",
    "hat_recommendation": "advice about hats",
    "hairstyle_advice": "brief hairstyle advice",
    "beard_advice": "advice if applicable or empty string",
    "explanation": "Why these recommendations suit their face shape"
  }},
  "body_recommendations": {{
    "shirt_fit": "advice on shirt fit",
    "jacket_fit": "advice on jacket fit",
    "pants_fit": "advice on pants fit",
    "shorts_length": "advice on shorts length or empty string",
    "coat_style": "advice on coat style",
    "suit_cut": "advice on suit cut or empty string",
    "explanation": "Why these recommendations suit their body type"
  }},
  "honest_tips": [
    {{"tip": "Specific honest but respectful tip 1", "confidence": 85}},
    {{"tip": "Specific honest but respectful tip 2", "confidence": 75}},
    {{"tip": "Specific honest but respectful tip 3", "confidence": 90}}
  ],
  "confidence_score": 85
}}

RULES:
- Be HONEST. If something doesn't work, say it.
- Never give fake compliments. Say "This color makes you look washed out" not "This is fine."
- Every tip must be specific and actionable.
- Confidence score 0-100% how confident you are in these recommendations.
- The honest tips should cover: fit issues, color issues, proportion issues, style improvements."""

OUTFIT_REVIEW_PROMPT = """You are ENI, a professional fashion critic. Review this outfit photo and score it honestly.

Respond in English only. Return EXACTLY this JSON:
{
  "overall_score": 75,
  "scores": {
    "color_harmony": 70,
    "body_fit": 65,
    "face_compatibility": 80,
    "occasion_suitability": 75,
    "trendiness": 60,
    "confidence_level": 70
  },
  "strengths": ["strength1", "strength2"],
  "improvements": [
    {"issue": "The shirt is too long for your torso", "suggestion": "Tuck it in or size down", "priority": "high"},
    {"issue": "These colors clash", "suggestion": "Swap the top for a neutral", "priority": "medium"}
  ],
  "honest_summary": "1-2 sentences of honest overall feedback"
}"""


@app.route("/api/v1/style-analyze", methods=["POST", "OPTIONS"], strict_slashes=False)
def style_analyze():
    """Analyze a person's photo for body type, face shape, skin tone, proportions using MiMo Vision 2.5."""
    if request.method == "OPTIONS":
        return "", 204
    try:
        data = request.get_json(silent=True) or {}
        image_b64 = data.get("image_b64", "")
        if not image_b64:
            return jsonify({"success": False, "error": "No image provided"}), 400

        _log.info("[STYLE] Analyzing photo for body/face")

        result = call_mimo_vision(image_b64, STYLE_ANALYSIS_PROMPT, temperature=0.3)
        if not result:
            return jsonify({"success": False, "error": "Analysis failed. MiMo Vision could not process the image."})

        # Normalize the response
        analysis = {
            "face_shape": result.get("face_shape", "unknown"),
            "body_type": result.get("body_type", "unknown"),
            "height_estimation": result.get("height_estimation", "average"),
            "weight_estimation": result.get("weight_estimation", "average"),
            "bmi_category": result.get("bmi_category", "normal"),
            "body_proportions": result.get("body_proportions", "balanced"),
            "shoulder_width": result.get("shoulder_width", "average"),
            "waist_to_hip_ratio": result.get("waist_to_hip_ratio", "medium"),
            "head_size_relative": result.get("head_size_relative", "average"),
            "neck_length": result.get("neck_length", "average"),
            "leg_length": result.get("leg_length", "average"),
            "arm_proportions": result.get("arm_proportions", "average"),
            "skin_tone": result.get("skin_tone", "medium"),
            "skin_undertone": result.get("skin_undertone", "neutral"),
            "hair_color": result.get("hair_color", "brown"),
            "eye_shape": result.get("eye_shape", "almond"),
            "eye_size": result.get("eye_size", "medium"),
            "nose_shape": result.get("nose_shape", "straight"),
            "lip_shape": result.get("lip_shape", "medium"),
            "age_estimation": result.get("age_estimation", "30s"),
            "gender_presentation": result.get("gender_presentation", "feminine"),
            "overall_style_profile": result.get("overall_style_profile", ""),
            "outfit_description": result.get("outfit_description", ""),
            "current_style_score": result.get("current_style_score", 5),
            "current_style_strengths": result.get("current_style_strengths", []),
            "current_style_improvements": result.get("current_style_improvements", []),
        }

        _log.info("[STYLE] Analysis complete: face=%s body=%s skin=%s", analysis["face_shape"], analysis["body_type"], analysis["skin_tone"])
        return jsonify({"success": True, "analysis": analysis})
    except Exception as exc:
        _log.error("[STYLE] Error: %s", exc, exc_info=True)
        return jsonify({"success": False, "error": f"Analysis failed: {str(exc)[:100]}"}), 500


@app.route("/api/v1/style-recommendations", methods=["POST", "OPTIONS"], strict_slashes=False)
def style_recommendations():
    """Generate personalized style recommendations based on analysis data."""
    if request.method == "OPTIONS":
        return "", 204
    try:
        data = request.get_json(silent=True) or {}
        analysis = data.get("analysis", {})
        preferences = data.get("preferences", {})

        if not analysis:
            return jsonify({"success": False, "error": "No analysis data provided. Run style analysis first."}), 400

        _log.info("[STYLE] Generating recommendations from analysis")

        # Build the prompt with the analysis data
        prompt = RECOMMENDATION_PROMPT.format(analysis_json=json.dumps(analysis, indent=2))

        messages = [
            {"role": "user", "content": prompt},
        ]

        result = call_mimo_text(messages, temperature=0.4, timeout=90, max_tokens=4096, model=MIMO_VISION_MODEL)
        if not result:
            return jsonify({"success": False, "error": "Failed to generate recommendations."})

        # Handle case where result is a raw string (JSON parsing failed upstream)
        if isinstance(result, str):
            _log.warning("[STYLE] MiMo returned raw string, attempting fallback parse")
            # Try to extract JSON from the raw string
            import re
            json_match = re.search(r'\{.*\}', result, re.DOTALL)
            if json_match:
                try:
                    import json as json_module
                    result = json_module.loads(json_match.group())
                except (json_module.JSONDecodeError, ValueError):
                    _log.error("[STYLE] Failed to parse raw string as JSON")
                    return jsonify({"success": False, "error": "Could not parse AI response."})

        if not isinstance(result, dict):
            return jsonify({"success": False, "error": "AI returned unexpected data format."})

        recommendations = {
            "color_analysis": result.get("color_analysis", {}),
            "face_recommendations": result.get("face_recommendations", {}),
            "body_recommendations": result.get("body_recommendations", {}),
            "honest_tips": result.get("honest_tips", []),
            "confidence_score": result.get("confidence_score", 70),
        }

        _log.info("[STYLE] Recommendations generated: %d tips", len(recommendations["honest_tips"]))
        return jsonify({"success": True, "recommendations": recommendations})
    except Exception as exc:
        _log.error("[STYLE] Error: %s", exc, exc_info=True)
        import traceback, sys
        print("=== CRITICAL STYLE-RECOMMENDATIONS ERROR ===", file=sys.stderr)
        traceback.print_exc()
        print("============================================", file=sys.stderr)
        return jsonify({"success": False, "error": f"Recommendations failed: {str(exc)[:200]}"}), 500


@app.route("/api/v1/outfit-review", methods=["POST", "OPTIONS"], strict_slashes=False)
def outfit_review():
    """Review an outfit photo with detailed scoring and honest feedback."""
    if request.method == "OPTIONS":
        return "", 204
    try:
        data = request.get_json(silent=True) or {}
        image_b64 = data.get("image_b64", "")
        occasion = data.get("occasion", "casual")

        if not image_b64:
            return jsonify({"success": False, "error": "No image provided"}), 400

        _log.info("[STYLE] Reviewing outfit for occasion=%s", occasion)

        review_prompt = OUTFIT_REVIEW_PROMPT + f"\n\nOccasion: {occasion}"
        result = call_mimo_vision(image_b64, review_prompt, temperature=0.3)
        if not result:
            return jsonify({"success": False, "error": "Outfit review failed."})

        review = {
            "overall_score": result.get("overall_score", 50),
            "scores": result.get("scores", {}),
            "strengths": result.get("strengths", []),
            "improvements": result.get("improvements", []),
            "honest_summary": result.get("honest_summary", ""),
        }

        _log.info("[STYLE] Outfit reviewed: score=%d, %d improvements", review["overall_score"], len(review["improvements"]))
        return jsonify({"success": True, "review": review})
    except Exception as exc:
        _log.error("[STYLE] Error: %s", exc, exc_info=True)
        return jsonify({"success": False, "error": f"Review failed: {str(exc)[:100]}"}), 500

@app.route("/api/v1/generate-outfits", methods=["POST", "OPTIONS"], strict_slashes=False)
def generate_outfits():
    if request.method == "OPTIONS":
        return "", 204
    try:
        import random
        data = request.get_json(silent=True) or {}
        occasion = data.get("occasion", "casual")
        count = max(1, min(int(data.get("count", 3)), 7))
        _log.info("[DRESSING] Generating %d outfits for %s", count, occasion)

        # Load items from Qdrant (or local JSON fallback)
        gen_uid = data.get("user_id", "")
        _log.info("[DRESSING] user_id=%s", gen_uid or "all")

        # Primary: load from Qdrant Cloud (persists across restarts)
        closet_items = []
        try:
            closet_items = qdrant_get_all_items(user_id=gen_uid)
        except Exception as qe:
            _log.warning("[DRESSING] Qdrant read failed: %s — falling back to JSON", qe)
        # Fallback: read from local JSON file
        if not closet_items:
            try:
                with open(_LOCAL_CLOSET_FILE, "r") as f:
                    closet_items = json.load(f)
                    if not isinstance(closet_items, list):
                        closet_items = []
                # Filter by user_id if provided
                if gen_uid:
                    closet_items = [i for i in closet_items if i.get("user_id") == gen_uid]
            except (FileNotFoundError, json.JSONDecodeError):
                pass
        if not closet_items:
            return jsonify({"success": False, "images": [], "error": "Your closet is empty! Add items first."}), 200

        # Allow items even without image_url — FlipGallery handles empty URLs gracefully (dark block)
        items_with_img = [i for i in closet_items if (i.get("image_url") or i.get("photo_url"))]
        print(f"[DEBUG] Found {len(items_with_img)} items with image_url field")
        if not items_with_img:
            return jsonify({"success": False, "images": [], "error": "No items found in closet. Add items first."}), 200

        # ---- Category detection ----
        def _cat(item):
            t = (item.get("type") or item.get("category") or "").lower().strip()
            tops_kw = ("top","shirt","blouse","t-shirt","tshirt","camisole","tank","sweater","hoodie","cardigan","blazer","vest","bodysuit","crop top","tube top","halter","jacket","coat","outerwear")
            bottoms_kw = ("bottom","pants","jeans","trousers","shorts","skirt","leggings","chinos","cargo","culottes","palazzo")
            shoes_kw = ("shoes","footwear","sneakers","boots","sandals","heels","flats","loafers","oxfords","mules","wedges","slides")
            dress_kw = ("dress","gown","jumpsuit","romper","sundress","maxi dress","mini dress","midi dress")
            acc_kw = ("accessory","bag","purse","belt","hat","scarf","jewelry","watch","sunglasses","earrings","necklace","bracelet","ring","wallet","backpack","tote","clutch","headband","gloves")
            full_kw = ("full outfit","full look","complete outfit","matching set","outfit set","coord set","co-ord","two-piece","suit set","ensemble")
            if t in full_kw or t == "full_outfit": return "full_outfit"
            if t in tops_kw or any(k in t for k in ("jacket","blazer","cardigan")): return "top"
            if t in bottoms_kw: return "bottom"
            if t in shoes_kw: return "shoes"
            if t in dress_kw: return "dress"
            if t in acc_kw: return "accessory"
            label = (item.get("label","")+" "+item.get("name","")+" "+t).lower()
            for kws,res in [
                (("jacket","coat","blazer","hoodie","cardigan","vest","bomber","trench","puffer"),"top"),
                (("shirt","blouse","t-shirt","tee","tank","camisole","crop top","sweater","polo","bodysuit","top"),"top"),
                (("pants","jeans","trousers","shorts","skirt","leggings","chinos","bottom","pant"),"bottom"),
                (("shoes","sneakers","boots","sandals","heels","flats","loafers","shoe","footwear"),"shoes"),
                (("dress","gown","jumpsuit","romper","sundress"),"dress"),
                (("bag","purse","belt","hat","scarf","jewelry","watch","sunglasses","earrings"),"accessory"),
                (("full outfit","full look","complete outfit","matching set","outfit set","coord set","two-piece","suit set"),"full_outfit"),
            ]:
                if any(kw in label for kw in kws): return res
            return "other"
        def _img_url(item, default=""):
            """Get image URL from item, ensuring it is an absolute URL to prevent CORB."""
            raw = item.get("image_url") or item.get("photo_url") or default
            if raw and not raw.startswith("http"):
                # Strip any leading /images/ or /media/ prefix to prevent double-prefix
                clean = raw.lstrip("/")
                for prefix in ("images/", "media/", "media/images/"):
                    if clean.startswith(prefix):
                        clean = clean[len(prefix):]
                final_url = request.host_url.rstrip("/") + "/images/" + clean
                print(f"[URL-DEBUG] Final generated image URL: {final_url}")
                print(f"[IMG-DEBUG] Generated URL: {final_url} (from raw={raw} clean={clean})")
                return final_url
            print(f"[URL-DEBUG] Final generated image URL: {raw}")
            print(f"[IMG-DEBUG] Raw URL (no transform): {raw}")
            return raw

        # ---- Group items ----
        tops = [i for i in items_with_img if _cat(i) == "top"]
        bottoms = [i for i in items_with_img if _cat(i) == "bottom"]
        shoes_list = [i for i in items_with_img if _cat(i) == "shoes"]
        dresses = [i for i in items_with_img if _cat(i) == "dress"]
        accessories = [i for i in items_with_img if _cat(i) == "accessory"]
        full_outfits = [i for i in items_with_img if _cat(i) == "full_outfit"]
        print(f"[CLOSET-DEBUG] Items: {len(items_with_img)} with images | Tops: {len(tops)} Bottoms: {len(bottoms)} Shoes: {len(shoes_list)} Dresses: {len(dresses)} Full: {len(full_outfits)} Accessories: {len(accessories)}")
        print(f'[DEPLOYMENT-CHECK] Tops found: {len(tops)} items - {[t.get("label","") for t in tops[:3]]}')
        print(f'[DEPLOYMENT-CHECK] Bottoms found: {len(bottoms)} items - {[b.get("label","") for b in bottoms[:3]]}')
        print(f'[DEPLOYMENT-CHECK] Shoes found: {len(shoes_list)} items - {[s.get("label","") for s in shoes_list[:3]]}')
        print(f'[DEPLOYMENT-CHECK] Full outfits found: {len(full_outfits)} items - {[f.get("label","") for f in full_outfits[:3]]}')
        print(f'[DEPLOYMENT-CHECK] Dresses found: {len(dresses)} items - {[d.get("label","") for d in dresses[:3]]}')
        has_full = len(full_outfits) > 0
        has_dresses = len(dresses) > 0
        has_tops = len(tops) > 0
        has_bottoms = len(bottoms) > 0
        has_shoes = len(shoes_list) > 0
        has_acc = len(accessories) > 0

        if not has_tops and not has_dresses and not has_full:
            return jsonify({"success":False,"images":[],"error":"No tops, dresses, or full outfits in your closet."}),200
        if has_tops and not has_bottoms:
            return jsonify({"success":False,"images":[],"error":"You need bottoms (pants/skirts) in your closet."}),200
        if has_tops and has_bottoms and not has_shoes:
            return jsonify({"success":False,"images":[],"error":"You need shoes in your closet to complete outfits."}),200

        # ---- Build text description ----
        def _item_text(items_list):
            return "".join(f"\n  [{i}] {items_list[i].get('label','Item')} ({items_list[i].get('color','')})" for i in range(len(items_list)))

        def _build_text():
            parts = []
            if tops: parts.append("TOPS:" + _item_text(tops))
            if bottoms: parts.append("\nBOTTOMS:" + _item_text(bottoms))
            if shoes_list: parts.append("\nSHOES:" + _item_text(shoes_list))
            if dresses: parts.append("\nDRESSES:" + _item_text(dresses))
            if accessories: parts.append("\nACCESSORIES:" + _item_text(accessories))
            if full_outfits: parts.append("\nFULL OUTFITS:" + _item_text(full_outfits))
            return "".join(parts)

        items_text = _build_text()

        style_desc = {
            "casual":"relaxed everyday casual","business":"professional business","party":"stylish party","date-night":"romantic date night",
            "sport":"active sporty","formal":"elegant formal","vacation":"vacation resort","beach":"beach ready","work":"professional work",
        }.get(occasion.lower(), "versatile")

        # ---- Create collage image ----
        collage_b64 = None
        try:
            from PIL import Image, ImageDraw, ImageFont
            sz = 160; pd = 12; ch = 25; lh = 22
            cw = sz + pd*2; rh = sz + lh + pd*2 + ch

            cats = [(tops,"TOPS",(70,130,180)),(bottoms,"BOTTOMS",(60,179,113)),(shoes_list,"SHOES",(218,165,32)),
                    (dresses,"DRESSES",(180,70,130)),(accessories,"ACCESSORIES",(200,120,200)),(full_outfits,"FULL OUTFITS",(100,200,100))]
            active = [(g,l,c) for g,l,c in cats if g]
            nr = len(active); nc = max(len(g) for g,_,_ in active) if active else 1
            cw2 = max(nc*cw+pd,400); ch2 = nr*rh+pd

            canvas = Image.new("RGB", (cw2,ch2), (25,25,35))
            draw = ImageDraw.Draw(canvas)
            try:
                tf = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",13)
                lf = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",10)
            except:
                tf = lf = ImageFont.load_default()

            for ri,(gi,gl,gc) in enumerate(active):
                yb = ri*rh+pd
                draw.rectangle([(pd,yb),(cw2-pd,yb+ch)], fill=gc)
                draw.text((pd+6,yb+4), gl, fill=(255,255,255), font=tf)
                for ci,item in enumerate(gi[:nc]):
                    x = ci*cw+pd; y = yb+ch+4
                    try:
                        r = requests.get(_img_url(item), timeout=8)
                        if r.status_code==200:
                            im = Image.open(io.BytesIO(r.content))
                            im.thumbnail((sz,sz), Image.Resampling.LANCZOS)
                            ix = x+pd+(sz-im.width)//2; iy = y+(sz-im.height)//2
                            canvas.paste(im, (ix,iy))
                    except: pass
                    draw.rectangle([(x+pd-1,y-1),(x+pd+sz,y+sz)], outline=(100,100,100), width=1)
                    draw.text((x+pd,y+sz+2), f"[{ci}] {item.get('label','')[:18]}", fill=(180,180,180), font=lf)

            buf = io.BytesIO()
            canvas.save(buf, format="JPEG", quality=88)
            collage_b64 = base64.b64encode(buf.getvalue()).decode()
            _log.info("[DRESSING] Collage: %dx%d %dKB", cw2,ch2,len(collage_b64)//1024)
        except Exception as exc:
            _log.warning("[DRESSING] Collage failed: %s", exc)

                # ---- MiMo Vision prompt ----
        vision_prompt = (
            'Act as a master stylist with three decades of elite fashion experience. '
            'You are choosing an outfit for a client. Analyze the provided closet items. '
            'Select the best top, bottom, and shoes. Consider color theory, seasonal relevance, '
            'body flow, and mixing textures.\n\n'
            'Look only at the ACTUAL closet items shown in the image and listed below. '
            'Do NOT invent or hallucinate any items. Only use items that exist in the lists.\n'
            'Occasion: ' + style_desc + '.\n\n'
            'Available items:\n' + items_text + '\n\n'
            'Decide the BEST outfit type based on what is available and the occasion:\n'
            '- "regular": top + bottom + shoes (use top_idx, bottom_idx, shoe_idx)\n'
            '- "dress": dress + shoes (use dress_idx, shoe_idx)\n'
            '- "full_outfit": a single complete outfit item (use full_outfit_idx only)\n\n'
            'Return ONLY this JSON array (no other text, no code fences):\n'
            '{"selections":[\n'
            '  {"type":"regular","top_idx":0,"bottom_idx":0,"shoe_idx":0,"dress_idx":null,"full_outfit_idx":null,"accessory_note":"","stylist_reasoning":["The textured navy dress creates a long vertical line, elongating the torso."]}\n'
            ']}\n\n'
            'CRITICAL RULES - VIOLATION WILL BREAK THE APP:\n'
            '1. ONLY use indices for items that ACTUALLY EXIST in the lists above.\n'
            '2. If TOPS/BOTTOMS/SHOES exist, prefer "regular" type.\n'
            '3. If DRESSES exist (and occasion fits), use "dress" type. Set dress_idx to the index, shoe_idx to matching shoes (or null).\n'
            '4. If FULL OUTFITS exist, use "full_outfit" type. Set full_outfit_idx only.\n'
            '5. For "full_outfit": ONLY set full_outfit_idx. Set top_idx/bottom_idx/shoe_idx/dress_idx to null.\n'
            '6. For "dress": ONLY use dress_idx + shoe_idx. Do NOT also pick top/bottom.\n'
            '7. STRICT RULE: For EVERY selection, you MUST include a "stylist_reasoning" array containing 3 to 5 specific fashion notes explaining your choices.\n'
            '   Examples: "The cream silk top adds softness against structured trousers",'
            ' "These brown loafers ground the outfit with earthy warmth",'
            ' "The high-waisted cut creates a flattering hourglass proportion".\n'
            '8. accessory_note: ONLY write if the outfit NEEDS an accessory to be complete.\n'
            '   - If the needed accessory EXISTS in your ACCESSORIES list, say: "Add [item] from your closet".\n'
            '   - If the needed accessory is NOT in the closet, say: "Consider adding [item]".\n'
            '   - If the outfit already has accessories or doesn\'t need any, leave accessory_note as empty string "".\n'
            '9. Return exactly ' + str(count) + ' selection(s).\n'
            '10. NO HALLUCINATION. NO invented items. NO made-up indices.\n'
            '11. VARY your shoe_idx and item indices across the selections — do not pick the same shoe for every outfit.\n'
            '12. UNIQUE REASONING: For EACH selection you MUST provide a completely unique "stylist_reasoning" array.\n'
            '    Do NOT reuse or rephrase any reasoning sentence between different outfits.\n'
            '    Each outfit must have its own distinct, honest fashion logic.\n'
            '13. NO BOILERPLATE: Never use phrases like "Selected by trend algorithm",\n'
            '    "Complementary colors chosen from your wardrobe", "Selected to match your personal aesthetic",\n'
            '    or "Seasonal relevance considered". These are generic and reduce trust.\n'
            '14. BE SPECIFIC: Reference actual item labels from the lists above in your reasoning.\n'
            '    Example: "The navy blazer paired with cream trousers creates a sharp business contrast"\n'
            '    Example: "These brown leather loafers ground the light summer outfit with warmth"\n'
            '15. BE HONEST: If a matching choice is imperfect, explain why and what trade-off was made.\n'
        )

        mimo_result = None
        if collage_b64:
            try:
                _log.info("[DRESSING] Sending to MiMo Vision")
                mimo_result = call_mimo_vision(collage_b64, vision_prompt, temperature=0.2)
                _log.info("[DRESSING] MiMo Vision: %s", str(mimo_result)[:300])
                print("[DRESSING-DEBUG] MIMO_SELECTED:", json.dumps(mimo_result, indent=2)[:500], file=sys.stderr)
            except Exception as exc:
                _log.warning("[DRESSING] MiMo Vision error: %s", exc)

        # ---- Build outfits from selection ----

        if tops: print(f"[DRESSING-DEBUG] TOPS available: {[(t.get('id'), t.get('label',''), _img_url(t)[:40]) for t in tops]}", file=sys.stderr)
        if bottoms: print(f"[DRESSING-DEBUG] BOTTOMS available: {[(b.get('id'), b.get('label',''), _img_url(b)[:40]) for b in bottoms]}", file=sys.stderr)
        if shoes_list: print(f"[DRESSING-DEBUG] SHOES available: {[(s.get('id'), s.get('label',''), _img_url(s)[:40]) for s in shoes_list]}", file=sys.stderr)
        outfits = []
        used_ids = set()
        debug_source = "mimo_vision"

        for oi in range(count):
            outfit_data = {"type": "regular", "top": "", "mid": "", "bottom": "", "accessory_note": "", "stylist_reasoning": []}
            combo = None

            # Try MiMo Vision selection
            if mimo_result and isinstance(mimo_result, dict):
                try:
                    sels = mimo_result.get("selections", [])
                    if oi < len(sels):
                        sel = sels[oi]
                        otype = sel.get("type", "regular")
                        acc_note = sel.get("accessory_note", "")
                        s_reason = sel.get("stylist_reasoning", [])
                        c = {"type": otype, "accessory_note": acc_note, "stylist_reasoning": s_reason}

                        if otype == "full_outfit":
                            fidx = sel.get("full_outfit_idx")
                            if fidx is not None and 0 <= fidx < len(full_outfits):
                                c["full_outfit"] = full_outfits[fidx]
                            # Require at least one actual item key
                            item_keys = [k for k in c if k in ("full_outfit", "dress", "shoes", "top", "bottom")]
                            if item_keys:
                                combo = c
                                debug_source = "mimo_vision"
                        elif otype == "dress":
                            didx = sel.get("dress_idx")
                            sidx = sel.get("shoe_idx")
                            if didx is not None and 0 <= didx < len(dresses):
                                c["dress"] = dresses[didx]
                            if sidx is not None and 0 <= sidx < len(shoes_list):
                                c["shoes"] = shoes_list[sidx]
                            item_keys = [k for k in c if k in ("full_outfit", "dress", "shoes", "top", "bottom")]
                            if item_keys:
                                combo = c
                                debug_source = "mimo_vision"
                        else:
                            ti = sel.get("top_idx")
                            bi = sel.get("bottom_idx")
                            si = sel.get("shoe_idx")
                            if ti is not None and 0 <= ti < len(tops): c["top"] = tops[ti]
                            if bi is not None and 0 <= bi < len(bottoms): c["bottom"] = bottoms[bi]
                            if si is not None and 0 <= si < len(shoes_list): c["shoes"] = shoes_list[si]
                            item_keys = [k for k in c if k in ("full_outfit", "dress", "shoes", "top", "bottom")]
                            if len(item_keys) >= 2:
                                combo = c
                                debug_source = "mimo_vision"
                except (IndexError, TypeError, ValueError) as e:
                    _log.warning("[DRESSING] MiMo parse error: %s", e)

            # ── Fallback: random selection if MiMo failed or skipped ──
            if not combo:
                _log.info("[DRESSING] Fallback random outfit %d", oi)
                fallback_c: dict = {"type": "regular", "accessory_note": "", "stylist_reasoning": [
                    "Curated from your wardrobe for a cohesive look",
                    "Pieces selected to complement each other in color and texture",
                    "Designed to work with your existing style preferences"
                ]}
                # Pick a top (prefer unused)
                if tops:
                    unused_tops = [t for t in tops if t.get("id") not in used_ids]
                    fallback_c["top"] = unused_tops[0] if unused_tops else random.choice(tops)
                # Pick a bottom (prefer unused)
                if bottoms:
                    unused_bottoms = [b for b in bottoms if b.get("id") not in used_ids]
                    fallback_c["bottom"] = unused_bottoms[0] if unused_bottoms else random.choice(bottoms)
                # Pick shoes (rotate through to avoid all same)
                if shoes_list:
                    shoe_idx = oi % len(shoes_list)
                    fallback_c["shoes"] = shoes_list[shoe_idx]
                # Mark as random fallback
                item_keys = [k for k in fallback_c if k in ("full_outfit", "dress", "shoes", "top", "bottom")]
                if len(item_keys) >= 2:
                    combo = fallback_c
                    debug_source = "random_fallback"
                    _log.info("[DRESSING] Random fallback built outfit %d: top=%s bottom=%s shoe_idx=%d",
                              oi, fallback_c.get("top", {}).get("label","none"),
                              fallback_c.get("bottom", {}).get("label","none"),
                              shoe_idx)

            if not combo:
                _log.warning("[DRESSING] Could not build outfit %d — not enough items", oi)
                continue

            # Track used IDs
            for v in combo.values():
                if isinstance(v, dict) and v.get("id"):
                    used_ids.add(v.get("id"))

            # Build outfit based on type
            if combo.get("type") == "full_outfit":
                fo = combo.get("full_outfit", {})
                outfit_data = {
                    "type": "full_outfit",
                    "top": _img_url(fo),
                    "mid": "",
                    "bottom": "",
                    "accessory_note": combo.get("accessory_note", ""),
                    "stylist_reasoning": [_humanize_stylist_note(n) for n in (combo.get("stylist_reasoning") or [])],
                }
                _log.info("[DRESSING] FULL_OUTFIT: %s", outfit_data['top'][:50])
            elif combo.get("type") == "dress":
                dr = combo.get("dress", {})
                sh = combo.get("shoes", {})
                outfit_data = {
                    "type": "dress",
                    "top": _img_url(dr),
                    "mid": "",
                    "bottom": _img_url(sh),
                    "accessory_note": combo.get("accessory_note", ""),
                    "stylist_reasoning": [_humanize_stylist_note(n) for n in (combo.get("stylist_reasoning") or [])],
                }
                _log.info("[DRESSING] DRESS: top=%s bottom=%s", outfit_data['top'][:50], outfit_data['bottom'][:50])
            else:  # regular
                outfit_data = {
                    "type": "regular",
                    "top": _img_url(combo.get("top", {})),
                    "mid": _img_url(combo.get("bottom", {})),
                    "bottom": _img_url(combo.get("shoes", {})),
                    "accessory_note": combo.get("accessory_note", ""),
                    "stylist_reasoning": [_humanize_stylist_note(n) for n in (combo.get("stylist_reasoning") or [])],
                }
                _log.info("[DRESSING] REGULAR: top=%s mid=%s bottom=%s",
                          outfit_data['top'][:40], outfit_data['mid'][:40], outfit_data['bottom'][:40])

            outfits.append(outfit_data)

        # If no outfits were built from MiMo selections, return structured error
        # If no outfits were built from MiMo selections, return graceful 200
        if not outfits:
            _log.warning("[DRESSING] No outfits could be constructed from MiMo Vision selections")
            return jsonify({
                "success": False,
                "images": [],
                "error": "MiMo Vision could not build any valid outfits for this occasion",
            }), 200

        print(f"[DEBUG] Requested: {count}, Returned: {len(outfits)}")
        return jsonify({
            "success": True,
            "images": outfits,
            "occasion": occasion,
            "count": len(outfits),
            "source": debug_source,
        })
    except Exception as exc:
        _log.error("[DRESSING] Error: %s", exc, exc_info=True)
        traceback.print_exc()
        return jsonify({"success": False, "error": str(exc)[:200]}), 500


# Transparent GIF pixel for CORB-safe 404 fallback
_TRANSPARENT_PIXEL_B64 = "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"

# Serve static files with proper CORS headers to prevent CORB errors
@app.route("/static/<path:filename>")

@app.route("/images/<path:filename>")
def serve_uploaded_image(filename):
    """Serve user-uploaded closet images — disk first, then base64 fallback from JSON."""
    # Strip any nested /images/ prefix to handle double-prefix gracefully
    safe = filename
    if safe.startswith("images/"):
        safe = safe[len("images/"):]
    images_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public", "images")
    real_path = os.path.realpath(os.path.join(images_dir, safe))
    print(f"[IMG-DEBUG] Request: filename={filename} safe={safe} path={real_path}", flush=True)

    # 1. Check disk first (ephemeral — may be empty after restart)
    if real_path.startswith(os.path.realpath(images_dir)) and os.path.isfile(real_path):
        print(f"[IMG-DEBUG] Serving from disk: {safe}")
        resp = send_from_directory(images_dir, safe)
        resp.headers.add("Access-Control-Allow-Origin", "*")
        return resp

    # 2. Fallback: find matching item in JSON by EXACT filename, serve base64
    try:
        with open(_LOCAL_CLOSET_FILE, "r") as fb:
            items = json.load(fb)
        for it in items if isinstance(items, list) else []:
            stored_url = (it.get("image_url") or it.get("photo_url") or "").strip()
            # Extract the exact filename from the stored URL
            stored_filename = stored_url.rstrip("/").split("/")[-1]
            b64_data = it.get("image_data_b64") or ""
            if stored_filename == safe and b64_data and len(b64_data) > 100:
                try:
                    img_bytes = base64.b64decode(b64_data)
                    print(f"[IMG-DEBUG] Serving from base64: {safe} ({len(img_bytes)} bytes)")
                    resp = make_response(img_bytes)
                    resp.headers["Content-Type"] = "image/jpeg"
                    resp.headers["Access-Control-Allow-Origin"] = "*"
                    return resp
                except Exception as dec_err:
                    print(f"[IMG-ERR] Base64 decode failed for {safe}: {dec_err}", flush=True)
    except Exception as fb_err:
        print(f"[IMG-DEBUG] JSON fallback error: {fb_err}", flush=True)

    # 3. Fallback: search Qdrant Cloud for the item
    try:
        client = _qdrant_closet
        if client is not None:
            result = client.scroll(
                collection_name=_CLOSET_COLLECTION,
                limit=5000,
                with_payload=True
            )
            points = result[0] if isinstance(result, tuple) else result
            for pt in points:
                if not pt.payload:
                    continue
                payload = pt.payload
                stored_url = (payload.get("image_url") or payload.get("photo_url") or "").strip()
                stored_filename = stored_url.rstrip("/").split("/")[-1]
                b64_data = payload.get("image_data_b64") or ""
                if stored_filename == safe and b64_data and len(b64_data) > 100:
                    try:
                        img_bytes = base64.b64decode(b64_data)
                        print(f"[IMG-DEBUG] Serving from Qdrant base64: {safe} ({len(img_bytes)} bytes)")
                        resp = make_response(img_bytes)
                        resp.headers["Content-Type"] = "image/jpeg"
                        resp.headers["Access-Control-Allow-Origin"] = "*"
                        return resp
                    except Exception as dec_err:
                        print(f"[IMG-ERR] Qdrant Base64 decode failed for {safe}: {dec_err}", flush=True)
    except Exception as qd_err:
        print(f"[IMG-DEBUG] Qdrant fallback error: {qd_err}", flush=True)

    # 4. Ultimate fallback — transparent pixel prevents CORB
    print(f"[IMG-DEBUG] File not found: {safe} — returning transparent pixel", flush=True)
    resp = make_response(base64.b64decode(_TRANSPARENT_PIXEL_B64))
    resp.headers["Content-Type"] = "image/gif"
    resp.headers["Access-Control-Allow-Origin"] = "*"
    return resp

@app.route("/media/<path:filename>")
def serve_media_file(filename):
    """Serve uploaded/closet images with CORS headers — disk first, then base64 fallback."""
    # Strip nested prefixes to handle double-prefix gracefully
    safe = filename
    if safe.startswith("images/") or safe.startswith("media/"):
        safe = safe.split("/", 1)[1] if "/" in safe else safe
    images_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public", "images")
    real_path = os.path.realpath(os.path.join(images_dir, safe))
    print(f"[IMG-DEBUG] /media/ Request: filename={filename} safe={safe}", flush=True)

    # 1. Check disk first
    if real_path.startswith(os.path.realpath(images_dir)) and os.path.isfile(real_path):
        print(f"[IMG-DEBUG] /media/ Serving from disk: {safe}")
        resp = send_from_directory(images_dir, safe)
        resp.headers.add("Access-Control-Allow-Origin", "*")
        return resp

    # 2. Fallback: find matching item in JSON by EXACT filename, serve base64
    try:
        with open(_LOCAL_CLOSET_FILE, "r") as fb:
            items = json.load(fb)
        for it in items if isinstance(items, list) else []:
            stored_url = (it.get("image_url") or it.get("photo_url") or "").strip()
            stored_filename = stored_url.rstrip("/").split("/")[-1]
            b64_data = it.get("image_data_b64") or ""
            if stored_filename == safe and b64_data and len(b64_data) > 100:
                try:
                    img_bytes = base64.b64decode(b64_data)
                    print(f"[IMG-DEBUG] /media/ Serving from base64: {safe} ({len(img_bytes)} bytes)")
                    resp = make_response(img_bytes)
                    resp.headers["Content-Type"] = "image/jpeg"
                    resp.headers["Access-Control-Allow-Origin"] = "*"
                    return resp
                except Exception as dec_err:
                    print(f"[IMG-ERR] /media/ Base64 decode failed for {safe}: {dec_err}", flush=True)
    except Exception as fb_err:
        print(f"[IMG-DEBUG] /media/ JSON fallback error: {fb_err}", flush=True)

    # 3. Fallback: search Qdrant Cloud for the item
    try:
        client = _qdrant_closet
        if client is not None:
            result = client.scroll(
                collection_name=_CLOSET_COLLECTION,
                limit=5000,
                with_payload=True
            )
            points = result[0] if isinstance(result, tuple) else result
            for pt in points:
                if not pt.payload:
                    continue
                payload = pt.payload
                stored_url = (payload.get("image_url") or payload.get("photo_url") or "").strip()
                stored_filename = stored_url.rstrip("/").split("/")[-1]
                b64_data = payload.get("image_data_b64") or ""
                if stored_filename == safe and b64_data and len(b64_data) > 100:
                    try:
                        img_bytes = base64.b64decode(b64_data)
                        print(f"[IMG-DEBUG] /media/ Serving from Qdrant base64: {safe} ({len(img_bytes)} bytes)")
                        resp = make_response(img_bytes)
                        resp.headers["Content-Type"] = "image/jpeg"
                        resp.headers["Access-Control-Allow-Origin"] = "*"
                        return resp
                    except Exception as dec_err:
                        print(f"[IMG-ERR] /media/ Qdrant Base64 decode failed for {safe}: {dec_err}", flush=True)
    except Exception as qd_err:
        print(f"[IMG-DEBUG] /media/ Qdrant fallback error: {qd_err}", flush=True)

    # 4. Ultimate fallback — transparent pixel prevents CORB
    print(f"[IMG-DEBUG] /media/ File not found: {safe} — returning transparent pixel", flush=True)
    resp = make_response(base64.b64decode(_TRANSPARENT_PIXEL_B64))
    resp.headers["Content-Type"] = "image/gif"
    resp.headers["Access-Control-Allow-Origin"] = "*"
    return resp

# Global CORS-safe error handlers — return JSON instead of HTML to prevent CORB
@app.errorhandler(404)
def not_found(e):
    """Return JSON 404 with CORS headers instead of HTML (which would trigger CORB)."""
    from flask import make_response, jsonify
    resp = make_response(jsonify({"error": "Not found", "status": 404}))
    resp.headers["Access-Control-Allow-Origin"] = "*"
    resp.headers["Content-Type"] = "application/json"
    return resp, 404

@app.errorhandler(500)
def server_error(e):
    """Return JSON 500 with CORS headers instead of HTML."""
    from flask import make_response, jsonify
    resp = make_response(jsonify({"error": "Internal server error", "status": 500}))
    resp.headers["Access-Control-Allow-Origin"] = "*"
    resp.headers["Content-Type"] = "application/json"
    return resp, 500



def _humanize_stylist_note(note: str) -> str:
    """Post-process text through the Humanizer to remove AI writing patterns.
    Replaces stiff, academic or AI-sounding phrases with warm, natural language."""
    try:
        from backend.utils.humanizer import humanize_text
        return humanize_text(note)
    except ImportError:
        # Fallback if humanizer module not available
        import re
        replacements = [
            (r'\bprovides\b', 'gives'),
            (r'\bintroduces\b', 'adds'),
            (r'\bperfect for\b', 'ideal for'),
            (r'\bensemble\b', 'outfit'),
            (r'\bsilhouette\b', 'shape'),
            (r'\baesthetic\b', 'look'),
            (r'\bselected by trend algorithm\b', ''),
        ]
        result = note
        for pattern, replacement in replacements:
            result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
        result = re.sub(r'  +', ' ', result)
        result = result.strip().strip(',').strip()
        if result:
            result = result[0].upper() + result[1:]
        if result and not result.endswith('.'):
            result += '.'
        return result