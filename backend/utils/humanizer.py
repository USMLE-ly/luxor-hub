"""Humanizer — removes signs of AI-generated writing from text.
Based on Wikipedia's "Signs of AI writing" guide (33 patterns).
Detects and fixes: inflated significance, promotional language,
superficial -ing analyses, AI vocabulary, copula avoidance,
negative parallelisms, em dash overuse, passive voice, etc.
"""

import re
from typing import List

# AI vocabulary replacement patterns: (regex, replacement)
_AI_PATTERNS: List[tuple] = [
    # Significance inflation
    (r'\b(pivotal|serves as a testament|a testament to|marks a|sets the stage)\b', 'important'),
    (r'\b(stands as|serves as)\b', 'is'),
    (r'\b(underscores|highlights the importance|reflects broader|evolving landscape)\b', 'shows'),
    (r'\b(indelible mark|deeply rooted|focal point|key turning point)\b', 'important'),
    (r'\b(symbolizing|signifying|embodying|exemplifying)\b', 'showing'),

    # Promotional language
    (r'\b(nestled|boasts a|breathtaking|must-visit|stunning|renowned)\b', ''),
    (r'\bin the heart of\b', 'in'),
    (r'\b(groundbreaking|commitment to excellence)\b', 'notable'),

    # AI vocabulary
    (r'\b(additionally|furthermore|moreover)\b', 'also'),
    (r'\b(delve|delving)\b', 'explore'),
    
    (r'\b(showcase|showcases)\b', 'shows'),
    (r'\b(showcasing)\b', 'showing'),
    (r'\b(testament|underscore|underscores)\b', ''),
    (r'\b(fostering|cultivating)\b', 'building'),
    (r'\b(enduring|timeless appeal|lasting style)\b', 'lasting'),
    (r'\b(ensures)\b', 'makes sure'),
    (r'\b(garner|garnered)\b', 'gained'),
    (r'\b(contemporary|cohesive|harmonious)\b', 'modern'),
    (r'\b(exceptional|optimal)\b', 'smart'),

    # Copula avoidance
    (r'\bserves as\b', 'is'),
    (r'\bstands as\b', 'is'),
    (r'\bboasts\b', 'has'),
    (r'\bfeatures?\b', 'has'),

    # Superficial -ing endings
    (r'\b(highlighting|underscoring|emphasizing|symbolizing|reflecting|showcasing|exemplifying)\s+(the|a|its)\b', r'which shows \2'),
    (r'\b(ensuring|fostering|cultivating|contributing to)\b', 'to'),

    # Vague attributions
    (r'\b(experts believe|some critics argue|industry reports|observers have cited)\b', ''),

    # Filler phrases
    (r'\bin order to\b', 'to'),
    (r'\bdue to the fact that\b', 'because'),
    (r'\bas well as\b', 'and'),
    (r'\bin terms of\b', 'for'),
    (r'\bon a daily basis\b', 'everyday'),
    (r'\bwhen it comes to\b', 'for'),
    (r'\bthe use of\b', 'using'),
    (r'\bis designed to\b', ''),

    # Robotic fashion boilerplate
    (r'\bselected by trend algorithm\b', ''),
    (r'\bselected to match your personal aesthetic\b', ''),
    (r'\bcomplementary colors chosen from your wardrobe\b', ''),
    (r'\bseasonal relevance considered\b', ''),
    (r'\bpersonal aesthetic\b', 'style'),
    (r'\bwardrobe versatility\b', 'wearability'),
    (r'\bfashion-forward\b', 'stylish'),
    (r'\binvestment piece\b', 'staple'),
    (r'\bthe overall\b', 'the'),
    (r'\byour overall\b', 'your'),
]


def humanize_text(text: str) -> str:
    """Humanize a single string by removing AI writing patterns.
    Preserves meaning while making text sound more natural.
    """
    if not text:
        return text

    result = text

    # Apply all vocabulary replacements
    for pattern, replacement in _AI_PATTERNS:
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)

    # Remove em dashes with spaces (pattern #14)
    result = re.sub(r'\s*—\s*', ', ', result)
    result = re.sub(r'\s*–\s*', ', ', result)

    # Fix double spaces from removals
    result = re.sub(r'\s{2,}', ' ', result)

    # Remove trailing commas
    result = re.sub(r',+\s*$', '', result)

    # Remove leading commas
    result = re.sub(r'^,+\s*', '', result)

    # Strip whitespace
    result = result.strip()

    # Capitalize first letter
    if result:
        result = result[0].upper() + result[1:]

    # Ensure it ends with a period
    if result and not result.endswith('.') and not result.endswith('!') and not result.endswith('?'):
        result += '.'

    return result.strip()


def humanize_text_array(texts: List[str]) -> List[str]:
    """Humanize an array of strings (strengths, improvements, reasons, etc.)"""
    return [humanize_text(t) for t in texts]


def humanize_with_term_protection(text: str, protected_terms: List[str] = None) -> str:
    """Humanize text while optionally protecting specific terms from replacement."""
    if not text:
        return text

    # If protected terms provided, use placeholders
    if protected_terms:
        placeholders = {}
        for i, term in enumerate(protected_terms):
            placeholder = f"__PROTECTED_{i}__"
            placeholders[placeholder] = term
            text = text.replace(term, placeholder)

        result = humanize_text(text)

        # Restore protected terms
        for placeholder, term in placeholders.items():
            result = result.replace(placeholder, term)

        return result

    return humanize_text(text)
