"""Model Router — classifies request complexity and selects the optimal model tier.

Three tiers:
  LIGHTWEIGHT  → fast, cheap (color extraction, basic classification, simple Q&A)
  MID          → balanced (style analysis, outfit recommendations, wardrobe tips)
  HEAVY        → maximum reasoning (virtual try-on, trend forecasting, council debates)

Usage:
    from backend.ai.model_router import get_model_for_task, classify_complexity

    model = get_model_for_task("outfit_recommendation")  # → mid-tier model
    tier, score = classify_complexity(task_type="color_extraction", text_length=50)
"""

from __future__ import annotations

import logging
import re
from typing import Tuple

from backend.config import (
    MIMO_LIGHTWEIGHT_MODEL,
    MIMO_MID_MODEL,
    MIMO_HEAVY_MODEL,
    MIMO_VISION_MODEL,
)

_log = logging.getLogger("luxor.router")


# ── Task Classification Maps ────────────────────────────────────────────

# Keywords / task types mapped to complexity tiers
_LIGHTWEIGHT_TASKS: set[str] = {
    "color_extraction",
    "color_detection",
    "color_analysis",
    "basic_classification",
    "garment_classification",
    "simple_qa",
    "image_label",
    "tag_extraction",
    "simple问候",
    "greeting",
    "ping",
    "health_check",
}

_MID_TASKS: set[str] = {
    "style_analysis",
    "outfit_recommendation",
    "outfit_recommend",
    "wardrobe_tip",
    "wardrobe_tip",
    "closet_suggestion",
    "wardrobe_suggestion",
    "outfit_review",
    "outfit_score",
    "color_suggestion",
    "style_score",
    "tweak_suggestion",
    "pro_tweak",
    "style_profile",
}

_HEAVY_TASKS: set[str] = {
    "virtual_try_on",
    "virtual_tryon",
    "try_on_reasoning",
    "trend_forecasting",
    "trend_analysis",
    "council_debate",
    "council_review",
    "multi_step_reasoning",
    "deep_analysis",
    "full_wardrobe_planning",
    "seasonal_planning",
    "body_type_recommendation",
    "style_analysis_with_recommendation",
    "outfit_generation",
    "dressing_room",
    "fashion_council",
    "editorial_generation",
}


# ── Complexity Scoring ──────────────────────────────────────────────────

def _text_complexity_score(text: str) -> int:
    """Score text input complexity 0-100 based on structural signals.

    Signals considered:
      - Length (longer = more complex)
      - Question count (multiple questions = higher complexity)
      - Conditional logic keywords (if, when, unless, except)
      - Domain-specific terms (fabric, silhouette, proportion, etc.)
      - JSON/nested structure presence
    """
    if not text:
        return 0

    score = 0
    length = len(text)
    word_count = len(text.split())

    # Length scoring (0-30 points)
    if length < 50:
        score += 5
    elif length < 200:
        score += 10
    elif length < 500:
        score += 15
    elif length < 1500:
        score += 20
    else:
        score += 30

    # Question count (0-15 points)
    questions = text.count("?")
    score += min(questions * 5, 15)

    # Conditional/logic keywords (0-20 points)
    logic_keywords = [
        "if", "when", "unless", "except", "considering", "given that",
        "assuming", "provided", "whether", "however", "although",
    ]
    text_lower = text.lower()
    logic_count = sum(1 for kw in logic_keywords if kw in text_lower)
    score += min(logic_count * 4, 20)

    # Domain complexity terms (0-20 points)
    domain_terms = [
        "silhouette", "proportion", "fabric", "texture", "undertone",
        "contrast", "monochrome", "analogous", "complementary",
        "seasonal", "capsule", "wardrobe", "styling", "editorial",
        "trend", "avant-garde", "minimalist", "maximalist",
        "body_type", "face_shape", "color_harmony", "accessorize",
    ]
    domain_count = sum(1 for term in domain_terms if term in text_lower)
    score += min(domain_count * 3, 20)

    # Structured data (JSON-like content) (0-15 points)
    if "{" in text and "}" in text:
        score += 5
    if text.count("{") > 2:
        score += 10

    return min(score, 100)


def classify_complexity(
    task_type: str = "",
    text_length: int = 0,
    text: str = "",
    has_image: bool = False,
) -> Tuple[str, int]:
    """Classify a request into a complexity tier.

    Args:
        task_type: The identified task type (e.g., "outfit_recommendation").
        text_length: Length of the text input in characters.
        text: The actual text content for deeper analysis.
        has_image: Whether the request includes an image.

    Returns:
        Tuple of (tier_name, complexity_score).
        tier_name is one of: "lightweight", "mid", "heavy"
        complexity_score is 0-100.
    """
    task_lower = task_type.lower().strip() if task_type else ""

    # ── Phase 1: Explicit task-type classification ──
    if task_lower in _LIGHTWEIGHT_TASKS:
        base_score = 15
    elif task_lower in _MID_TASKS:
        base_score = 50
    elif task_lower in _HEAVY_TASKS:
        base_score = 80
    else:
        # Unknown task type — use heuristics
        base_score = 50  # default to mid

    # ── Phase 2: Text complexity adjustment ──
    text_score = _text_complexity_score(text) if text else 0

    # Weighted blend: 60% task-type score + 40% text complexity
    if text:
        final_score = int(base_score * 0.6 + text_score * 0.4)
    else:
        final_score = base_score

    # ── Phase 3: Image boost ──
    # Vision tasks are inherently more complex
    if has_image:
        final_score = min(final_score + 10, 100)

    # ── Phase 4: Map score to tier ──
    if final_score <= 30:
        tier = "lightweight"
    elif final_score <= 65:
        tier = "mid"
    else:
        tier = "heavy"

    _log.info(
        "[ROUTER] task=%s score=%d tier=%s (base=%d text=%d image=%s)",
        task_type or "unknown", final_score, tier, base_score, text_score, has_image,
    )

    return tier, final_score


# ── Model Selection ─────────────────────────────────────────────────────

def get_model_for_task(task_type: str) -> str:
    """Select the optimal model for a given task type.

    This is the primary entry point for task-based routing.
    Maps task type → complexity tier → model name.
    """
    tier, _score = classify_complexity(task_type=task_type)
    return get_model_for_tier(tier)


def get_model_for_tier(tier: str) -> str:
    """Map a tier name to its configured model name."""
    tier_map = {
        "lightweight": MIMO_LIGHTWEIGHT_MODEL,
        "mid": MIMO_MID_MODEL,
        "heavy": MIMO_HEAVY_MODEL,
    }
    model = tier_map.get(tier, MIMO_MID_MODEL)
    _log.info("[ROUTER] tier=%s → model=%s", tier, model)
    return model


def get_model_for_complexity(score: int) -> str:
    """Map a numeric complexity score (0-100) to a model name."""
    if score <= 30:
        return get_model_for_tier("lightweight")
    elif score <= 65:
        return get_model_for_tier("mid")
    else:
        return get_model_for_tier("heavy")


def get_vision_model() -> str:
    """Always return the best vision model (images need quality)."""
    return MIMO_VISION_MODEL


# ── Convenience: Route a full request ───────────────────────────────────

def route_request(
    task_type: str = "",
    text: str = "",
    has_image: bool = False,
) -> dict:
    """Full routing decision in one call.

    Returns dict with:
        tier: "lightweight" | "mid" | "heavy"
        score: 0-100
        text_model: model name for text tasks
        vision_model: model name for vision tasks
    """
    tier, score = classify_complexity(
        task_type=task_type,
        text=text,
        has_image=has_image,
    )

    result = {
        "tier": tier,
        "score": score,
        "text_model": get_model_for_tier(tier),
        "vision_model": get_vision_model(),
    }

    _log.info(
        "[ROUTER] route_request: tier=%s score=%d text_model=%s vision_model=%s",
        tier, score, result["text_model"], result["vision_model"],
    )

    return result
