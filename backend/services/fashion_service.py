"""Fashion analysis business logic — get_fashion_decision, map_analysis, humanizers."""

import json
import logging
import random
import time
import urllib.parse
from typing import Any, Dict, List, Optional

from backend.ai.mimo_client import call_mimo_vision
from backend.ai.prompts import SACRED_PROMPT

_log = logging.getLogger("luxor.fashion")

# Color name list (populated from dictionary at runtime)
_COLOR_NAMES: List[str] = []


def set_color_names(names: List[str]) -> None:
    global _COLOR_NAMES
    _COLOR_NAMES = names


def get_fashion_decision(image_b64: str) -> Dict[str, Any]:
    """Call MiMo Vision 2.5 — returns dict on success, raises on failure."""
    _log.info("[PIPELINE] Starting analysis")
    try:
        result = call_mimo_vision(image_b64, SACRED_PROMPT, 0.2)
        if result:
            _log.info("[PIPELINE] MiMo OK: top=%s bottom=%s",
                      result.get("top_type", ""), result.get("bottom_type", ""))
            return result
    except Exception as exc:
        _log.error("[PIPELINE] MiMo error: %s", exc)

    _log.error("[PIPELINE] MiMo Vision 2.5 failed - no fallback")
    raise RuntimeError("MiMo Vision 2.5 failed to analyze the image")


def generate_tweak_visualization_prompt(original_items_string: str, tweak_item_string: str) -> str:
    """Generate a hyperrealistic fashion editorial prompt for AI image generation.
    
    Always produces a prompt showing a real person wearing the complete 
    original + tweak outfit. No isolated products, no marble backgrounds.
    Uses strict editorial fashion structure.
    
    Args:
        original_items_string: The original outfit items, comma-separated 
            (e.g., 'Black Lace Sleeve Blouse, Olive Green Trousers')
        tweak_item_string: The full tweak recommendation text 
            (e.g., 'Pair with cream wide-leg trousers and woven sandals')
    
    Returns:
        A detailed editorial fashion prompt string for Pollinations or similar AI image API.
        Includes embedded --no negative terms for Pollinations compatibility.
    """
    original = original_items_string.strip().rstrip(',') if original_items_string else ''
    tweak = tweak_item_string.strip().rstrip('.') if tweak_item_string else ''
    
    # Build the complete outfit description for the prompt
    if original and tweak:
        # Capitalize first letter of tweak for clean sentence flow
        tweak_clean = tweak[0].upper() + tweak[1:] if tweak else ''
        outfit_desc = f"{original}. {tweak_clean}"
    elif original:
        outfit_desc = original
    elif tweak:
        outfit_desc = tweak[0].upper() + tweak[1:] if tweak else ''
    else:
        outfit_desc = 'A complete outfit'
    
    return (
        f"SUBJECT: A fashion model standing confidently in a full-body shot, wearing {outfit_desc}. "
        f"The model has natural skin texture, visible pores, and a refined, poised expression. "
        f"The posture is relaxed yet sophisticated, conveying effortless elegance.\n\n"
        f"MEDIUM: 8k ultra-photorealistic fashion photograph, DSLR full-frame camera, "
        f"85mm focal length, crisp optical clarity, high-fidelity fabric rendering, "
        f"premium editorial finish.\n\n"
        f"ENVIRONMENT: Minimalist high-end fashion studio setting. A soft, seamless white "
        f"or neutral grey gradient backdrop. Clean, uncluttered, and distraction-free space "
        f"designed to emphasize the garment details and silhouette.\n\n"
        f"LIGHTING: Soft diffused studio lighting. Natural, balanced illumination providing "
        f"gentle highlights and micro-shadows. No harsh contrast, no artificial glow. "
        f"True-to-life light scattering across skin and fabric.\n\n"
        f"COLOR: True-to-life color calibration. Harmonious palette featuring natural skin tones "
        f"and precise textile colors. Accurate rendering of every garment without oversaturation.\n\n"
        f"MOOD: Modern, refined, minimalist luxury. Confident, elegant, and effortlessly "
        f"sophisticated. Premium high-fashion editorial atmosphere.\n\n"
        f"COMPOSITION: Full-body framing, straight-on angle, centered composition. "
        f"Shallow depth of field keeping the model and outfit in sharp focus while the "
        f"background falls softly out of focus. Magazine-ready editorial quality.\n\n"
        f"--no marble --no stone background --no table --no flat lay --no product photography "
        f"--no isolated product --no product isolation --no stainless steel --no metal object "
        f"--no jewelry box --no tarnished metal --no dark shadows --no empty room "
        f"--no human --no model --no missing limbs --no distorted hands "
        f"--no mannequin --no plastic --no top-down view --no abstract "
        f"--no low resolution --no blurry --no text --no watermark --no logo "
        f"--no cartoon --no illustration --no painting --no 3d render"
    )

def _humanize_strengths(items: List[str]) -> List[str]:
    """Generate specific strength statements about detected items."""
    if not items:
        return [
            "The proportions work well together.",
            "The color palette makes sense for the context.",
            "It reads as intentional without being overdone.",
        ]
    strengths = []
    for item in items[:3]:
        if "top" in item.lower() or "blouse" in item.lower() or "shirt" in item.lower():
            strengths.append(f"The {item} is the right kind of versatile.")
        elif "bottom" in item.lower() or "pant" in item.lower() or "jean" in item.lower() or "skirt" in item.lower():
            strengths.append(f"Those {item} keeps the silhouette clean and intentional.")
        elif "shoe" in item.lower() or "boot" in item.lower() or "sneaker" in item.lower():
            strengths.append(f"The {item} grounds the look with intention.")
        elif "earring" in item.lower() or "necklace" in item.lower() or "bracelet" in item.lower():
            strengths.append(f"The {item} pulls everything together.")
        else:
            strengths.append(f"The {item} adds character to the outfit.")
    if len(strengths) < 2:
        strengths.append("The overall silhouette creates a balanced visual flow.")
    if len(strengths) < 3:
        strengths.append("The styling choices show deliberate consideration.")
    return strengths[:3]


def _humanize_audit(items: List[str], style_name: str) -> str:
    if not items:
        return "Simple outfit that gets the job done."
    return " ".join(items[:3]) + " — each piece earns its place."


def _humanize_tweak(tweak: str, items: List[str]) -> str:
    if tweak and tweak != "None":
        return tweak
    return "Try a simple necklace or a structured jacket — either would take this up a notch."


def map_analysis(result: Dict[str, Any]) -> Dict[str, Any]:
    """Map MiMo vision response to frontend-facing format with clean defaults."""
    _log.info("[MAP] Processing result from source=%s", result.get("source", "unknown"))

    # Build items list from AI-detected garments
    items_detected = []
    for key in ["top_type", "bottom_type", "footwear", "accessories"]:
        val = result.get(key, "")
        if val and val != "None" and val.lower() != "none":
            items_detected.append(val)

    # Extract colors from AI item descriptions
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
    detected_items = [
        result.get(k, "") for k in ["top_type", "bottom_type", "footwear", "accessories"]
        if result.get(k, "") and result.get(k, "") != "None"
    ]
    strengths = _humanize_strengths(detected_items or items_detected)

    # Normalize score and name
    score = result.get("style_score")
    if score is None or not isinstance(score, (int, float)):
        score = 78
    elif score < 20:
        score = 20
    elif score > 99:
        score = 99
    name = result.get("style_name", "") or "Modern Classic"

    # Generate tweak image URL
    tweak_text = _humanize_tweak(result.get("tweak_plan", ""), detected_items or items_detected)
    _outfit_items = ", ".join(items_detected) if items_detected else ""
    _tweak_prompt = generate_tweak_visualization_prompt(_outfit_items, tweak_text)
    _safe_tweak = urllib.parse.quote(_tweak_prompt)
    _tweak_seed = int(time.time() * 1000) % 10000
    tweak_image_url = f"https://image.pollinations.ai/prompt/{_safe_tweak}?nologin=true&seed={_tweak_seed}"

    # Parse honest improvements
    improvements = []
    raw_imps = result.get("improvements", [])
    if isinstance(raw_imps, list):
        for imp in raw_imps:
            if isinstance(imp, dict):
                improvements.append({
                    "issue": imp.get("issue", ""),
                    "suggestion": imp.get("suggestion", ""),
                    "priority": imp.get("priority", "medium"),
                })
    if not improvements:
        tweak_txt = result.get("tweak_plan", "")
        if tweak_txt:
            improvements.append({"issue": tweak_txt, "suggestion": "", "priority": "medium"})

    return {
        "success": True,
        "source": result.get("source", "unknown"),
        "ai_source_label": "MiMo Vision 2.5",
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
        "improvements": improvements,
        "audit": _humanize_audit(detected_items or items_detected, name),
        "tweak_plan": tweak_text,
        "tweak_image_url": tweak_image_url,
        "generation_prompt": result.get("generation_prompt", name + " outfit with " + ", ".join(actual_colors) + " tones."),
    }
