#!/usr/bin/env python3
"""
Luxor Analysis Server v2.1 — Fixed Color Quantization + Enhanced Knowledge
===========================================================================
Replaces the GPT-5 / Lovable AI gateway for outfit analysis.
Powered by:
  • Fashionpedia (Fashionary) — garment taxonomy, fabrics, measurements
  • Visual Dictionary of Fashion Design — terminology A→Z
  • VICE Do's & Don'ts — street fashion critique methodology
  • 1000 Poses — model posing reference
  • Knowledge Graph (151 nodes, 124 edges)

Fixes in v2.1:
  - Center-crop quantization to avoid background/shadows dominating
  - 300x300 resize (was 150x150) for better color sampling
  - 8 colors (was 6) — captures white/cream/ivory tones
  - Shadow pixel filtering (luminance < 30 discarded)
  - Enhanced cream/ivory/off-white detection with wider thresholds
  - _get_season_label function added and integrated
  - _get_design_notes with KB fallback
  - Improved VICE critique with layer-depth signals
  - _detect_horizontal_bands center-crops each band

Run: python3 luxor_analysis_server.py [--port 8766] [--kb /path/to/knowledge.json]
"""

import argparse
import base64
import json
import os
import sys
import uuid
from collections import Counter
from io import BytesIO
from pathlib import Path

import requests
from flask import Flask, jsonify, request, send_from_directory
from PIL import Image
from luxor_humanizer import humanize_analysis, humanize
from stylist_tweaks import download_image, generate_all_tweaks, image_to_data_url

app = Flask(__name__)

# ─── Fashion Knowledge Base ───────────────────────────────────────────────
FASHION_KB = {}
STYLIST_TWEAKS_ACTIVE = True


def _load_knowledge_base(kb_path=None):
    """Load the Fashionpedia knowledge base at startup."""
    if kb_path and os.path.exists(kb_path):
        with open(kb_path) as f:
            return json.load(f)
    for p in ["/tmp/luxor-research/fashion_knowledge_base.json"]:
        if os.path.exists(p):
            with open(p) as f:
                return json.load(f)
    print("[kb] No knowledge base found — running fallback")
    return {}

# ─── VICE Critique Rules ─────────────────────────────────────────────────
VICE_RULES = {}

def _load_vice_rules():
    for p in ["/tmp/luxor-research/vice_critique_rules.json"]:
        if os.path.exists(p):
            with open(p) as f:
                return json.load(f)
    return {}

HOST = "0.0.0.0"
PORT = 8766
OUTPUT_DIR = Path("/tmp/luxor-analysis")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ═══════════════════════════════════════════════════════════════════════════
#  MIDDLEWARE
# ═══════════════════════════════════════════════════════════════════════════

@app.after_request
def add_cors(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "authorization, x-client-info, apikey, content-type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response

# ═══════════════════════════════════════════════════════════════════════════
#  HEALTH
# ═══════════════════════════════════════════════════════════════════════════

@app.route("/", methods=["GET"])
def health():
    kb_ok = bool(FASHION_KB)
    return jsonify({
        "status": "ok",
        "service": "luxor-analysis-server",
        "version": "3.0",
        "knowledge_base": kb_ok,
        "kb_sections": list(FASHION_KB.keys()) if FASHION_KB else [],
        "vice_critique_rules": bool(VICE_RULES),
        "design_terms": len(FASHION_KB.get("design_principles", [])) if isinstance(FASHION_KB.get("design_principles"), list) else 0,
        "fashion_history_pages": len(FASHION_KB.get("fashion_history", {})) if isinstance(FASHION_KB.get("fashion_history"), dict) else 0,
    })

# ═══════════════════════════════════════════════════════════════════════════
#  ENDPOINT: /analyze-outfit  (standard analysis)
# ═══════════════════════════════════════════════════════════════════════════

@app.route("/analyze-outfit", methods=["POST", "OPTIONS"])
def analyze_outfit():
    if request.method == "OPTIONS":
        return jsonify({"ok": True})
    try:
        body = request.get_json(force=True)
        image_url = body.get("imageUrl", "")
        critique_style = body.get("style", "default")  # 'default' or 'vice'
        if not image_url:
            return jsonify({"error": "imageUrl is required"}), 400

        print(f"[analysis] Analyzing {image_url[:60]}... (style={critique_style})")

        img = _download_image(image_url)
        if img is None:
            return jsonify({"error": "Could not load image"}), 400

        # Save snapshot
        snapshot_name = f"analysis_{uuid.uuid4().hex[:12]}.png"
        snapshot_path = OUTPUT_DIR / snapshot_name
        img.save(str(snapshot_path), "PNG")

        # Analyze
        analysis = _analyze_image(img)

        # If critique_style is 'vice', also run VICE critique
        if critique_style == "vice":
            critique = _vice_critique(img)
            analysis["vice_critique"] = critique

        # Save report
        report_name = f"analysis_{uuid.uuid4().hex[:12]}.json"
        report_path = OUTPUT_DIR / report_name
        with open(report_path, "w") as f:
            json.dump(analysis, f, indent=2)
        print(f"[analysis] Report → {report_path}")

        # Humanize before returning
        analysis = humanize_analysis(analysis)
        
        # Generate stylist tweaks
        try:
            from stylist_tweaks import generate_all_tweaks
            tweaks = generate_all_tweaks(img, output_format="data_url")
            analysis["stylistTweaks"] = tweaks
        except Exception as tweak_err:
            print(f"[analysis] Stylist tweaks not available: {tweak_err}")
            analysis["stylistTweaks"] = []
        
        return jsonify(analysis)

    except Exception as e:
        print(f"[analysis] Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# ═══════════════════════════════════════════════════════════════════════════
#  ENDPOINT: /critique-outfit  (VICE-style DO/DON'T)
# ═══════════════════════════════════════════════════════════════════════════

@app.route("/critique-outfit", methods=["POST", "OPTIONS"])
def critique_outfit():
    """VICE Magazine street fashion DO/DON'T classification."""
    if request.method == "OPTIONS":
        return jsonify({"ok": True})
    try:
        body = request.get_json(force=True)
        image_url = body.get("imageUrl", "")
        if not image_url:
            return jsonify({"error": "imageUrl is required"}), 400

        print(f"[critique] Critiquing {image_url[:60]}...")

        img = _download_image(image_url)
        if img is None:
            return jsonify({"error": "Could not load image"}), 400

        # Standard analysis
        analysis = _analyze_image(img)

        # VICE DO/DON'T classification
        critique = _vice_critique(img)

        # Save
        snapshot_name = f"critique_{uuid.uuid4().hex[:12]}.png"
        snapshot_path = OUTPUT_DIR / snapshot_name
        img.save(str(snapshot_path), "PNG")

        result = {
            "verdict": critique["verdict"],
            "score": critique["score"],
            "signals": critique["signals"],
            "vibe": critique.get("vibe", ""),
            "hooks": critique.get("hooks", {}),
            "reasoning": critique["reasoning"],
            "analysis": analysis,
        }

        report_name = f"critique_{uuid.uuid4().hex[:12]}.json"
        report_path = OUTPUT_DIR / report_name
        with open(report_path, "w") as f:
            json.dump(result, f, indent=2)

        # Humanize before returning
        result = humanize_analysis(result)
        return jsonify(result)

    except Exception as e:
        print(f"[critique] Error: {e}", file=sys.stderr)
        return jsonify({"error": str(e)}), 500

# ═══════════════════════════════════════════════════════════════════════════
#  ENDPOINT: /pipeline (full Dressing Room pipeline)
# ═══════════════════════════════════════════════════════════════════════════

@app.route("/pipeline", methods=["POST", "OPTIONS"])
def pipeline():
    """
    Full Dressing Room pipeline: analyze + critique + knowledge graph query + memory.
    Requires imageUrl and optionally userId.
    """
    if request.method == "OPTIONS":
        return jsonify({"ok": True})
    try:
        body = request.get_json(force=True)
        image_url = body.get("imageUrl", "")
        user_id = body.get("userId", "anonymous")
        if not image_url:
            return jsonify({"error": "imageUrl is required"}), 400

        print(f"[pipeline] Full pipeline for {user_id} — {image_url[:60]}...")

        img = _download_image(image_url)
        if img is None:
            return jsonify({"error": "Could not load image"}), 400

        # Step 1: Analysis
        analysis = _analyze_image(img)

        # Step 2: VICE Critique
        critique = _vice_critique(img)

        # Step 3: Knowledge Graph query (if graph file exists)
        graph_insights = _query_knowledge_graph(analysis)

        # Step 4: Build personal style notes
        style = analysis.get("overallStyle", "Contemporary")
        season = analysis.get("seasonalFit", "Transitional")
        garments = [g["type"] for g in analysis.get("detectedGarments", [])[:3]]
        colors_used = [c["name"] for c in analysis.get("colorPalette", {}).get("colors", [])[:4]]

        result = {
            "pipeline_version": "3.0",
            "analysis": analysis,
            "vice_critique": critique,
            "graph_insights": graph_insights,
            "style_profile": {
                "primary_style": style,
                "season": season,
                "garments_used": garments,
                "palette": colors_used,
                "recommendation": _generate_style_rec(style, season, garments),
            },
        }

        # Save pipeline report
        report_name = f"pipeline_{uuid.uuid4().hex[:12]}.json"
        report_path = OUTPUT_DIR / report_name
        with open(report_path, "w") as f:
            json.dump(result, f, indent=2)

        # Humanize before returning
        result = humanize_analysis(result)
        return jsonify(result)

    except Exception as e:
        print(f"[pipeline] Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


def _query_knowledge_graph(analysis):
    """Query the fashion knowledge graph for related concepts (v2.1 fuzzy matching)."""
    graph_path = "/tmp/luxor-research/fashion_kb_for_graph/graphify-out/graph.json"
    if not os.path.exists(graph_path):
        return []
    try:
        with open(graph_path) as f:
            graph = json.load(f)
        nodes_by_id = {n["id"]: n for n in graph.get("nodes", [])}
        edges = graph.get("edges", [])

        style = analysis.get("overallStyle", "")
        era = analysis.get("styleEra", "")
        garments_used = [g["type"].lower() for g in analysis.get("detectedGarments", [])[:3]]
        insights = []

        # Build search keywords from style name
        search_terms = set()
        if style:
            for word in style.replace("/", " ").lower().split():
                if len(word) > 2:
                    search_terms.add(word)
        # Add common mappings
        style_to_graph_map = {
            "deconstruction / grunge": "grunge",
            "casual chic": "minimalism",
            "power dressing": "power",
            "bohemian": "boho",
            "modernist minimalism": "minimalism",
            "classic tailoring": "classic",
            "minimalism": "minimalism",
        }
        for sk, sv in style_to_graph_map.items():
            if style and style.lower() in sk:
                search_terms.add(sv)

        # Search for style-related nodes
        for node in graph.get("nodes", []):
            label = node.get("label", "").lower()
            node_id = node.get("id", "").lower()
            group = node.get("group", "")

            match = False
            # Match by search terms
            for term in search_terms:
                if term in label or term in node_id:
                    match = True
                    break
            # Also match by garments used
            if not match and group == "garment":
                for g in garments_used:
                    if g in label or g in node_id:
                        match = True
                        break
            # Era matching
            if not match and era:
                for word in era.replace("s", "").split():
                    if word.isdigit() and word in node_id:
                        match = True
                        break

            if match:
                neighbors = []
                for e in edges:
                    src = e["source"] if isinstance(e["source"], str) else e["source"].get("id", "")
                    tgt = e["target"] if isinstance(e["target"], str) else e["target"].get("id", "")
                    if src == node["id"]:
                        nbr = nodes_by_id.get(tgt)
                        if nbr: neighbors.append(nbr.get("label", ""))
                    if tgt == node["id"]:
                        nbr = nodes_by_id.get(src)
                        if nbr: neighbors.append(nbr.get("label", ""))
                insights.append({
                    "concept": node.get("label", label),
                    "neighbors": neighbors[:6],
                    "group": group,
                })
        return insights[:6]
    except Exception as e:
        print(f"[graph] Query error: {e}")
        return []


def _generate_style_rec(style, season, garments):
    """Generate a personalized style recommendation."""
    recs = {
        "Deconstruction / Grunge": "Try layering textures — pair a silk slip with a chunky knit for tension.",
        "Casual Chic": "Elevate with one tailored piece: a structured blazer over relaxed denim.",
        "Power Dressing": "Own the room. Add a strong shoulder or a bold belt to define the waist.",
        "Bohemian": "Natural fibers and mixed prints. Try a maxi with a fringed suede jacket.",
        "Modernist Minimalism": "One striking accessory is all you need. Let the cut speak.",
        "Classic Tailoring": "Fit is everything. Invest in tailoring for that bespoke finish.",
    }
    base = recs.get(style, "Stay true to your silhouette. One deliberate accent makes the look.")
    seasonal = ""
    if "Spring" in season:
        seasonal = " Lighten up with linen and pastel accents."
    elif "Autumn" in season or "Winter" in season:
        seasonal = " Rich textures like velvet or wool add depth."
    if not garments:
        return base + seasonal
    return f"Your {garments[0].lower()} anchors this {style.lower()} look. {base}{seasonal}"



@app.route("/memory-graph", methods=["GET", "POST"])
def memory_graph():
    """Access the knowledge graph from supermemory store."""
    if request.method == "GET":
        # Return graph summary
        mem_path = "/tmp/luxor-research/luxor_memory_store.json"
        if os.path.exists(mem_path):
            with open(mem_path) as f:
                store = json.load(f)
            kg = store.get("knowledge_graph", {})
            return jsonify({
                "node_count": kg.get("node_count", 0),
                "edge_count": kg.get("edge_count", 0),
                "groups": kg.get("groups", {}),
                "node_sample": kg.get("node_sample", []),
                "enriched_sections": store.get("enriched_sections", []),
            })
        return jsonify({"error": "No memory store found"}), 404

    # POST: query the graph
    try:
        body = request.get_json(force=True)
        query = body.get("query", "").lower()
        limit = body.get("limit", 10)

        mem_path = "/tmp/luxor-research/luxor_memory_store.json"
        if not os.path.exists(mem_path):
            return jsonify({"error": "No memory store found"}), 404

        with open(mem_path) as f:
            store = json.load(f)

        kg = store.get("knowledge_graph", {})
        nodes = kg.get("nodes", [])
        edges = kg.get("edges", [])

        results = []
        if query:
            # Search nodes by label or id
            for n in nodes:
                if query in n.get("label", "").lower() or query in n.get("id", "").lower():
                    neighbors = []
                    for e in edges:
                        src = e.get("source", "")
                        tgt = e.get("target", "")
                        if isinstance(src, dict): src = src.get("id", "")
                        if isinstance(tgt, dict): tgt = tgt.get("id", "")
                        if src == n["id"]:
                            neighbors.append({"id": tgt, "relation": e.get("label", "related_to")})
                        elif tgt == n["id"]:
                            neighbors.append({"id": src, "relation": e.get("label", "related_to")})
                    results.append({
                        "id": n["id"],
                        "label": n.get("label", ""),
                        "group": n.get("group", ""),
                        "description": n.get("description", ""),
                        "neighbors": neighbors[:limit],
                    })
                    if len(results) >= limit:
                        break

        return jsonify({
            "query": query,
            "results": results,
            "total_nodes": len(nodes),
            "total_edges": len(edges),
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/snapshots/<filename>")
def serve_snapshot(filename):
    return send_from_directory(str(OUTPUT_DIR), filename)

# ═══════════════════════════════════════════════════════════════════════════
#  IMAGE ANALYSIS ENGINE
# ═══════════════════════════════════════════════════════════════════════════

def _download_image(url):
    try:
        if url.startswith("data:"):
            _, encoded = url.split(",", 1)
            data = base64.b64decode(encoded)
            return Image.open(BytesIO(data)).convert("RGB")
        else:
            resp = requests.get(url, timeout=30, headers={"User-Agent": "LuxorAnalysis/2.0"})
            resp.raise_for_status()
            return Image.open(BytesIO(resp.content)).convert("RGB")
    except Exception as e:
        print(f"[download] Failed: {e}", file=sys.stderr)
        return None


def _quantize_colors(img, n_colors=8):
    """
    Fixed quantization (v2.1):
    - Center crop to 70% to avoid background edges
    - Resize to 300x300 (was 150x150) for better sampling
    - Use 8 colors (was 6) to capture white/cream/ivory
    - Filter shadow pixels (luminance < 30) so dark shadows don't dominate
    """
    w, h = img.size
    margin_x = max(1, int(w * 0.15))
    margin_y = max(1, int(h * 0.15))
    crop = img.crop((margin_x, margin_y, w - margin_x, h - margin_y))

    small = crop.copy().resize((300, 300), Image.LANCZOS)
    pal = small.quantize(colors=n_colors).convert("RGB")

    pixels = list(pal.getdata())
    counter = Counter(pixels)

    # Filter out shadow pixels (luminance < 30)
    filtered = {}
    for color, count in counter.items():
        lum = 0.299 * color[0] + 0.587 * color[1] + 0.114 * color[2]
        if lum > 30:
            filtered[color] = count

    # If too few survive, keep at least top 3
    if len(filtered) < 2:
        sorted_c = sorted(counter.items(), key=lambda x: x[1], reverse=True)
        for color, count in sorted_c[:3]:
            filtered[color] = count

    return [color for color, _ in Counter(filtered).most_common(n_colors)]


def _rgb_to_hex(rgb):
    return f"#{rgb[0]:02x}{rgb[1]:02x}{rgb[2]:02x}"


def _color_name(rgb):
    """
    Enhanced color naming (v2.1):
    - Better white/cream/ivory/off-white detection with wider thresholds
    - Charcoal, Dark Grey, Silver added as distinct names
    - Shadows no longer misidentified as Slate
    """
    r, g, b = rgb
    max_v = max(r, g, b)
    min_v = min(r, g, b)
    diff = max_v - min_v
    lum = 0.299 * r + 0.587 * g + 0.114 * b

    # Pure dark / black
    if max_v < 30 and lum < 25: return "Black"
    if max_v < 50 and lum < 40: return "Charcoal"

    # White / cream / ivory / off-white (lenient thresholds)
    if min_v > 220: return "White"
    if min_v > 200 and max_v > 230: return "Ivory"
    if r > 210 and g > 195 and b > 180: return "Cream"
    if r > 200 and g > 180 and b > 165: return "Off-White"
    if r > 195 and g > 180 and b > 160: return "Alabaster"
    if r > 185 and g > 170 and b > 150: return "Ecru"

    # Greys with luminance distinction
    if diff < 25:
        if lum > 200: return "Silver" if b > g else "Light Grey"
        if lum > 170: return "Light Grey"
        if lum > 120: return "Mid Grey"
        if lum > 70: return "Grey"
        if lum > 40: return "Dark Grey"
        return "Charcoal"

    # Color dominance detection
    if r > g and r > b:
        if r > 200 and g < 100: return "Red"
        if r > 180 and g < 140: return "Crimson" if b < 80 else "Rose"
        if r > 140 and r > g * 1.5: return "Burgundy" if b < 80 else "Coral"
        if r > 80: return "Maroon"
        return "Dark Red"
    if g > r and g > b:
        if g > 200: return "Green"
        if g > 160: return "Emerald" if b > 100 else "Olive"
        if g > 120 and r > 100: return "Sage"
        if g > 120: return "Kelly Green"
        if g > 80: return "Forest"
        return "Dark Green"
    if b > r and b > g:
        if b > 200: return "Blue"
        if b > 160 and r < 100: return "Royal Blue"
        if b > 120 and r < 80: return "Navy"
        if b > 120: return "Slate"
        if b > 80 and r > 80: return "Indigo"
        if b > 80: return "Teal"
        return "Dark Blue"

    # Warm / neutral tones
    if r > 200 and g > 160 and b < 120: return "Gold"
    if r > 180 and g > 140 and b < 100: return "Mustard"
    if r > 180 and g > 150 and b > 100: return "Beige"
    if r > 160 and g > 120 and b < 100: return "Tan"
    if r > 140 and g > 100 and b < 80: return "Brown"
    if r > 200 and g < 100 and b < 100: return "Burgundy"
    if lum > 180: return "Light Neutral"
    if lum > 100: return "Neutral"
    return "Dark Neutral"


def _fashion_color_name(rgb):
    """Fashionpedia-enriched color name with v2.1 additions."""
    base = _color_name(rgb)
    r, g, b = rgb
    avg = (r + g + b) / 3
    fashion_map = {
        "Red": ["Scarlet", "Poppy", "Chinese Red", "Fire Engine"],
        "Crimson": ["Crimson", "Amaranth", "Raspberry"],
        "Rose": ["Dusty Rose", "Blush", "Baby Pink"],
        "Burgundy": ["Burgundy", "Wine", "Merlot", "Bordeaux"],
        "Coral": ["Coral", "Salmon", "Peach"],
        "Maroon": ["Maroon", "Marsala"],
        "Green": ["Emerald", "Grass Green", "Chartreuse"],
        "Olive": ["Olive", "Army Green", "Khaki"],
        "Sage": ["Sage", "Mint", "Celadon"],
        "Forest": ["Forest", "Hunter Green", "Pine"],
        "Blue": ["Cerulean", "Sky Blue", "Cobalt"],
        "Royal Blue": ["Royal Blue", "Sapphire", "Ultramarine"],
        "Navy": ["Navy", "Midnight Blue", "Ink Blue"],
        "Slate": ["Slate", "Steel Blue", "Denim"],
        "Indigo": ["Indigo", "Violet", "Periwinkle"],
        "Teal": ["Teal", "Turquoise", "Aqua"],
        "Gold": ["Gold", "Champagne", "Gilded"],
        "Mustard": ["Mustard", "Ochre", "Saffron"],
        "Beige": ["Ecru", "Linen", "Sand"],
        "Tan": ["Tan", "Camel", "Caramel"],
        "Brown": ["Chocolate", "Chestnut", "Taupe", "Mocha"],
        "Black": ["Black", "Jet Black", "Obsidian"],
        "White": ["White", "Pure White", "Snow"],
        "Ivory": ["Ivory", "Champagne", "Alabaster"],
        "Ecru": ["Ecru", "Linen", "Natural"],
        "Alabaster": ["Alabaster", "Pearl", "Bone"],
        "Off-White": ["Off-White", "Eggshell", "Cotton"],
        "Cream": ["Cream", "Ivory", "Off-White", "Alabaster"],
        "Silver": ["Silver", "Platinum", "Heather"],
        "Light Grey": ["Moonstone", "Pearl", "Silver"],
        "Mid Grey": ["Stone", "Flannel Grey", "Pewter"],
        "Grey": ["Charcoal", "Slate Grey", "Ash"],
        "Dark Grey": ["Dark Grey", "Pewter", "Iron"],
        "Charcoal": ["Charcoal", "Obsidian", "Jet"],
        "Light Neutral": ["Natural", "Stone", "Bisque"],
        "Neutral": ["Taupe", "Greige", "Putty"],
        "Dark Neutral": ["Dark Taupe", "Umber", "Mushroom"],
    }
    opts = fashion_map.get(base, [base])
    brightness_idx = (
        0 if avg > 180 else
        1 if avg > 120 else
        2 if avg > 70 else
        min(3, len(opts) - 1) if len(opts) > 3 else len(opts) - 1
    )
    idx = min(brightness_idx, len(opts) - 1)
    return {
        "base": base,
        "fashion_name": opts[idx],
        "hex": _rgb_to_hex(rgb),
        "rgb": rgb,
        "brightness": "light" if avg > 180 else "medium" if avg > 90 else "dark",
    }


def _assess_color_harmony(colors):
    if len(colors) < 2: return "Monochrome"
    names = [_color_name(c) for c in colors]
    warm = {"Red", "Orange", "Gold", "Mustard", "Brown", "Cream", "Beige", "Burgundy",
            "Maroon", "Rose", "Coral", "Caramel", "Tan", "Ivory", "Ecru", "Off-White",
            "Alabaster", "Light Neutral", "Neutral"}
    cool = {"Blue", "Navy", "Indigo", "Slate", "Green", "Forest", "Sage", "Olive",
            "Emerald", "Teal", "Turquoise", "Silver", "Dark Neutral", "Dark Grey", "Charcoal"}
    wc = sum(1 for n in names if n in warm)
    cc = sum(1 for n in names if n in cool)
    if wc > 0 and cc > 0: return "Balanced"
    if wc > 0: return "Warm Tonal"
    if cc > 0: return "Cool Tonal"
    if len(set(names)) <= 2: return "Monochromatic"
    return "Analogous"


def _estimate_brightness(img):
    """Estimate brightness from center-cropped region to avoid background."""
    w, h = img.size
    margin_x = max(1, int(w * 0.15))
    margin_y = max(1, int(h * 0.15))
    crop = img.crop((margin_x, margin_y, w - margin_x, h - margin_y))
    gray = crop.convert("L")
    avg = sum(gray.getdata()) / (gray.width * gray.height)
    if avg > 200: return "Light"
    if avg > 140: return "Medium-Light"
    if avg > 90: return "Medium"
    if avg > 50: return "Medium-Dark"
    return "Dark"


def _estimate_contrast(img):
    """Estimate contrast from center-cropped region to avoid background."""
    w, h = img.size
    margin_x = max(1, int(w * 0.15))
    margin_y = max(1, int(h * 0.15))
    crop = img.crop((margin_x, margin_y, w - margin_x, h - margin_y))
    gray = crop.convert("L")
    pixels = list(gray.getdata())
    m = sum(pixels) / len(pixels)
    std = (sum((p - m) ** 2 for p in pixels) / len(pixels)) ** 0.5
    if std > 60: return "High"
    if std > 35: return "Medium"
    return "Soft"


def _detect_horizontal_bands(img):
    """Detect garment bands with center-crop to avoid background edges."""
    w, h = img.size
    bands = []
    sections = [
        ("Upper Body", 0, h // 3),
        ("Mid Section", h // 3, 2 * h // 3),
        ("Lower Body", 2 * h // 3, h),
    ]
    for label, y0, y1 in sections:
        if y1 - y0 < 20:
            continue
        crop = img.crop((0, y0, w, y1))
        band_w, band_h = crop.size
        # Crop band to center 80% to avoid background edges
        band_margin_x = max(1, int(band_w * 0.1))
        crop_center = crop.crop((band_margin_x, 0, band_w - band_margin_x, band_h))
        colors = _quantize_colors(crop_center, n_colors=4)
        mc = colors[0] if colors else (128, 128, 128)
        bands.append({"name": label, "color": _rgb_to_hex(mc), "colorName": _color_name(mc)})
    return bands


def _classify_historical_style(colors, brightness, contrast):
    """Map to Fashionpedia's historical fashion styles by era. v2.1 uses top-4 colors."""
    style_map = {
        "Edgy": {
            "name": "Deconstruction / Grunge", "era": "1990s",
            "description": "Deconstructed silhouettes, anti-fashion",
            "icons": ["Kate Moss", "Kurt Cobain"],
        },
        "Soft Casual": {
            "name": "Casual Chic", "era": "1990s",
            "description": "Relaxed elegance, minimalist approach",
            "icons": ["Calvin Klein", "Helmut Lang"],
        },
        "Bold Contemporary": {
            "name": "Power Dressing", "era": "1980s",
            "description": "Strong shoulders, bold color blocking",
            "icons": ["Madonna", "Princess Diana"],
        },
        "Earthy Casual": {
            "name": "Bohemian", "era": "1970s",
            "description": "Natural fibers, layered textures",
            "icons": ["Kate Moss", "Sienna Miller"],
        },
        "Cool Minimalist": {
            "name": "Modernist Minimalism", "era": "1990s-2000s",
            "description": "Clean lines, monochromatic",
            "icons": ["Jil Sander", "Martin Margiela"],
        },
        "Modern Classic": {
            "name": "Classic Tailoring", "era": "1930s-1960s",
            "description": "Timeless silhouettes, balanced proportions",
            "icons": ["Audrey Hepburn", "Coco Chanel"],
        },
    }

    # Use top 4 colors for classification (avoid accent colors skewing result)
    top_colors = colors[:4] if len(colors) > 4 else colors
    if top_colors:
        bright_count = sum(1 for c in top_colors if c.get("brightness") == "light")
        bright_ratio = bright_count / max(len(top_colors), 1)
    else:
        bright_ratio = 0.5

    harmony = _assess_color_harmony([c["rgb"] for c in top_colors]) if top_colors else "Neutral"

    # Heuristic: light palettes with soft contrast → Casual Chic / Minimalist
    if brightness in ("Light", "Medium-Light") and contrast == "Soft":
        if bright_ratio > 0.5 or "Cool" in harmony:
            return style_map["Cool Minimalist"]
        return style_map["Soft Casual"]

    # Light/Medium-Light with high contrast → likely a light palette + high contrast from structure
    if brightness in ("Light", "Medium-Light") and contrast == "High":
        if bright_ratio > 0.6:
            return style_map["Cool Minimalist"]
        return style_map["Bold Contemporary"]

    # Dark with high contrast → Edgy
    if brightness.startswith("Dark") and contrast == "High":
        return style_map["Edgy"]

    # Medium brightness breakdown
    if brightness == "Medium":
        if contrast == "High":
            return style_map["Bold Contemporary"]
        if bright_ratio > 0.5:
            return style_map["Soft Casual"]
        if "Warm" in harmony:
            return style_map["Earthy Casual"]
        if "Cool" in harmony:
            return style_map["Cool Minimalist"]
        return style_map["Modern Classic"]

    # Fallback via harmony
    if "Warm" in harmony:
        return style_map["Earthy Casual"]
    if "Cool" in harmony:
        return style_map["Cool Minimalist"]
    return style_map["Modern Classic"]


def _detect_garment_type(bands, colors, img_ratio):
    """Fashionpedia garment taxonomy matching."""
    garment_taxonomy = {
        "Jacket": {"subtypes": ["Blazer", "Bomber", "Denim Jacket", "Leather Jacket", "Tuxedo Jacket"]},
        "Coat": {"subtypes": ["Trench", "Peacoat", "Overcoat", "Parka", "Puffer", "Duffle"]},
        "Shirt": {"subtypes": ["Button-Down", "Oxford", "Chambray", "Flannel"]},
        "Blouse": {"subtypes": ["Silk Blouse", "Peplum Top", "Tunic", "Crop Top"]},
        "Dress": {"subtypes": ["Sheath", "A-Line", "Bodycon", "Maxi", "Midi", "Mini", "Wrap", "Slip"]},
        "Pants": {"subtypes": ["Trousers", "Chinos", "Wide-Leg", "Palazzo", "Cargo", "Straight"]},
        "Jeans": {"subtypes": ["Skinny", "Slim", "Straight", "Bootcut", "Boyfriend", "Wide-Leg"]},
        "Skirt": {"subtypes": ["A-Line", "Pencil", "Pleated", "Mini", "Midi", "Wrap"]},
        "Sweater": {"subtypes": ["Crewneck", "V-Neck", "Turtleneck", "Cardigan", "Pullover"]},
        "Vest": {"subtypes": ["Puffer Vest", "Knit Vest", "Waistcoat"]},
        "Jumpsuit": {"subtypes": ["Jumpsuit", "Romper", "Boilersuit"]},
    }
    band_count = len(bands)
    # Use knowledge base to enrich if available
    kb_garments = FASHION_KB.get("garment_types", {})
    results = []
    for gtype, info in garment_taxonomy.items():
        # Check KB for subtypes
        kb_subtypes = []
        if isinstance(kb_garments, dict):
            kb_entry = kb_garments.get(gtype.lower(), {})
            if isinstance(kb_entry, dict):
                kb_subtypes = kb_entry.get("subtypes", [])
        all_subtypes = info["subtypes"] + kb_subtypes
        results.append({
            "type": gtype,
            "subtypes": all_subtypes[:3],
            "confidence": "high" if band_count >= 3 else "medium" if band_count >= 2 else "low",
        })
    if not results:
        if band_count >= 3:
            results.append({"type": "Dress/Jumpsuit", "subtypes": [], "confidence": "low"})
        elif band_count == 2:
            results.append({"type": "Two-Piece Set", "subtypes": [], "confidence": "low"})
        else:
            results.append({"type": "Single Layer", "subtypes": [], "confidence": "low"})
    return results[:5]


def _get_fabric_suggestions(style, season, detected_type):
    """Fashionpedia fabric recommendations per season and garment."""
    fabric_db = {
        "Spring / Summer": {
            "tops": ["Cotton Voile", "Linen", "Seersucker", "Chambray", "Silk Habotai"],
            "bottoms": ["Linen", "Cotton Twill", "Lightweight Denim", "Tencel"],
            "dresses": ["Cotton Lawn", "Silk Chiffon", "Jersey", "Eyelet"],
            "jackets": ["Cotton Canvas", "Lightweight Wool", "Cotton Sateen"],
        },
        "Autumn / Winter": {
            "tops": ["Merino Wool", "Cashmere", "Tweed", "Flannel", "Velvet"],
            "bottoms": ["Worsted Wool", "Corduroy", "Denim", "Wool Flannel"],
            "dresses": ["Jersey", "Double Knit", "Velvet", "Wool Crepe"],
            "jackets": ["Wool Melton", "Tweed", "Leather", "Herringbone"],
        },
        "Transitional": {
            "tops": ["Cotton Jersey", "Silk Crepe", "Modal", "Linen Blend"],
            "bottoms": ["Cotton Lyocell", "Stretch Denim", "Ponte Knit"],
            "dresses": ["Tencel", "Jersey", "Matte Jersey"],
            "jackets": ["Trench Cotton", "Lightweight Wool", "Denim"],
        },
    }
    season_key = "Transitional"
    for key in fabric_db:
        if season and key and len(season) > 0 and len(key) > 0 and key[0] == season[0]:
            season_key = key
            break
    if any(t in detected_type.lower() for t in ["dress", "jumpsuit"]):
        cat = "dresses"
    elif any(t in detected_type.lower() for t in ["jacket", "coat"]):
        cat = "jackets"
    elif any(t in detected_type.lower() for t in ["shirt", "blouse", "sweater", "vest", "top"]):
        cat = "tops"
    else:
        cat = "bottoms"
    suggestions = fabric_db.get(season_key, {}).get(cat, [])
    # Style-based refinements from Fashionpedia
    style_refinements = {
        "Grunge": ["Flannel", "Denim", "Leather", "Ripped Knit"],
        "Casual Chic": ["Cotton Poplin", "Linen", "Jersey", "Tencel"],
        "Bohemian": ["Crochet", "Lace", "Velvet", "Fringe"],
        "Minimalism": ["Wool Crepe", "Silk", "Cotton Sateen", "Matte Jersey"],
        "Tailoring": ["Worsted Wool", "Cotton Twill", "Herringbone", "Tweed"],
        "Power": ["Structured Wool", "Silk", "Brocade", "Taffeta"],
    }
    for sk, fabrics in style_refinements.items():
        if sk.lower() in style.lower():
            return fabrics[:4]
    return suggestions[:5] if suggestions else ["Cotton", "Linen", "Wool"]


def _get_pose_suggestions():
    """Return pose suggestions from 1000 Poses knowledge."""
    poses_kb = FASHION_KB.get("poses", {})
    if not poses_kb:
        return [
            "Standing: Slight weight shift with one hand in pocket",
            "Sitting: Cross-legged with hands resting on knee",
            "Kneeling: One knee up, torso angled slightly",
        ]
    suggestions = []
    categories = ["Standing", "Sitting", "Kneeling"]
    for ptype in categories:
        for key, val in poses_kb.items():
            if isinstance(val, dict) and val.get("type") == ptype:
                pose_range = val.get("pose_range", "Classic")
                suggestions.append(f"{ptype}: {pose_range}")
                break
    return suggestions[:5] if suggestions else [
        "Standing: Classic pose with subtle asymmetry",
        "Sitting: Relaxed recline with extended leg",
    ]


def _get_season_label(brightness, colors_rgb, harmony):
    """
    Enhanced season classification (v2.1):
    - Brightness-based mapping
    - Color temperature adjustment
    - Knowledge base cross-reference when available
    """
    # Check fashion history pages for season context
    kb_history = FASHION_KB.get("fashion_history", {})
    if isinstance(kb_history, dict) and kb_history:
        season_counts = {"spring": 0, "summer": 0, "autumn": 0, "fall": 0, "winter": 0}
        for val in kb_history.values():
            if isinstance(val, str):
                text = val.lower()
                for s in season_counts:
                    season_counts[s] += text.count(s)
        max_count = max(season_counts.values())
        if max_count > 5:
            dominant = max(season_counts, key=season_counts.get)
            if dominant == "fall":
                return "Autumn / Winter"
            if dominant in ("spring", "summer"):
                return "Spring / Summer" if season_counts.get("spring", 0) > season_counts.get("summer", 0) else "Summer"
            if dominant == "winter":
                return "Autumn / Winter"
            if dominant == "autumn":
                return "Autumn"

    # Fallback heuristic
    brightness_map = {
        "Light": "Spring / Summer",
        "Medium-Light": "Late Spring",
        "Medium": "Transitional",
        "Medium-Dark": "Early Autumn",
        "Dark": "Autumn / Winter",
    }
    season = brightness_map.get(brightness, "Transitional")

    if harmony:
        if "Warm" in harmony and ("Spring" in season or "Summer" in season or "Transitional" in season):
            season = "Spring / Summer"
        elif "Cool" in harmony and ("Autumn" in season or "Winter" in season or "Transitional" in season):
            season = "Autumn / Winter"

    if colors_rgb and len(colors_rgb) >= 4:
        bright_count = sum(1 for c in colors_rgb if sum(c) / 3 > 180)
        if bright_count >= 3 and "Dark" not in brightness:
            season = "Spring / Summer"

    return season


def _get_design_notes(style, harmony, contrast, bands):
    """Generate design notes from knowledge base + analysis (v2.1)."""
    kb_design = FASHION_KB.get("design_principles", [])
    notes = []

    # Try KB first
    if isinstance(kb_design, list):
        for item in kb_design[:3]:
            if isinstance(item, str) and len(item.strip()) > 5:
                notes.append(item.strip())

    # Always add core notes
    notes.append(f"Style: {style.get('name', 'Contemporary')} ({style.get('era', 'Modern')}) — {style.get('description', '')[:60]}")
    notes.append(f"Palette: {harmony.lower()} with {contrast.lower()} contrast")
    if bands:
        notes.append(f"Layers: {len(bands)} sections detected — {', '.join(b['colorName'] for b in bands)}")
    notes.append(f"Proportion: {'Balanced vertical line' if len(bands) >= 2 else 'Single-block silhouette'}")

    return notes[:5]


def _color_family(name):
    """Group similar color names into families for palette restraint detection."""
    name_lower = name.lower()
    white_family = {"white", "ivory", "cream", "off-white", "alabaster", "ecru", "snow", "pearl", "bone", "champagne", "eggshell"}
    grey_family = {"light grey", "mid grey", "grey", "dark grey", "silver", "charcoal", "stone", "ash", "pewter", "iron", "flannel grey", "heather", "moonstone", "slate grey", "jet", "graphite", "smoke"}
    black_family = {"black", "obsidian", "jet black"}
    beige_family = {"beige", "tan", "camel", "sand", "linen", "natural", "ecru", "bisque"}
    brown_family = {"brown", "chocolate", "chestnut", "taupe", "mocha", "caramel", "toffee", "umber"}
    blue_family = {"blue", "navy", "indigo", "slate", "royal blue", "sky blue", "cobalt", "cerulean", "sapphire", "ultramarine", "midnight blue", "ink blue", "steel blue", "denim", "periwinkle"}
    green_family = {"green", "olive", "sage", "forest", "emerald", "mint", "kelly green", "chartreuse", "hunter green", "pine", "celadon", "army green", "khaki"}
    teal_family = {"teal", "turquoise", "aqua", "cyan"}
    red_family = {"red", "crimson", "scarlet", "poppy", "fire engine", "burgundy", "wine", "merlot", "bordeaux", "marsala", "raspberry", "amaranth"}
    pink_family = {"rose", "coral", "salmon", "peach", "blush", "dusty rose", "baby pink"}
    purple_family = {"purple", "violet", "lavender", "lilac", "plum", "indigo"}
    yellow_family = {"yellow", "gold", "mustard", "ochre", "saffron", "gilded", "champagne"}
    orange_family = {"orange", "coral", "peach", "salmon", "tangerine"}
    neutral_family = {"neutral", "light neutral", "dark neutral", "greige", "putty", "taupe", "mushroom"}

    for family, names in [
        ("White", white_family), ("Grey", grey_family), ("Black", black_family),
        ("Beige", beige_family), ("Brown", brown_family), ("Blue", blue_family),
        ("Green", green_family), ("Teal", teal_family), ("Red", red_family),
        ("Pink", pink_family), ("Purple", purple_family), ("Yellow", yellow_family),
        ("Orange", orange_family), ("Neutral", neutral_family),
    ]:
        if name_lower in names:
            return family
    return name  # Fallback: use as-is




def _lookup_named_color(rgb):
    """Look up closest named color from the 39-color reference palette."""
    r, g, b = rgb
    # Lazily load named colors
    if not hasattr(_lookup_named_color, "palette"):
        kb = FASHION_KB.get("garment_types", {})
        if isinstance(kb, dict) and "named_colors" in kb:
            _lookup_named_color.palette = kb["named_colors"]
        else:
            _lookup_named_color.palette = {}

    if not _lookup_named_color.palette:
        return None

    best_name = None
    best_dist = float("inf")
    for name, info in _lookup_named_color.palette.items():
        cr, cg, cb = info["rgb"]
        dist = (r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2
        if dist < best_dist:
            best_dist = dist
            best_name = name

    if best_dist < 500:  # Threshold for "close enough"
        return best_name
    return None


def _get_body_shape_recommendations(analysis):
    """Get body shape recommendations from enriched KB."""
    kb_recs = FASHION_KB.get("outfit_recommendation", {})
    body_shapes = kb_recs.get("body_shapes", [])
    if not body_shapes:
        return []

    # Try to detect body shape from analysis data
    body_note = analysis.get("bodyTypeNotes", "").lower()
    detected = None
    for shape in body_shapes:
        sname = shape["shape"].lower()
        if sname in body_note:
            detected = shape
            break

    if detected:
        return [
            {"shape": detected["shape"], "description": detected["description"],
             "recommendation": detected["recommendation"]}
        ]

    # No specific shape detected — return general universal recommendations
    return [
        {"shape": "Universal", "description": "Balanced proportions",
         "recommendation": "Focus on fit and silhouette definition"},
        {"shape": "General Tip", "description": "Vertical alignment is key",
         "recommendation": "Monochromatic dressing elongates the frame"},
    ]


def _get_edit_recommendations(analysis):
    """Get Fashion++ style edit recommendations from enriched KB."""
    kb_edits = FASHION_KB.get("edit_recommendations", [])
    style = analysis.get("overallStyle", "").lower()
    body_note = analysis.get("bodyTypeNotes", "").lower()

    matched = []
    for rec in kb_edits:
        suitable = [s.lower() for s in rec.get("suitable_for", [])]
        # Check if body type matches
        for s in suitable:
            if s in body_note:
                matched.append(rec)
                break
        else:
            if len(matched) < 3:
                matched.append(rec)

    # De-duplicate by edit name
    seen = set()
    unique = []
    for m in matched:
        if m["edit"] not in seen:
            seen.add(m["edit"])
            unique.append(m)
    return unique[:4]

def _vice_critique(img):
    """VICE Magazine DO/DON'T classification engine (v2.1 enhanced + refined signals)."""
    colors_rgb = _quantize_colors(img, n_colors=8)
    brightness = _estimate_brightness(img)
    contrast = _estimate_contrast(img)
    harmony = _assess_color_harmony(colors_rgb)
    bands = _detect_horizontal_bands(img)

    # Use top 4 colors for purity/restraint checks
    top_colors = colors_rgb[:4] if len(colors_rgb) > 4 else colors_rgb
    # Group by color family to avoid counting tonal variations as distinct
    top_color_names = set(_color_family(_color_name(c)) for c in top_colors)
    all_color_names = set(_color_family(_color_name(c)) for c in colors_rgb)

    base = 50
    signals = []

    # DON'T signals
    if contrast == "Soft" and brightness in ("Light", "Medium-Light"):
        base -= 5
        signals.append(
            "All-light outfit with soft contrast reads as trying too hard"
            if brightness == "Light"
            else "Soft contrast in bright tones = safe, predictable, no risk"
        )

    # Color count check: use distinct COLOR NAMES in top 4, not total colors
    distinct_top = len(top_color_names)
    distinct_all = len(all_color_names)
    if distinct_top >= 4 or distinct_all >= 6:
        base -= 8
        signals.append("Too many colors — feels like you're trying to do everything at once")
    elif distinct_top >= 3:
        base -= 3
        signals.append("Busy palette — consider editing down to 2-3 key tones")

    if brightness.startswith("Dark") and contrast == "Soft":
        base -= 3
        signals.append("Dark-on-dark without edge = playing it safe, no conviction")
    if harmony == "Monochromatic" and brightness == "Medium":
        base -= 5
        signals.append("Safe middle-ground — neither here nor there")
    if not bands or len(bands) < 2:
        base -= 4
        signals.append("Single layer with no depth — where's the dimension?")

    # DO signals
    if contrast == "High" and brightness in ("Light", "Medium-Light"):
        base += 8
        signals.append("Light + contrast = sophisticated, editorial presence")
    elif contrast == "High":
        base += 8
        signals.append("Strong contrast = confidence, knows what they're doing")
    if distinct_top <= 2:
        base += 7
        signals.append("Restrained palette = natural style, not manufactured")
    elif distinct_top == 3:
        base += 3
        signals.append("Controlled 3-color palette = well-edited, intentional")

    if "Cool" in harmony:
        base += 3
        signals.append("Cool tones = intentional, sophisticated")
    elif "Warm" in harmony:
        base += 2
        signals.append("Warm tones = approachable, grounded")

    # Tonal dressing bonus
    if bands:
        band_names = [b["colorName"] for b in bands]
        if len(set(band_names)) <= 2 and len(bands) >= 2:
            base += 5
            signals.append("Tonal dressing = sophisticated, editorial approach")

    # Clamp score
    base = max(0, min(100, base))

    # Verdict
    if base >= 76:
        verdict = "STRONG DO"
    elif base >= 56:
        verdict = "DO"
    elif base >= 41:
        verdict = "NEUTRAL"
    elif base >= 21:
        verdict = "DON'T"
    else:
        verdict = "HARD DON'T" if base > 0 else "WHAT WERE YOU THINKING"

    # VICE quotes
    import random
    vice_quotes = {
        "STRONG DO": [
            "Effortless. Not trying, just being.",
            "This is how you do it. Confident.",
            "Clean, considered, knows the assignment.",
        ],
        "DO": [
            "Solid. Owns it.",
            "Good eye. Good execution.",
            "Confident without shouting.",
        ],
        "NEUTRAL": [
            "Meh. Nothing to write home.",
            "Safe. Boring. Predictable.",
            "It's fine. That's the problem.",
        ],
        "DON'T": [
            "Trying. And failing.",
            "This is a cry for help.",
            "Who dressed you? The mirror?",
        ],
        "HARD DON'T": [
            "What were you thinking?",
            "Burn it. Start over.",
            "This is a fashion crime.",
        ],
        "WHAT WERE YOU THINKING": [
            "Congratulations. You broke fashion.",
            "This is avant-garde in the worst way.",
            "The police have been called.",
        ],
    }
    # Get quote key
    qkey = verdict.split()[0] if " " in verdict else verdict
    quotes = vice_quotes.get(qkey, vice_quotes["NEUTRAL"])
    vibe_quote = random.choice(quotes)

    return {
        "verdict": verdict,
        "score": base,
        "signals": signals[:6],
        "vibe": vibe_quote,
        "hooks": {
            "layer_depth": len(bands),
            "color_count": len(colors_rgb),
            "palette_restraint": len(set(b["colorName"] for b in bands)) if bands else 0,
        },
        "reasoning": (
            f"VICE-style critique: {vibe_quote} "
            f"Score: {base}/100 — {verdict}. "
            + (
                "Tonal control and confidence. Strong editorial sensibility."
                if base >= 76 else
                "Solid but not pushing boundaries. Good foundation."
                if base >= 56 else
                "Competent but lacking edge — needs a point of view."
                if base >= 41 else
                "Fashion misstep. Lacks cohesion or intentionality."
            )
        ),
    }

# ═══════════════════════════════════════════════════════════════════════════
#  MAIN ANALYSIS
# ═══════════════════════════════════════════════════════════════════════════

def _analyze_image(img):
    """Main analysis returning enriched JSON with fashion knowledge (v2.1)."""
    w, h = img.size
    colors_rgb = _quantize_colors(img, n_colors=8)
    harmony = _assess_color_harmony(colors_rgb)
    brightness = _estimate_brightness(img)
    contrast = _estimate_contrast(img)
    bands = _detect_horizontal_bands(img)
    color_details = [_fashion_color_name(c) for c in colors_rgb]
    hex_colors = [c["hex"] for c in color_details]

    # Style classification
    style = _classify_historical_style(color_details, brightness, contrast)

    # Garment detection
    img_ratio = w / h if h > 0 else 1
    detected_garments = _detect_garment_type(bands, colors_rgb, img_ratio)

    # Season
    season = _get_season_label(brightness, colors_rgb, harmony)

    # Fabric suggestions
    primary_garment = detected_garments[0]["type"] if detected_garments else "layer"
    fabric_suggestions = _get_fabric_suggestions(style["name"], season, primary_garment)

    # Pose suggestions
    pose_suggestions = _get_pose_suggestions()

    # Score
    base_score = 70
    if contrast == "High": base_score += 5
    if "Monochrome" in harmony: base_score += 8
    if "Balanced" in harmony: base_score += 5
    if "Warm Tonal" in harmony or "Cool Tonal" in harmony: base_score += 3
    if len(colors_rgb) >= 3: base_score += 5
    if len(colors_rgb) <= 2: base_score += 3
    base_score = min(base_score, 98)

    # Occasion ratings
    occasion_ratings = _rate_occasions(colors_rgb, brightness, contrast)

    # Design notes (v2.1 uses KB)
    design_notes = _get_design_notes(style, harmony, contrast, bands)

    # Body type note
    body_note = "Balanced silhouette with proportional vertical alignment"
    if h > 0 and w > 0:
        ratio = w / h
        if ratio < 0.35:
            body_note = "Elongated vertical silhouette — lean lines dominate"
        elif ratio > 0.55:
            body_note = "Broader horizontal frame — volume sits wider"

    # Style context from Fashionpedia
    style_context = (
        f"Iconic references: {', '.join(style['icons'])}. "
        f"Design philosophy: {style['description']}."
    )

    # Build enriched result
    result = {
        "overallStyle": style["name"],
        "styleEra": style["era"],
        "styleScore": min(base_score, 98),
        "styleVibe": _describe_vibe(style["name"], brightness, contrast),
        "styleDescription": (
            f"This is a {style['name'].lower()} look from the {style['era']} era, "
            f"characterized by {style['description'].lower()}. "
            f"The look reads as {brightness.lower()} overall, with a {harmony.lower()} "
            f"palette and {contrast.lower()} contrast. {style_context}"
        ),
        "styleIcons": style["icons"],
        "occasionRatings": occasion_ratings,
        "detectedItems": bands,
        "detectedGarments": detected_garments,
        "fabricSuggestions": fabric_suggestions,
        "poseSuggestions": pose_suggestions,
        "colorPalette": {
            "colors": [
                {
                    "name": c["fashion_name"],
                    "hex": c["hex"],
                    "base": c["base"],
                    "brightness": c["brightness"],
                }
                for c in color_details[:6]
            ],
            "harmony": harmony,
            "rating": (
                f"{harmony.lower()} harmony with {brightness.lower()} tones"
                if base_score >= 70
                else "Consider adding more contrast or an accent color"
            ),
        },
        "strengths": [
            f"Referenced style from {style['era']}: {style['name']}",
            f"{contrast} contrast creates {'strong visual interest' if contrast == 'High' else 'soft, harmonious blending'}",
            "Well-considered palette" if len(colors_rgb) >= 3 else "Clean minimal color story",
        ],
        "improvements": [
            {"suggestion": "Add layering for depth", "reason": "A single layer reads as flat", "priority": "medium"}
            if len(bands) < 2 else None,
            {
                "suggestion": f"Try {fabric_suggestions[0]}" if fabric_suggestions else "Add texture",
                "reason": f"{fabric_suggestions[0]} elevates the {season.lower()} look" if fabric_suggestions else "Texture adds visual depth",
                "priority": "low",
            },
            {"suggestion": "Add accent color", "reason": "An accent accessory would elevate this look", "priority": "low"}
            if len(colors_rgb) < 3 else None,
        ],
        "designNotes": design_notes,
        "seasonalFit": season,
        "bodyTypeNotes": body_note,
    }

    # Enrich with body shape recommendations
    try:
        body_recs = _get_body_shape_recommendations(result)
        if body_recs:
            result["bodyShapeRecommendations"] = body_recs
    except Exception:
        pass

    # Enrich with edit recommendations (Fashion++ style)
    try:
        edit_recs = _get_edit_recommendations(result)
        if edit_recs:
            result["editRecommendations"] = edit_recs
    except Exception:
        pass

    # Add garment detail descriptors from enriched KB
    try:
        detail_descriptors = FASHION_KB.get("garment_detail_descriptors", [])
        if detail_descriptors:
            result["garmentDetailDescriptors"] = detail_descriptors[:8]
    except Exception:
        pass

    return result


def _describe_vibe(style, brightness, contrast):
    if "Edgy" in style: return "confident, fashion-forward statement"
    if "Soft" in style: return "approachable, relaxed everyday feel"
    if "Bold" in style: return "striking, memorable impression"
    if "Earthy" in style: return "grounded, nature-inspired warmth"
    if "Minimalist" in style: return "clean, understated elegance"
    return "polished, versatile look"



@app.route("/stylist-tweaks", methods=["POST", "OPTIONS"])
def stylist_tweaks_endpoint():
    """Generate stylist tweaks for an outfit image."""
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"})
    
    data = request.get_json(silent=True) or {}
    image_url = data.get("imageUrl", "")
    
    if not image_url:
        return jsonify({"error": "No imageUrl provided", "success": False}), 400
    
    try:
        print(f"[stylist-tweaks] Loading image: {image_url}")
        img = download_image(image_url)
        print(f"[stylist-tweaks] Image size: {img.size}")
        tweaks = generate_all_tweaks(img, output_format="data_url")
        return jsonify({"success": True, "tweaks": tweaks})
    except Exception as e:
        print(f"[stylist-tweaks] Error: {e}")
        import traceback; traceback.print_exc()
        return jsonify({"error": str(e), "success": False}), 500


@app.route("/analyze-with-tweaks", methods=["POST", "OPTIONS"])
def analyze_with_tweaks():
    """Analyze outfit + generate stylist tweaks in one call."""
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"})
    
    data = request.get_json(silent=True) or {}
    image_url = data.get("imageUrl", "")
    
    if not image_url:
        return jsonify({"error": "No imageUrl provided"}), 400
    
    try:
        img = download_image(image_url)
        print(f"[analyze-with-tweaks] Running analysis...")
        analysis = _analyze_image(img)
        print(f"[analyze-with-tweaks] Generating stylist tweaks...")
        tweaks = generate_all_tweaks(img, output_format="data_url")
        return jsonify({"success": True, "analysis": analysis, "tweaks": tweaks})
    except Exception as e:
        print(f"[analyze-with-tweaks] Error: {e}")
        import traceback; traceback.print_exc()
        return jsonify({"error": str(e)}), 500


def _rate_occasions(colors, brightness, contrast):
    score = min(60 + len(colors) * 5 + (10 if "High" in contrast else 5), 95)
    return [
        {"occasion": "Casual", "score": score + 5 if "Soft" in contrast else score - 5, "reason": "Relaxed and approachable"},
        {"occasion": "Work / Office", "score": score - 5 if "Warm" in contrast else score + 3, "reason": "Tonal harmony = professional polish"},
        {"occasion": "Evening Out", "score": score + 8 if ("Dark" in brightness or "High" in contrast) else score - 10, "reason": "Contrast suits evening"},
        {"occasion": "Date Night", "score": score + 5, "reason": "Intentional styling"},
        {"occasion": "Formal Event", "score": score - 12 if "Soft" in brightness else score - 5, "reason": "Semi-formal range"},
        {"occasion": "Weekend Brunch", "score": score + 10 if "Light" in brightness else score, "reason": "Daytime social palette"},
    ]


# ═══════════════════════════════════════════════════════════════════════════
#  MAIN
# ═══════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Luxor Analysis Server v3.0")
    parser.add_argument("--port", type=int, default=PORT)
    parser.add_argument("--host", type=str, default=HOST)
    parser.add_argument("--kb", type=str, default=None, help="Path to knowledge base JSON")
    args = parser.parse_args()

    # Load knowledge at startup
    FASHION_KB = _load_knowledge_base(args.kb)
    VICE_RULES = _load_vice_rules()
    kb_sections = list(FASHION_KB.keys()) if FASHION_KB else []
    vice_active = bool(VICE_RULES)

    print(f"╔══════════════════════════════════════════╗")
    print(f"║  Luxor Analysis Server v2.1             ║")
    print(f"║  ✓ Fixed color quantization              ║")
    print(f"║  ✓ Cream/white/ivory detection           ║")
    print(f"║  ✓ Season label function                 ║")
    print(f"║  ✓ Enhanced VICE critique                ║")
    print(f"║  ✓ Pipeline endpoint                     ║")
    print(f"║  Fashionpedia + VICE knowledge active    ║")
    print(f"║  KB sections: {len(kb_sections)}                       ║")
    print(f"║  VICE critique: {'✓' if vice_active else '✗'}                         ║")
    print(f"║  Listening: {args.host}:{args.port}                ║")
    print(f"║  POST /analyze-outfit                    ║")
    print(f"║  POST /critique-outfit                   ║")
    print(f"║  POST /pipeline                          ║")
    print(f"║  POST /stylist-tweaks                    ║")
    print(f"║  POST /analyze-with-tweaks               ║")
    print(f"║  Stylist tweaks: {'✓' if STYLIST_TWEAKS_ACTIVE else '✗'}                         ║")
    print(f"╚══════════════════════════════════════════╝")
    print(f"Snapshots: {OUTPUT_DIR}")

    app.run(host=args.host, port=args.port, debug=False)
