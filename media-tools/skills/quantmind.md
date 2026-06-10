---
name: quantmind
description: Intelligent knowledge extraction and retrieval framework for quantitative finance. LLM-powered pipeline for extracting, structuring, and querying financial data from documents.
---

# quantmind

Financial document knowledge extraction. Uses the `quantmind` Python package.

## Usage

```bash
cd /root/Documents/Codex/2026-06-08/make-the-deepseek-v4-flash-free
source .venv/bin/activate

# Python
import quantmind
from quantmind import agents, core, models
```

## Parameters

| Arg | Type | Default | Description |
|-----|------|---------|-------------|
| action | str | required | `extract`, `query`, or `build_index` |
| input | str | required | Path to document or directory |
| query | str | - | Query string for search |
