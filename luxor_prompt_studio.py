#!/usr/bin/env python3
"""LUXOR PROMPT STUDIO — Hyperrealistic fashion prompt generator.
Creates Midjourney-ready prompts based on the PDF knowledge base.
Usage:
    python3 luxor_prompt_studio.py "AI fashion stylist in minimalist studio"
    python3 luxor_prompt_studio.py --list-themes
"""
import sys, json, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from api_interact import chat

PROMPT_TEMPLATE = """You are LUXOR PROMPT STUDIO — world-class hyperrealistic fashion prompt writer for Luxor (luxor.ly, AI fashion styling).

STRUCTURE (always use ALL 7 sections):
SUBJECT: Detailed model description, clothing (Luxor brand aesthetic: structured-meets-fluid, smart casual luxe), pose, expression, visible natural skin texture with pores, micro-details
MEDIUM: Hyperrealistic photo, 8K ultra-realism, high-fidelity material rendering, crisp optical clarity, premium editorial finish
ENVIRONMENT: Where the scene occurs (minimalist, architectural, or urban setting)
LIGHTING: Precise lighting (soft diffused, directional, volumetric micro-shadowing, realistic light scattering)
COLOR: Palette (Luxor palette: deep monochrome with warm neutral accents, true-to-life color calibration)
MOOD: Emotional tone (confident, intelligent, refined, futuristic yet approachable)
COMPOSITION: Camera specs (85mm lens, full-frame sensor, shallow depth of field, specific framing)

RULES:
- Natural skin: visible pores, realistic micro-texture, slight imperfections, matte finish
- NEVER use: glowing skin, porcelain, airbrushed, CGI-like, perfect skin, flawless
- Sophisticated language: volumetric micro-shadowing, realistic light scattering, true-to-life color calibration
- Avoid celebrity names and trademarked brands
- Add Midjourney parameters: --ar 3:4 --style raw --q 2 --s 50

Generate 1 complete hyperrealistic fashion prompt for this theme: {theme}
Return ONLY the prompt with all 7 sections, no explanations."""

THEMES = [
    "AI fashion stylist app on smartphone in minimalist luxury studio",
    "Digital wardrobe curation — holographic interface with physical garment",
    "Weather-adaptive outfit — AI-matched layers in architectural interior",
    "Luxor capsule collection — three coordinated looks on concrete podium",
    "Virtual try-on — model interacting with digital fashion overlay",
]

def generate_prompt(theme):
    """Generate a single hyperrealistic prompt."""
    prompt = PROMPT_TEMPLATE.format(theme=theme)
    response = chat(prompt, mode="fable5")
    text = response['choices'][0]['message']['content']
    return text

if __name__ == "__main__":
    if "--list-themes" in sys.argv:
        for i, t in enumerate(THEMES):
            print(f"[{i}] {t}")
        sys.exit(0)
    
    theme = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else THEMES[0]
    print(generate_prompt(theme))
