---
name: markitdown
description: Convert any file to Markdown for LLM consumption. Supports PDF, DOCX, PPTX, XLSX, images (OCR), audio, HTML, CSV, JSON, XML, EPUB, ZIP. Use when media/files are uploaded and need to be converted to Markdown text.
---

# markitdown

Convert any file format to Markdown. Uses the `markitdown` Python package.

## Usage

```bash
# CLI: Convert file to markdown
cd /root/Documents/Codex/2026-06-08/make-the-deepseek-v4-flash-free
source .venv/bin/activate
markitdown input.pdf > output.md

# Python
from markitdown import MarkItDown
md = MarkItDown()
result = md.convert("document.pdf")
print(result.text_content)
```

## Parameters

| Arg | Type | Default | Description |
|-----|------|---------|-------------|
| input | str | required | Path to input file (PDF, DOCX, PPTX, XLSX, image, audio, HTML, CSV, JSON, XML, EPUB, ZIP) |
| output | str | stdout | Output markdown file path |
