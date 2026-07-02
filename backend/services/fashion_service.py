"""Fashion analysis business logic — get_fashion_decision, map_analysis, humanizers."""

import json
import logging
import random
import time
import urllib.parse
from typing import Any, Dict, List, Optional
import re

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


def generate_tweak_visualization_prompt(accessory: str, tweak_text: str = "") -> str:
    """Build a Pollinations prompt to visualize the tweak recommendation.
    
    For clothing items (blazer, jacket, coat, etc.), generates a fashion
    photo prompt with a person wearing the item. For small accessories
    (earrings, necklace, etc.), uses product photography style.
    """
    clean_acc = accessory.lower().replace("a ", "").strip()
    if not clean_acc:
        return ""

    # Determine if this is a clothing item (needs a person) or small accessory (product photo)
    clothing_items = ["jacket", "blazer", "cardigan", "coat", "shirt", "top", "blouse",
                      "pants", "jeans", "trousers", "skirt", "dress", "shoes", "boots",
                      "sneakers", "heels", "loafers", "sandals", "scarf", "hat", "bag",
                      "handbag", "clutch", "sunglasses"]
    
    color_word = "polished sterling silver"
    if "gold" in clean_acc:
        color_word = "polished 18k gold"

    if clean_acc in clothing_items:
        # Use the full tweak text as the prompt description
        description = tweak_text if tweak_text else f"A person wearing a {clean_acc}"
        return (
            f"Fashion photograph of {description}, "
            f"model wearing the suggested item, full body shot, "
            f"studio lighting, clean white background, fashion editorial style, "
            f"high-end lookbook aesthetic, sharp focus, natural pose, "
            f"photorealistic, 4K resolution."
        )
    elif "earring" in clean_acc:
        return (
            f"Extreme close-up macro photography of {color_word} drop earrings "
            f"worn on a person's ear. Extremely detailed visible skin texture with "
            f"natural pores and fine hair, warm golden-hour soft studio lighting, "
            f"dramatic but elegant shadows. Shallow depth of field, soft warm-toned "
            f"blur background (bokeh), editorial fashion jewelry photography, "
            f"shot on 100mm macro lens, 8K photorealistic, cinematic lighting, "
            f"hyper-detailed, commercial jewelry ad aesthetic. "
            f"--no low resolution --no blurry --no plastic --no flat lighting "
            f"--no white background --no marble background"
        )
    elif "necklace" in clean_acc or "pendant" in clean_acc:
        return (
            f"Extreme close-up macro photography of a {color_word} pendant necklace "
            f"worn on a person's neck and collarbone. Extremely detailed visible skin "
            f"texture with natural pores, warm golden-hour soft studio lighting, "
            f"the pendant resting delicately on the skin. Shallow depth of field, "
            f"soft warm-toned blur background (bokeh), editorial fashion jewelry "
            f"photography, shot on 100mm macro lens, 8K photorealistic, cinematic "
            f"lighting, hyper-detailed, commercial jewelry ad aesthetic. "
            f"--no low resolution --no blurry --no plastic --no flat lighting "
            f"--no white background --no marble background"
        )
    elif "ring" in clean_acc:
        return (
            f"Extreme close-up macro photography of an elegant {color_word} ring "
            f"worn on a person's finger. Extremely detailed visible skin texture with "
            f"natural pores and fine hair, warm golden-hour soft studio lighting, "
            f"the ring catching the light beautifully. Shallow depth of field, "
            f"soft warm-toned blur background (bokeh), editorial fashion jewelry "
            f"photography, shot on 100mm macro lens, 8K photorealistic, cinematic "
            f"lighting, hyper-detailed, commercial jewelry ad aesthetic. "
            f"--no low resolution --no blurry --no plastic --no flat lighting "
            f"--no white background --no marble background"
        )
    elif "bracelet" in clean_acc:
        return (
            f"Extreme close-up macro photography of a sleek {color_word} bracelet "
            f"worn on a person's wrist. Extremely detailed visible skin texture with "
            f"natural pores and fine hair, warm golden-hour soft studio lighting, "
            f"the bracelet resting elegantly on the skin. Shallow depth of field, "
            f"soft warm-toned blur background (bokeh), editorial fashion jewelry "
            f"photography, shot on 100mm macro lens, 8K photorealistic, cinematic "
            f"lighting, hyper-detailed, commercial jewelry ad aesthetic. "
            f"--no low resolution --no blurry --no plastic --no flat lighting "
            f"--no white background --no marble background"
        )
    elif "watch" in clean_acc:
        item_desc = f"a refined {color_word} wristwatch"
    elif "belt" in clean_acc:
        item_desc = f"a premium {color_word} belt"
    else:
        # Fallback: use the tweak description if available
        if tweak_text:
            return (
                f"Fashion photograph of {tweak_text}, "
                f"model wearing the suggested item, studio lighting, "
                f"clean white background, fashion editorial style, "
                f"photorealistic, 4K resolution."
            )
        item_desc = f"a luxurious {color_word} accessory"

    return (
        f"Ultra-high-end commercial product photograph of {item_desc}, "
        f"resting diagonally on a deep black marble surface with sharp white veining. "
        f"The {color_word} surface reflects the crisp studio lighting perfectly, "
        f"showing highly realistic metallic reflections and high gloss. "
        f"Shot with a 50mm lens at f/2.8, ultra-sharp focus on the object, "
        f"creamy bokeh background, cinematic depth of field. "
        f"Photorealistic, 8K resolution, glossy magazine ad aesthetic, "
        f"isolated single object, matte soft shadows, subtle lens flare. "
        f"--no text --no watermarks --no logos --no distorted features"
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
    _tweak_accessory = tweak_text
    import re
    for _kw in ["necklace", "earring", "bracelet", "watch", "ring", "belt",
                "scarf", "jacket", "blazer", "cardigan", "coat", "handbag",
                "clutch", "sunglasses", "hat", "bag", "shoes", "boots"]:
        if re.search(r'\b' + _kw + r'\b', tweak_text.lower()):
            _tweak_accessory = _kw
            break
    _tweak_prompt = generate_tweak_visualization_prompt(_tweak_accessory, tweak_text)
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
