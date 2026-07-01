"""Central configuration — single source of truth for all env vars and settings.
Reads from .env, validates at import time, provides typed accessors."""

import os
import logging
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BASE_DIR, ".env"), override=True)

_log = logging.getLogger("luxor.config")

# ── MiMo Vision 2.5 ────────────────────────────────────────────────────
MIMO_API_KEY: str = os.getenv("MIMO_API_KEY", "")
MIMO_API_URL: str = "https://api.xiaomimimo.com/v1/chat/completions"
MIMO_VISION_MODEL: str = os.getenv("MIMO_VISION_MODEL", "mimo-v2.5")
MIMO_TEXT_MODEL: str = os.getenv("MIMO_TEXT_MODEL", "mimo-v2.5")

# ── General ────────────────────────────────────────────────────────────
CIPHER_MAX_TOKENS: int = int(os.getenv("CIPHER_MAX_TOKENS", "1500"))
PORT: int = int(os.getenv("PORT", "5000"))

# ── Vercel Blob ────────────────────────────────────────────────────────
BLOB_READ_WRITE_TOKEN: str = os.getenv("BLOB_READ_WRITE_TOKEN", "")

# ── Qdrant Vector DB ───────────────────────────────────────────────────
QDRANT_URL: str = os.getenv("QDRANT_URL", "")
QDRANT_API_KEY: str = os.getenv("QDRANT_API_KEY", "")

# ── Startup Validation ─────────────────────────────────────────────────
def validate_config() -> list[str]:
    """Check required config. Returns list of missing items (empty = all good)."""
    missing: list[str] = []
    if not MIMO_API_KEY:
        missing.append("MIMO_API_KEY")
    if not QDRANT_URL or not QDRANT_API_KEY:
        _log.warning("Qdrant not configured — closet features disabled")
    return missing

def log_config() -> None:
    """Log current config state (key values masked)."""
    _log.info("MiMo API key: %s (masked: %s)", bool(MIMO_API_KEY),
              MIMO_API_KEY[:8] + "..." + MIMO_API_KEY[-4:] if MIMO_API_KEY else "NONE")
    _log.info("MiMo models: vision=%s text=%s", MIMO_VISION_MODEL, MIMO_TEXT_MODEL)
    _log.info("Blob token: %s", bool(BLOB_READ_WRITE_TOKEN))
    _log.info("Qdrant: %s", bool(QDRANT_URL and QDRANT_API_KEY))

# Run validation on import
_issues = validate_config()
if _issues:
    _log.warning("Config issues found: %s", ", ".join(_issues))
