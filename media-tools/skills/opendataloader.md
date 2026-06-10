---
name: opendataloader-pdf
description: Extract text, tables, images, and metadata from PDF documents. Supports JSON, text, HTML, Markdown, and tagged-PDF output formats. Use when processing PDF files for text extraction or table extraction.
---

# opendataloader-pdf

High-performance PDF extraction. Uses the `opendataloader-pdf` Python package.

## Usage

```bash
cd /root/Documents/Codex/2026-06-08/make-the-deepseek-v4-flash-free
source .venv/bin/activate

# CLI
opendataloader-pdf input.pdf --format text        # plain text
opendataloader-pdf input.pdf --format markdown     # markdown
opendataloader-pdf input.pdf --format json         # structured JSON
opendataloader-pdf input.pdf --format markdown --image-output embedded --pages 1-5

# Python
from opendataloader_pdf import convert
convert("input.pdf", format="markdown", image_output="embedded")
```

## Parameters

| Arg | Type | Default | Description |
|-----|------|---------|-------------|
| input | str | required | Input PDF file path |
| format | str | json | Output format: json, text, html, markdown, tagged-pdf |
| pages | str | all | Page range e.g. "1,3,5-7" |
| image-output | str | external | Image mode: off, embedded, external |
| table-method | str | default | Table detection: default, cluster |
| output-dir | str | input dir | Output directory |
