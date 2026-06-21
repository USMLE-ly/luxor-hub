#!/usr/bin/env python3
"""
Luxor Humanizer v1.0 — Remove AI writing patterns from analysis text.
Based on the humanizer skill (Wikipedia:Signs of AI writing).
Makes Luxor analysis sound natural, opinionated, and human.
"""

import re
import random

VARIETY_THRESHOLD = 0.6


# ─── Helper: safe wrapper for regex patterns with apostrophes ──────────
def _rx(pattern):
    """Raw regex that handles apostrophes safely."""
    return pattern


# ─── Pattern definitions ───────────────────────────────────────────────
# Each is a list of (regex, replacement) tuples

SIGNIFICANCE_PATTERNS = [
    (r"\bcharacterized\s+by\b", "built around"),
    (r"\bknown\s+for\s+its\b", ""),
    (r"\bis\s+renowned\s+for\b", "is known for"),
    (r"\ba\s+wide\s+variety\s+of\b", "many"),
    (r"\ba\s+wide\s+range\s+of\b", "many"),
    (r"\bwhen\s+it\s+comes\s+to\b", "for"),
    (r"\bin\s+terms\s+of\b", "for"),
    (r"\bit\s+is\s+essential\s+to\b", "you should"),
    (r"\bneedless\s+to\s+say\b", ""),
    (r"\bof\s+course\b", ""),
    (r"\bin\s+order\s+to\b", "to"),

    (r"\bstands?\s+as\s+a\b", "is a"),
    (r"\bserves?\s+as\s+a\b", "acts as"),
    (r"\ba\s+(vital|significant|crucial|pivotal|key)\s+(role|moment|factor)\b", "an important part"),
    (r"\b(underscores|highlights?)\s+its\s+(importance|significance)\b", "shows how"),
    (r"\breflects?\s+broader\b", "relates to wider"),
    (r"\bsymbolizing\s+its\s+(ongoing|enduring|lasting)\b", "pointing to its ongoing"),
    (r"\bmarking\s+(a|the)\s+shift\b", "shifting"),
    (r"\b(represents|marks?)\s+a\s+(pivot|turning)\s+point\b", "was a shift"),
    (r"\bevolving\s+landscape\b", "changes"),
    (r"\bindelible\s+mark\b", "lasting effect"),
    (r"\bsetting\s+the\s+stage\b", "paved the way"),
    (r"\ba\s+testament\s+to\b", "shows"),
    (r"\bdeeply\s+rooted\b", "grounded"),
]

PROMOTIONAL_PATTERNS = [
    (r"\bunlock(?:ing)?\s+(?:creativity|potential|new)\b", "enable"),
    (r"\bempower(?:ing)?\s+(?:users?|teams?|developers?|creators?)\b", "help"),
    (r"\brevolutioniz(?:e|ing)\b", "change"),
    (r"\bgame[- ]changer\b", "big step forward"),
    (r"\bcutting[- ]edge\b", "modern"),
    (r"\bgroundbreaking\b", "notable"),
    (r"\bseamless(?:ly)?\b", "smooth"),
    (r"\bworld[- ]class\b", "top-quality"),
    (r"\bbest[- ]in[- ]class\b", "strong"),
    (r"\bstate[- ]of[- ]the[- ]art\b", "current-generation"),
    (r"\bleveraging\b", "using"),
    (r"\bholistic\b", "complete"),
    (r"\bdelight(?:ful)?\b", "nice"),
    (r"\brobust\b", "solid"),
]

AI_VOCAB_REPLACEMENTS = {
    "delve": "explore",
    "delve into": "look at",
    "navigate": "handle",
    "navigate the": "handle the",
    "tapestry": "mix",
    "intricate": "detailed",
    "multifaceted": "varied",
    "bespoke": "custom",
    "paradigm": "model",
    "synergy": "collaboration",
    "leverage": "use",
    "holistic": "full",
    "robust": "solid",
    "scalable": "growable",
    "actionable": "useful",
    "ecosystem": "system",
}

VAGUE_ATTRIBUTIONS = [
    (r"\bIt\s+is\s+widely\s+believed\b", "Many people think"),
    (r"\bSome\s+(say|argue|claim|believe)\b", "Some think"),
    (r"\bIt\s+is\s+often\s+said\b", "People often say"),
    (r"\bIt\s+has\s+been\s+observed\b", "People have noticed"),
    (r"\bIt\s+could\s+be\s+argued\b", "You could argue"),
    (r"\bIt\s+is\s+worth\s+noting\b", "Notably"),
    (r"\bit\s+is\s+important\s+to\s+note\b", ""),
    (r"\bnotably\b", ""),
    (r"\bimportantly\b", ""),
]

AUTHORITY_TROPES = [
    (r"\bThe\s+real\s+question\s+is\b", "The question is"),
    (r"\bAt\s+its\s+core\b", ""),
    (r"\bin\s+reality\b", ""),
    (r"\bWhat\s+really\s+matters\b", "What matters"),
    (r"\bfundamentally\b", ""),
    (r"\bThe\s+deeper\s+(issue|question)\b", "The real issue"),
    (r"\bThe\s+heart\s+of\s+the\s+matter\b", "The point"),
]

SIGNPOSTING = [
    (r"\bLet's?\s+(?:dive\s+in|explore|break\s+this\s+down|take\s+a\s+look)\b", ""),
    (r"\bHere's?\s+what\s+you\s+need\s+to\s+know\b", ""),
    (r"\bWithout\s+further\s+ado\b", ""),
    (r"\bNow\s+let's?\s+look\s+at\b", ""),
]

RHETORICAL_OPENERS = [
    (r"\bHonestly\??\s*,?\s*", ""),
    (r"\bLook\s*,?\s*", ""),
    (r"\bHere's?\s+the\s+thing\s*,?\s*", ""),
    (r"\bThe\s+thing\s+is\s*,?\s*", ""),
    (r"\bLet's?\s+be\s+honest\s*,?\s*", ""),
    (r"\bReal\s+talk\s*,?\s*", ""),
]

# ─── Core Functions ────────────────────────────────────────────────────

def apply_patterns(text, patterns):
    """Apply a list of (regex, replacement) patterns."""
    for pattern, replacement in patterns:
        text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
    return text


def strip_ai_vocab(text):
    """Replace known AI buzzwords with simpler alternatives."""
    for word, replacement in AI_VOCAB_REPLACEMENTS.items():
        text = re.sub(r"\b" + re.escape(word) + r"\b", replacement, text, flags=re.IGNORECASE)
    return text


def add_personality(text, style_context="analysis"):
    """Add natural voice — opinions, varied rhythm, personality."""
    if style_context in ("technical", "data"):
        return text

    sentences = re.split(r"(?<=[.!?])\s+", text)
    if len(sentences) < 3:
        return text

    starters = [
        "Honestly,", "Look,", "The thing is,", "Here is the thing:",
        "", "", "", "", "", "",
    ]
    for i in range(1, len(sentences) - 1, 2):
        if i < len(sentences) and sentences[i] and not sentences[i][0] in "\"'([":
            starter = random.choice(starters)
            if starter:
                sentences[i] = starter + " " + sentences[i][0].lower() + sentences[i][1:]

    # Break up long sentences
    for i in range(len(sentences)):
        words = sentences[i].split()
        if len(words) > 20 and random.random() < 0.3:
            mid = len(sentences[i]) // 2
            split_point = sentences[i].rfind(" ", 0, mid)
            if split_point > 10:
                after = sentences[i][split_point + 1:]
                sentences[i] = sentences[i][:split_point] + ". " + after[0].upper() + after[1:]

    return " ".join(sentences)


def humanize(text, style_context="analysis"):
    """
    Main entry point: strip AI patterns, humanize text.
    
    Args:
        text: AI-generated text to humanize
        style_context: 'analysis', 'vice', 'description', 'technical', 'data'
        
    Returns:
        Humanized text
    """
    if not text or len(text) < 20:
        return text

    original = text

    text = apply_patterns(text, SIGNIFICANCE_PATTERNS)
    text = apply_patterns(text, PROMOTIONAL_PATTERNS)
    text = strip_ai_vocab(text)
    text = apply_patterns(text, VAGUE_ATTRIBUTIONS)
    text = apply_patterns(text, AUTHORITY_TROPES)
    text = apply_patterns(text, SIGNPOSTING)
    text = apply_patterns(text, RHETORICAL_OPENERS)

    # Clean up
    text = re.sub(r"  +", " ", text)
    text = re.sub(r"\.\s+\.", ".", text)
    text = re.sub(r"\s+,", ",", text)

    if style_context in ("analysis", "description", "vice"):
        text = add_personality(text, style_context)

    text = text.strip()
    if text.endswith(","):
        text = text[:-1]
    if text and not text[-1] in ".!?":
        text += "."

    if len(text) < len(original) * 0.3:
        return original

    return text


def humanize_analysis(analysis_result):
    """
    Humanize all text fields in an analysis result dict.
    Returns the modified dict.
    """
    if not isinstance(analysis_result, dict):
        return analysis_result

    # Direct text fields
    field_map = {
        "styleDescription": "description",
        "styleVibe": "vice",
        "bodyTypeNotes": "analysis",
        "description": "description",
        "reasoning": "vice",
    }
    for field, context in field_map.items():
        if field in analysis_result and isinstance(analysis_result[field], str):
            analysis_result[field] = humanize(analysis_result[field], context)

    # List of strings
    list_fields = {
        "strengths": "analysis",
        "signals": "vice",
        "designNotes": "analysis",
    }
    for field, context in list_fields.items():
        if field in analysis_result and isinstance(analysis_result[field], list):
            analysis_result[field] = [
                humanize(s, context) if isinstance(s, str) else s
                for s in analysis_result[field] if s
            ]

    # Dict lists
    if "improvements" in analysis_result and isinstance(analysis_result["improvements"], list):
        for imp in analysis_result["improvements"]:
            if isinstance(imp, dict):
                for key in ("suggestion", "reason"):
                    if key in imp and isinstance(imp[key], str):
                        imp[key] = humanize(imp[key], "analysis")

    if "bodyShapeRecommendations" in analysis_result:
        for rec in analysis_result["bodyShapeRecommendations"]:
            if isinstance(rec, dict):
                for key in ("description", "recommendation"):
                    if key in rec and isinstance(rec[key], str):
                        rec[key] = humanize(rec[key], "analysis")

    if "editRecommendations" in analysis_result:
        for rec in analysis_result["editRecommendations"]:
            if isinstance(rec, dict):
                for key in ("edit", "effect"):
                    if key in rec and isinstance(rec[key], str):
                        rec[key] = humanize(rec[key], "analysis")

    # Pipeline-specific lists
    for field in ("try_this", "avoid_that", "complete_the_look", "recommendation"):
        if field in analysis_result and isinstance(analysis_result[field], str):
            analysis_result[field] = humanize(analysis_result[field], "analysis")
        elif field in analysis_result and isinstance(analysis_result[field], list):
            analysis_result[field] = [
                humanize(t, "analysis") if isinstance(t, str) else t
                for t in analysis_result[field]
            ]

    return analysis_result


# ─── Self-Test ─────────────────────────────────────────────────────────

def self_test():
    test_cases = [
        ("This look stands as a testament to minimalist design principles.", "analysis"),
        ("The ensemble serves as a vital key to understanding transitional fashion.", "analysis"),
        ("Unlock your creativity with this groundbreaking, cutting-edge outfit.", "analysis"),
        ("Leveraging holistic synergy to deliver robust, scalable style.", "analysis"),
        ("It is widely believed that monochrome dressing reflects broader cultural shifts.", "analysis"),
        ("What really matters, at its core, is fundamentally the deeper question of silhouette.", "analysis"),
        ("The real question is whether this works. Let's dive in and explore.", "analysis"),
        ("VICE-style critique: This is a DO. Score: 65/100. Tonal control and confidence.", "vice"),
    ]

    print("Humanizer Self-Test")
    print("=" * 60)
    all_ok = True
    for text, context in test_cases:
        result = humanize(text, context)
        if result == text:
            all_ok = False
            print(f"  ⚠ NO CHANGE: {text[:60]}")
        else:
            print(f"  ✓ {text[:50]}...")
            print(f"    → {result[:70]}...")
    print("=" * 60)
    if all_ok:
        print("All patterns triggered correctly!")
    else:
        print("Some patterns may need attention.")


if __name__ == "__main__":
    self_test()
