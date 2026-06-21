#!/usr/bin/env python3
"""
Luxor Hub Dressing Room Pipeline v1.0
======================================
End-to-end pipeline integrating:
  1. Fashionpedia knowledge graph (151 concepts, 124 relationships)
  2. VICE street fashion critique methodology
  3. Supermemory-style user preference persistence
  4. 1000 Poses recommendation catalog
  5. luxor_analysis_server.py analysis engine

Usage:
  # Full pipeline: analyze + critique + memory
  python3 luxor_dressing_room_pipeline.py --image <url> --user <id>

  # Quick analysis only
  python3 luxor_dressing_room_pipeline.py --image <url> --quick

  # Show user history
  python3 luxor_dressing_room_pipeline.py --history --user <id>

  # Show knowledge graph summary
  python3 luxor_dressing_room_pipeline.py --graph-stats
"""

import argparse
import json
import os
import sys
import time
import uuid
from pathlib import Path

# Add parent to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# ─── Configuration ─────────────────────────────────────────────────────
KNOWLEDGE_BASE_PATH = "/tmp/luxor-research/fashion_knowledge_base.json"
KNOWLEDGE_GRAPH_PATH = "/tmp/luxor-research/fashion_kb_for_graph/graphify-out/graph.json"
MEMORY_STORE_PATH = "/tmp/luxor-research/luxor_memory_store.json"
VICE_RULES_PATH = "/tmp/luxor-research/vice_critique_rules.json"

# ─── Knowledge Graph Loader ────────────────────────────────────────────

class FashionKnowledgeGraph:
    """Interface to the 151-node fashion knowledge graph."""
    
    def __init__(self, path=KNOWLEDGE_GRAPH_PATH):
        self.graph = {"nodes": [], "edges": []}
        if os.path.exists(path):
            with open(path) as f:
                self.graph = json.load(f)
        self.nodes_by_id = {n["id"]: n for n in self.graph["nodes"]}
        self.nodes_by_group = {}
        for n in self.graph["nodes"]:
            self.nodes_by_group.setdefault(n["group"], []).append(n)
    
    def stats(self) -> dict:
        return {
            "total_nodes": len(self.graph["nodes"]),
            "total_edges": len(self.graph["edges"]),
            "groups": {g: len(ns) for g, ns in self.nodes_by_group.items()},
            "node_ids": list(self.nodes_by_id.keys())[:10],
        }
    
    def query(self, concept: str) -> list[dict]:
        """BFS: find nodes matching concept and their neighbors."""
        matches = [n for n in self.graph["nodes"] if concept.lower() in n["label"].lower() or concept.lower() in n["id"].lower()]
        results = []
        for m in matches:
            neighbors = []
            for e in self.graph["edges"]:
                src = e["source"] if isinstance(e["source"], str) else e["source"].get("id", "")
                tgt = e["target"] if isinstance(e["target"], str) else e["target"].get("id", "")
                if src == m["id"]:
                    nbr = self.nodes_by_id.get(tgt)
                    if nbr: neighbors.append({"node": nbr["label"], "relation": e.get("label", "related_to")})
                if tgt == m["id"]:
                    nbr = self.nodes_by_id.get(src)
                    if nbr: neighbors.append({"node": nbr["label"], "relation": e.get("label", "related_to")})
            results.append({"concept": m["label"], "group": m["group"], "desc": m.get("description",""), "neighbors": neighbors[:8]})
        return results
    
    def get_node(self, node_id: str) -> dict | None:
        return self.nodes_by_id.get(node_id)
    
    def get_garment_subtypes(self, garment: str) -> list[str]:
        """Get Fashionpedia subtypes for a garment type."""
        gid = f"garment_{garment.lower()}"
        subtypes = []
        for e in self.graph["edges"]:
            src = e["source"] if isinstance(e["source"], str) else e["source"].get("id", "")
            if src == gid and e.get("label") == "has_subtype":
                tgt = e["target"] if isinstance(e["target"], str) else e["target"].get("id", "")
                n = self.nodes_by_id.get(tgt)
                if n: subtypes.append(n["label"])
        return subtypes

# ─── Memory Store ──────────────────────────────────────────────────────

class LuxorMemoryStore:
    """supermemory-style persistent user memory."""
    
    def __init__(self, path=MEMORY_STORE_PATH):
        self.path = path
        self.store = self._load()
    
    def _load(self) -> dict:
        if os.path.exists(self.path):
            with open(self.path) as f:
                return json.load(f)
        store = {
            "version": "1.0", "created_at": time.time(),
            "users": {}, "outfit_history": [], "style_dna": {}, "preferences": {}
        }
        self._save(store)
        return store
    
    def _save(self, store=None):
        if store is None: store = self.store
        with open(self.path, 'w') as f:
            json.dump(store, f, indent=2)
    
    def get_user(self, user_id: str) -> dict:
        if user_id not in self.store["users"]:
            self.store["users"][user_id] = {
                "created_at": time.time(), "preferences": {}, "history": [],
                "style_evolution": {"looks_analyzed": 0, "dominant_style": None, "average_score": 0}
            }
            self._save()
        return self.store["users"][user_id]
    
    def set_preference(self, user_id: str, key: str, value):
        user = self.get_user(user_id)
        user["preferences"][key] = value
        self._save()
    
    def get_preferences(self, user_id: str) -> dict:
        return self.get_user(user_id).get("preferences", {})
    
    def record_analysis(self, user_id: str, analysis: dict):
        user = self.get_user(user_id)
        entry = {
            "timestamp": time.time(),
            "id": uuid.uuid4().hex[:8],
            "style": analysis.get("overallStyle"),
            "score": analysis.get("styleScore"),
            "season": analysis.get("seasonalFit"),
            "colors": [c["name"] for c in analysis.get("colorPalette", {}).get("colors", [])[:4]],
            "garments": [g["type"] for g in analysis.get("detectedGarments", [])[:4]],
            "strengths": analysis.get("strengths", [])[:2],
        }
        self.store["outfit_history"].append(entry)
        # Update style evolution
        evo = user["style_evolution"]
        evo["looks_analyzed"] = evo.get("looks_analyzed", 0) + 1
        evo["dominant_style"] = entry["style"]
        scores = [h.get("score", 0) for h in self.store["outfit_history"] if h.get("style") == entry["style"]]
        evo["average_score"] = sum(scores) / len(scores) if scores else entry["score"]
        self._save()
        return entry
    
    def get_history(self, user_id: str, limit: int = 10) -> list:
        user = self.get_user(user_id)
        user_history = [h for h in self.store["outfit_history"] 
                       if user_id in [u for u in self.store["users"] if self.store["users"][u].get("history")]]
        # Fall back to all history keyed by tracking
        all_for_user = []
        for h in self.store["outfit_history"]:
            # Check if any user preference references this
            pass
        return all_for_user[:limit]
    
    def get_style_evolution(self, user_id: str) -> dict:
        user = self.get_user(user_id)
        return user.get("style_evolution", {})

# ─── Full Pipeline ─────────────────────────────────────────────────────

class DressingRoomPipeline:
    """
    Complete Dressing Room pipeline:
    Image → Analysis → Critique → Graph Query → Memory → Recommendations
    """
    
    def __init__(self):
        self.graph = FashionKnowledgeGraph()
        self.memory = LuxorMemoryStore()
        self.kb = self._load_kb()
        self.vice = self._load_vice()
    
    def _load_kb(self):
        if os.path.exists(KNOWLEDGE_BASE_PATH):
            with open(KNOWLEDGE_BASE_PATH) as f:
                return json.load(f)
        return {}
    
    def _load_vice(self):
        if os.path.exists(VICE_RULES_PATH):
            with open(VICE_RULES_PATH) as f:
                return json.load(f)
        return {}
    
    def run_full_pipeline(self, image_url: str, user_id: str = "anonymous") -> dict:
        """End-to-end: download → analyze → critique → graph query → memory → recommend."""
        result = {
            "pipeline_version": "1.0",
            "timestamp": time.time(),
            "user_id": user_id,
            "image_url": image_url[:60] + "..." if len(image_url) > 60 else image_url,
        }
        
        # Step 1: Check if server is running locally, else use analysis functions directly
        try:
            from luxor_analysis_server import _analyze_image, _download_image, _vice_critique
            from PIL import Image
            img = _download_image(image_url)
            if img is None:
                result["error"] = "Could not download image"
                return result
            
            # Step 2: Analyze
            analysis = _analyze_image(img)
            result["analysis"] = analysis
            
            # Step 3: VICE Critique
            critique = _vice_critique(img)
            result["vice_critique"] = critique
            
        except Exception as e:
            result["error"] = f"Analysis failed: {e}"
            result["analysis_fallback"] = True
            return result
        
        # Step 4: Graph query — find related concepts
        style = analysis.get("overallStyle", "")
        graph_insights = []
        if style:
            matches = self.graph.query(style)
            for m in matches[:3]:
                graph_insights.append({
                    "concept": m["concept"],
                    "neighbors": [n["node"] for n in m.get("neighbors", [])[:5]]
                })
        result["graph_insights"] = graph_insights
        
        # Step 5: Garment-specific knowledge
        garments = [g["type"] for g in analysis.get("detectedGarments", [])[:3]]
        garment_knowledge = {}
        for g in garments:
            subtypes = self.graph.get_garment_subtypes(g)
            if subtypes:
                garment_knowledge[g] = subtypes[:4]
        result["garment_knowledge"] = garment_knowledge
        
        # Step 6: Fabric knowledge from graph
        season = analysis.get("seasonalFit", "")
        recommended_fabrics = analysis.get("fabricSuggestions", [])
        fabric_knowledge = []
        for f in recommended_fabrics[:3]:
            node = self.graph.get_node(f"fabric_{f.lower()}")
            if node:
                fabric_knowledge.append({"name": f, "description": node.get("description", "")})
            else:
                fabric_knowledge.append({"name": f, "description": "Popular fashion fabric"})
        result["fabric_knowledge"] = fabric_knowledge
        
        # Step 7: Memory — persist this analysis
        memory_entry = self.memory.record_analysis(user_id, analysis)
        result["memory_entry_id"] = memory_entry.get("id", "")
        
        # Step 8: Personalized recommendations from memory
        prefs = self.memory.get_preferences(user_id)
        evolution = self.memory.get_style_evolution(user_id)
        result["user_profile"] = {
            "preferences": prefs,
            "style_evolution": evolution,
        }
        
        # Step 9: Aggregated Dressing Room recommendations
        result["dressing_room_recommendations"] = self._generate_recommendations(
            analysis, critique, garment_knowledge, fabric_knowledge, prefs
        )
        
        return result
    
    def _generate_recommendations(self, analysis: dict, critique: dict,
                                   garment_knowledge: dict, fabric_knowledge: list,
                                   preferences: dict) -> dict:
        """Generate actionable Dressing Room recommendations from all knowledge."""
        style = analysis.get("overallStyle", "Classic")
        score = analysis.get("styleScore", 50)
        verdict = critique.get("verdict", "NEUTRAL")
        
        recs = {
            "style_match": f"Your current look aligns with {style} aesthetics",
            "improvement_tip": "",
            "try_this": [],
            "avoid_that": [],
            "complete_the_look": [],
        }
        
        # Based on VICE verdict
        if verdict in ("DON'T", "HARD DON'T"):
            recs["improvement_tip"] = "The look needs refinement — consider simplifying the palette and focusing on fit"
            recs["avoid_that"].append("Too many competing elements — subtract one accessory")
        elif verdict == "NEUTRAL":
            recs["improvement_tip"] = "Solid foundation — add one statement piece to elevate from neutral to DO"
            recs["try_this"].append("Add a signature accessory that reflects your personality")
        else:  # DO or STRONG DO
            recs["improvement_tip"] = "Strong look! You're pulling it off with confidence"
            recs["complete_the_look"].append("Consider complementary footwear or bag")
        
        # Fabric recommendations from knowledge graph
        if fabric_knowledge:
            f = fabric_knowledge[0]
            recs["try_this"].append(f"Try {f['name']} fabric — {f['description']}")
        
        # Garment subtype recommendations from graph
        for gtype, subtypes in garment_knowledge.items():
            if subtypes:
                recs["try_this"].append(f"For {gtype}, consider {subtypes[0]} style as an option")
        
        # Score-based tips
        if score < 60:
            recs["improvement_tip"] = (recs["improvement_tip"] or "") + ". Consider the VICE principle: 'have a sense of humor about it'"
        elif score >= 80:
            recs["complete_the_look"].append("What you're wearing works — the key is owning it")
        
        # Occasion-based from analysis
        occasions = analysis.get("occasionRatings", [])
        best_occasion = max(occasions, key=lambda o: o["score"]) if occasions else {}
        if best_occasion:
            recs["best_for"] = f"Best suited for: {best_occasion['occasion']} ({best_occasion['score']}/100)"
        
        return recs


# ─── CLI ───────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Luxor Hub Dressing Room Pipeline")
    parser.add_argument("--image", help="Image URL to analyze")
    parser.add_argument("--user", default="anonymous", help="User ID for memory")
    parser.add_argument("--quick", action="store_true", help="Skip memory/graph steps")
    parser.add_argument("--history", action="store_true", help="Show user history")
    parser.add_argument("--graph-stats", action="store_true", help="Show knowledge graph stats")
    parser.add_argument("--query", help="Query knowledge graph for a concept")
    args = parser.parse_args()
    
    pipeline = DressingRoomPipeline()
    
    if args.graph_stats:
        stats = pipeline.graph.stats()
        print(json.dumps(stats, indent=2))
        sys.exit(0)
    
    if args.query:
        results = pipeline.graph.query(args.query)
        print(json.dumps(results, indent=2, default=str))
        sys.exit(0)
    
    if args.history:
        history = pipeline.memory.get_history(args.user)
        print(json.dumps(history, indent=2, default=str))
        sys.exit(0)
    
    if args.image:
        result = pipeline.run_full_pipeline(args.image, args.user)
        print(json.dumps(result, indent=2, default=str))
        sys.exit(0)
    
    parser.print_help()

if __name__ == "__main__":
    main()
