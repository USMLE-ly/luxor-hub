---
name: turbovec
description: Build and search high-performance vector indexes. SIMD-accelerated approximate nearest neighbor (ANN) search with product quantization. Use for embedding/vector search, RAG pipelines, and similarity search.
---

# turbovec

High-performance vector ANN search. SIMD-optimized (AVX512/NEON). Uses the `turbovec` Python package.

## Usage

```bash
cd /root/Documents/Codex/2026-06-08/make-the-deepseek-v4-flash-free
source .venv/bin/activate

# Python
import turbovec as tv
import numpy as np

# TurboQuantIndex (recommended)
index = tv.TurboQuantIndex()
index.add(embeddings)  # numpy float32 array (n, d)
index.prepare()

# Search
distances, indices = index.search(query, k=10)

# Save/load
index.write("index.tv")
loaded = tv.TurboQuantIndex.load("index.tv")

# IdMapIndex (for custom IDs — may have numpy version issues)
# Use add_with_ids(embeddings, ids_array) then prepare()
```

## Parameters

| Method | Args | Description |
|--------|------|-------------|
| `TurboQuantIndex.add()` | embeddings (n, d) float32 | Add vectors |
| `.prepare()` | none | Build index (required after add) |
| `.search()` | query (1, d), k | Search nearest neighbors |
| `.write()` | path | Save index to disk |
| `.load()` | path | Load index from disk |
