"""Outfit analysis endpoint — POST /api/v1/analyze-outfit."""

import logging
import time

from flask import request, jsonify

from backend.ai.mimo_client import call_mimo_vision
from backend.ai.prompts import SACRED_PROMPT
from backend.services.fashion_service import get_fashion_decision, map_analysis

_log = logging.getLogger("luxor.analyze")

# Cache the most recent image_b64 for debug endpoints
_image_b64_cache = ""


def init_routes(app):
    global _image_b64_cache

    @app.route("/api/v1/analyze-outfit", methods=["POST", "OPTIONS"], strict_slashes=False)
    def analyze_outfit():
        if request.method == "OPTIONS":
            return "", 204
        data = request.get_json(silent=True) or {}
        image_b64 = data.get("image_b64")
        if not image_b64:
            return jsonify({"error": "Missing image_b64"}), 400
        _image_b64_cache = image_b64
        _t0 = time.time()
        try:
            result = get_fashion_decision(image_b64)
            timing = {"mimo_vision": round(time.time() - _t0, 2), "total": round(time.time() - _t0, 2)}
            response = map_analysis(result)
            response["timing"] = timing
            return jsonify(response)
        except Exception as exc:
            _log.error("[ANALYZE] ERROR: %s", exc)
            return jsonify({
                "success": False,
                "error": f"MiMo Vision 2.5 failed: {str(exc)[:200]}",
                "items_detected": [],
                "strengths": [],
                "improvements": [],
                "actual_colors": [],
                "tweak_plan": "",
                "generation_prompt": "",
            }), 500

    @app.route("/debug/analyze", methods=["POST"], strict_slashes=False)
    def debug_analyze():
        """Debug endpoint — bypasses JSON parsing, returns raw MiMo response."""
        data = request.get_json(silent=True) or {}
        image_b64 = data.get("image_b64")
        if not image_b64:
            return jsonify({"error": "Missing image_b64"}), 400

        features = _extract_image_features(image_b64)
        result = call_mimo_vision(
            image_b64,
            SACRED_PROMPT + "\n\nExtracted image features: " + features,
            temperature=0.2,
        )
        if result:
            return jsonify({"status": "success", "code": 200, "model": "mimo-v2.5", "raw": result})
        return jsonify({"status": "error", "error": "MiMo call failed"}), 500


def _extract_image_features(image_b64: str) -> str:
    """Extract basic image features for debug context."""
    import base64, io
    from PIL import Image
    try:
        raw = base64.b64decode(image_b64)
        img = Image.open(io.BytesIO(raw))
        w, h = img.size
        return f"Image dimensions: {w}x{h}, format: {img.format}, mode: {img.mode}"
    except Exception:
        return "Image features unavailable"
