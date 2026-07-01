"""Image preprocessing — compression, validation, orientation."""

import base64
import io
import logging
from typing import Optional

from PIL import Image

_log = logging.getLogger("luxor.image")

_RESAMPLE_LANCZOS = Image.Resampling.LANCZOS


def compress_image_b64(image_b64: str, max_dim: int = 1600, quality: int = 85) -> str:
    """Compress a base64-encoded image to reduce payload size for MiMo API.
    
    Resizes to max_dim on longest edge, saves as JPEG with given quality.
    """
    try:
        raw = base64.b64decode(image_b64)
        img = Image.open(io.BytesIO(raw))
        # Convert RGBA/P to RGB
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        # Resize if needed
        w, h = img.size
        if w > max_dim or h > max_dim:
            ratio = min(max_dim / w, max_dim / h)
            img = img.resize((int(w * ratio), int(h * ratio)), _RESAMPLE_LANCZOS)
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=quality, optimize=True)
        compressed = base64.b64encode(buf.getvalue()).decode("utf-8")
        _log.info("[IMAGE] Compressed %dx%d → %d KB", img.width, img.height, len(compressed) // 1024)
        return compressed
    except Exception as exc:
        _log.error("[IMAGE] Compression error: %s", exc)
        return image_b64  # Return original on failure


def validate_image(image_b64: str) -> Optional[str]:
    """Validate a base64 image. Returns error message or None if valid."""
    if not image_b64:
        return "No image data provided"
    try:
        raw = base64.b64decode(image_b64)
        img = Image.open(io.BytesIO(raw))
        width, height = img.size
        _log.info("[IMAGE] Validated: %s %dx%d %dKB", img.format, width, height, len(raw) // 1024)
        if width < 100 or height < 100:
            return f"Image too small ({width}x{height})"
        if len(raw) > 20 * 1024 * 1024:  # 20MB
            return "Image too large (max 20MB)"
        return None
    except Exception as exc:
        return f"Invalid image: {exc}"
