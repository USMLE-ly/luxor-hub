"""Health endpoints for monitoring and debugging."""

from flask import jsonify

from backend.config import MIMO_API_KEY, MIMO_API_URL, MIMO_VISION_MODEL


def init_routes(app):
    @app.route("/", methods=["GET"])
    @app.route("/api/health", methods=["GET"])
    @app.route("/health", methods=["GET"])
    def health():
        return jsonify({
            "status": "ok",
            "service": "luxor-fashion-omega-v5",
            "mimo_configured": bool(MIMO_API_KEY),
            "mimo_key_prefix": MIMO_API_KEY[:8] if MIMO_API_KEY else "",
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
        from backend.config import QDRANT_URL, QDRANT_API_KEY, BLOB_READ_WRITE_TOKEN
        return jsonify({
            "api_key": bool(MIMO_API_KEY),
            "qdrant": bool(QDRANT_URL and QDRANT_API_KEY),
            "blob": bool(BLOB_READ_WRITE_TOKEN),
        })
