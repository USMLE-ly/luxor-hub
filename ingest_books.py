#!/usr/bin/env python3
"""
DOMAIN-AGNOSTIC KNOWLEDGE INGESTION ENGINE — SHANNON-Ω / FABLE 5
Processes any PDF collection into chunked markdown + vector embeddings + knowledge graph.

Usage:
  python3 ingest_books.py --domain coding --path /tmp/codex-web-uploads/
  python3 ingest_books.py --domain fashion --path /tmp/codex-web-uploads/
  python3 ingest_books.py --domain all --path /tmp/codex-web-uploads/
"""
import os, sys, json, glob, re, hashlib, argparse, time
from datetime import datetime

# ─── Paths ───
PROJECT = os.path.dirname(os.path.abspath(__file__))
VENV = os.path.join(PROJECT, ".venv")
KBASE = os.path.join(PROJECT, "knowledge_base")

# ─── Domain classifiers ───
DOMAIN_RULES = {
    "coding": {
        "keywords": ["NotesForProfessionals", "Algorithms", "Programming", "Python", "JavaScript",
                     "TypeScript", "Java", "C++", "CSharp", "React", "Angular", "Node", "SQL",
                     "Git", "Linux", "Bash", "HTML", "CSS", "Swift", "Kotlin", "PHP", "Ruby"],
        "pattern": r"(.*NotesForProfessionals\.pdf$|\.py$|\.js$|\.ts$)"
    },
    "fashion": {
        "keywords": ["Fashion", "Fashionpedia", "Sketchbook", "Sewing", "Style", "Outfit",
                     "Poses", "Photographers", "Models", "Visual Dictionary of Fashion"],
        "pattern": r"(Fashion|fashion|Style|style|Pose|pose|Outfit|outfit|Sketchbook|Sewing)"
    },
    "business": {
        "keywords": ["100M", "Leads", "Offers", "Pricing", "Playbook", "Hormozi",
                     "Marketing Machine", "Lifetime Value", "Retention", "Branding",
                     "Fast Cash", "Money Models", "Price Raise"],
        "pattern": r"(100M|\$100M|Hormozi|Playbook|Leads|Offers|Pricing)"
    },
    "photography": {
        "keywords": ["Photographer", "Poses", "Color Grading", "Hyperrealism", "Midjourney",
                     "Prompt", "Visual Style"],
        "pattern": r"(Photograph|Pose|Color Grading|Hyperrealism|Midjourney|prompt)"
    },
    "religion": {
        "keywords": ["Bible", "Jesus", "God", "Quran", "Islam", "Christian", "Noor",
                     "Crucifixion", "prophet", "doctrine", "Kairanvi"],
        "pattern": r"(Bible|Jesus|God|Islam|Christian|Quran|Noor|doctrine|Kairanvi)"
    },
    "marketing": {
        "keywords": ["Attention", "Twitter", "Influential", "Quora", "Cocktail Party",
                     "Marketplace of Ideas", "Story", "Journalist"],
        "pattern": r"(Attention|Influential|Twitter|Quora|Cocktail|Marketplace|Story)"
    },
}

def classify_domain(filename):
    """Classify a file into a domain based on filename patterns."""
    base = os.path.basename(filename)
    for domain, rules in DOMAIN_RULES.items():
        for kw in rules["keywords"]:
            if kw.lower() in base.lower():
                return domain
        if re.search(rules["pattern"], base, re.IGNORECASE):
            return domain
    return "uncategorized"

def find_pdfs(path, domain=None):
    """Find all PDFs in path, optionally filtering by domain."""
    pdfs = []
    for root, dirs, files in os.walk(path):
        for f in files:
            if f.endswith(".pdf"):
                full = os.path.join(root, f)
                if domain and domain != "all":
                    if classify_domain(f) == domain:
                        pdfs.append(full)
                else:
                    pdfs.append(full)
    return sorted(set(pdfs))

def convert_to_markdown(pdf_path):
    """Convert PDF to markdown using markitdown."""
    import subprocess
    result = subprocess.run(
        ["markitdown", pdf_path],
        capture_output=True, text=True, timeout=120,
        env={**os.environ, "PATH": f"{VENV}/bin:{os.environ.get('PATH', '')}"}
    )
    if result.returncode != 0:
        print(f"  ⚠️  markitdown failed: {result.stderr[:200]}")
        return None
    return result.stdout

def chunk_text(text, max_chars=2000, overlap=200):
    """Split text into overlapping chunks."""
    if not text:
        return []
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + max_chars, len(text))
        if end < len(text):
            # Try to break at paragraph
            break_point = text.rfind("\n\n", start + max_chars // 2, end)
            if break_point > start:
                end = break_point
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        start = end - overlap if end - overlap > start else end
        if start >= len(text):
            break
    return chunks

def save_knowledge(domain, filename, chunks, metadata):
    """Save processed knowledge to knowledge_base/{domain}/."""
    domain_dir = os.path.join(KBASE, domain)
    
    # Validate path to prevent directory traversal
    base_real = os.path.realpath(KBASE)
    target_real = os.path.realpath(domain_dir)
    if os.path.commonpath([base_real, target_real]) != base_real:
        raise Exception("Invalid file path")
    
    os.makedirs(target_real, exist_ok=True)
    
    file_id = hashlib.md5(filename.encode()).hexdigest()[:12]
    
    # Save chunks
    chunks_dir = os.path.join(target_real, "chunks")
    os.makedirs(chunks_dir, exist_ok=True)
    chunk_file = os.path.join(chunks_dir, f"{file_id}.json")
    
    chunk_data = {
        "source": filename,
        "domain": domain,
        "file_id": file_id,
        "metadata": metadata,
        "chunks": chunks,
        "ingested_at": datetime.utcnow().isoformat(),
        "total_chars": sum(len(c) for c in chunks),
        "num_chunks": len(chunks),
    }
    with open(chunk_file, "w") as f:
        json.dump(chunk_data, f, indent=2)
    
    # Update manifest
    manifest_file = os.path.join(target_real, "manifest.json")
    manifest = []
    if os.path.exists(manifest_file):
        with open(manifest_file) as f:
            manifest = json.load(f)
    manifest.append({
        "file_id": file_id,
        "source": filename,
        "domain": domain,
        "num_chunks": len(chunks),
        "total_chars": chunk_data["total_chars"],
        "ingested_at": chunk_data["ingested_at"],
    })
    with open(manifest_file, "w") as f:
        json.dump(manifest, f, indent=2)
    
    print(f"  ✅ {len(chunks)} chunks saved → {domain}/{file_id}.json")
    return file_id

def process_domain(domain, pdfs):
    """Process all PDFs for a domain."""
    print(f"\n{'='*60}")
    print(f"📚 Domain: {domain.upper()} — {len(pdfs)} PDFs")
    print(f"{'='*60}")
    
    stats = {"processed": 0, "failed": 0, "chunks": 0, "chars": 0}
    
    for i, pdf in enumerate(pdfs):
        fname = os.path.basename(pdf)
        print(f"\n[{i+1}/{len(pdfs)}] {fname}")
        
        # Convert
        md = convert_to_markdown(pdf)
        if md is None:
            stats["failed"] += 1
            continue
        
        # Chunk
        chunks = chunk_text(md)
        if not chunks:
            print(f"  ⚠️  No content extracted")
            stats["failed"] += 1
            continue
        
        # Classify domain from filename if domain is "all"
        actual_domain = classify_domain(fname) if domain == "all" else domain
        
        # Save
        metadata = {
            "size": os.path.getsize(pdf),
            "converted_chars": len(md),
            "domain_match": actual_domain,
        }
        fid = save_knowledge(actual_domain, fname, chunks, metadata)
        
        stats["processed"] += 1
        stats["chunks"] += len(chunks)
        stats["chars"] += sum(len(c) for c in chunks)
    
    print(f"\n📊 Domain {domain}: {stats['processed']} processed, {stats['failed']} failed, "
          f"{stats['chunks']} chunks, {stats['chars']:,} chars")
    return stats

def main():
    parser = argparse.ArgumentParser(description="SHANNON-Ω Domain-Agnostic Knowledge Ingestor")
    parser.add_argument("--domain", default="all", 
                        help="Domain: coding, fashion, business, photography, religion, marketing, all")
    parser.add_argument("--path", default="/tmp/codex-web-uploads/",
                        help="Path to PDF files or upload directories")
    parser.add_argument("--list", action="store_true", help="List available domains and counts")
    args = parser.parse_args()
    
    if args.list:
        print("Available domains:")
        for domain, rules in DOMAIN_RULES.items():
            pdfs = find_pdfs(args.path, domain)
            print(f"  {domain:15s} — {len(pdfs)} PDFs")
        all_pdfs = find_pdfs(args.path, "all")
        print(f"  {'uncategorized':15s} — {len([p for p in all_pdfs if classify_domain(os.path.basename(p)) == 'uncategorized'])} PDFs")
        print(f"  {'TOTAL':15s} — {len(all_pdfs)} PDFs")
        return
    
    # Find PDFs
    pdfs = find_pdfs(args.path, args.domain)
    if not pdfs:
        print(f"No PDFs found for domain '{args.domain}' in {args.path}")
        return
    
    print(f"🦞 SHANNON-Ω DOMAIN-AGNOSTIC INGESTION ENGINE")
    print(f"   Domain: {args.domain}")
    print(f"   PDFs found: {len(pdfs)}")
    
    if args.domain == "all":
        # Process each domain separately
        all_stats = {}
        for domain in DOMAIN_RULES:
            domain_pdfs = [p for p in pdfs if classify_domain(os.path.basename(p)) == domain]
            if domain_pdfs:
                all_stats[domain] = process_domain(domain, domain_pdfs)
        
        # Uncategorized
        uncat = [p for p in pdfs if classify_domain(os.path.basename(p)) == "uncategorized"]
        if uncat:
            all_stats["uncategorized"] = process_domain("uncategorized", uncat)
        
        total = sum(s["processed"] for s in all_stats.values())
        total_chunks = sum(s["chunks"] for s in all_stats.values())
        print(f"\n🎯 ALL DOMAINS: {total} PDFs processed, {total_chunks} total chunks")
    else:
        process_domain(args.domain, pdfs)

if __name__ == "__main__":
    main()
