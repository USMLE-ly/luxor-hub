"""Health endpoints for monitoring and debugging.

The `init_routes` function accepts an optional `get_closet_count` callable
so the main app can inject its Qdrant-backed count without circular imports.
"""

from typing import Callable, Optional

from flask import jsonify

from backend.config import (
    MIMO_API_KEY,
    MIMO_API_URL,
    MIMO_VISION_MODEL,
    QDRANT_URL,
    QDRANT_API_KEY,
    BLOB_READ_WRITE_TOKEN,
)


def init_routes(app, get_closet_count: Optional[Callable[[], int]] = None):
    # Fast ping — no dependencies, instant response for Replit healthcheck
    @app.route("/ping", methods=["GET"])
    def ping():
        return jsonify({"status": "ok"}), 200

    # Root "/" removed — catch-all in main.py serves the frontend
    @app.route("/api/health", methods=["GET"])
    @app.route("/health", methods=["GET"])
    def health():
        closet_count = get_closet_count() if get_closet_count else 0
        return jsonify({
            "status": "ok",
            "service": "luxor-fashion-omega-v5",
            "mimo_configured": bool(MIMO_API_KEY),
            "blob_configured": bool(BLOB_READ_WRITE_TOKEN),
            "qdrant_configured": bool(QDRANT_URL and QDRANT_API_KEY),
            "closet_items": closet_count,
        })

    @app.route("/api/health/mimo", methods=["GET"])
    def mimo_health():
        """Test MiMo configuration without uploading an image."""
        return jsonify({
            "api_key_loaded": bool(MIMO_API_KEY),
            "endpoint": MIMO_API_URL,
            "model": MIMO_VISION_MODEL,
            "authentication": "configured" if MIMO_API_KEY else "missing",
        })

    @app.route("/api/health/config", methods=["GET"])
    def config_health():
        return jsonify({
            "mimo_configured": bool(MIMO_API_KEY),
            "qdrant": bool(QDRANT_URL and QDRANT_API_KEY),
            "blob": bool(BLOB_READ_WRITE_TOKEN),
        })
