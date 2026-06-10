#!/usr/bin/env python3
"""Enrich graph node descriptions using actual book chunks."""
import json
import re
import sys
from collections import Counter

CHUNKS_FILE = "hormozi_books/chunks/all_chunks.json"
GRAPH_FILE = "hormozi_books/graph/graph.json"

# ─── TF-IDF setup ───
print("📚 Loading chunks...")
with open(CHUNKS_FILE) as f:
    chunks = json.load(f)
print(f"   {len(chunks)} chunks loaded")

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

texts = [c['text'] for c in chunks]
vec = TfidfVectorizer(max_features=5000, stop_words='english', ngram_range=(1,2))
matrix = vec.fit_transform(texts)
print(f"   TF-IDF matrix: {matrix.shape}")

# ─── Load graph ───
print("📊 Loading graph...")
with open(GRAPH_FILE) as f:
    graph = json.load(f)
print(f"   {len(graph['nodes'])} nodes, {len(graph['edges'])} edges")

# ─── Helper: retrieve relevant chunks for a concept ───
def retrieve_chunks(query, k=5, min_score=0.05):
    if not query.strip():
        return []
    qv = vec.transform([query])
    scores = cosine_similarity(qv, matrix).flatten()
    results = []
    for idx in scores.argsort()[::-1]:
        if scores[idx] < min_score:
            break
        results.append({
            'score': float(scores[idx]),
            'text': chunks[idx]['text'],
            'source': chunks[idx].get('source', ''),
        })
        if len(results) >= k:
            break
    return results

# ─── For each node, find relevant chunks and build a description ───
print("\n🔍 Enriching node descriptions...")

stats = {'before_short': 0, 'after_short': 0, 'enriched': 0}

for node in graph['nodes']:
    label = node['label']
    node_id = node['id']
    old_desc = node['metadata'].get('description', '')
    
    # Skip already-detailed descriptions (more than 80 chars of substance)
    if len(old_desc) > 80 and 'Concept from' not in old_desc:
        stats['after_short'] += 1
        continue
    
    stats['before_short'] += 1
    
    # Search chunks using the concept label
    results = retrieve_chunks(label, k=4)
    
    if not results:
        # Try with related terms
        results = retrieve_chunks(label + " " + label, k=3, min_score=0.02)
    
    if results:
        # Extract key sentences from best chunks
        best_text = results[0]['text']
        source = results[0]['source']
        
        # Take first substantive paragraph(s)
        paragraphs = [p.strip() for p in best_text.split('\n\n') if len(p.strip()) > 40]
        if not paragraphs:
            paragraphs = [p.strip() for p in best_text.split('\n') if len(p.strip()) > 40]
        
        if paragraphs:
            # Use first 2-4 sentences
            selected = paragraphs[0]
            # If still too short, add next paragraph
            if len(selected) < 100 and len(paragraphs) > 1:
                selected += "\n\n" + paragraphs[1]
            
            # Clean up
            selected = re.sub(r'\s+', ' ', selected).strip()
            selected = selected.replace('***', '').strip()
            selected = re.sub(r'^table of contents.*?\n', '', selected, flags=re.IGNORECASE | re.DOTALL)
            selected = selected[:500] if len(selected) > 500 else selected
            
            new_desc = f"From {source}: {selected}"
            node['metadata']['description'] = new_desc
            stats['enriched'] += 1
            print(f"  ✅ {label:30s} <- {source[:30]} ({len(selected)} chars)")
        else:
            # Fallback: use the old source-based description
            print(f"  ⚠️  {label:30s} <- no paragraphs found, keeping old")
    else:
        print(f"  ❌ {label:30s} <- no chunks found")

# ─── Save ───
print(f"\n💾 Saving enriched graph...")
with open(GRAPH_FILE, 'w') as f:
    json.dump(graph, f, indent=2)

print(f"\n📊 Stats:")
print(f"   Nodes enriched:     {stats['enriched']}")
print(f"   Already detailed:   {stats['after_short']}")
print(f"   Total nodes:        {len(graph['nodes'])}")
print(f"\n✅ Done!")
