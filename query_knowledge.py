#!/usr/bin/env python3
"""
KNOWLEDGE BASE QUERY ENGINE — SHANNON-Ω / FABLE 5
Search across any domain's knowledge base using vector similarity + keyword.
Integrates with SHANNON-Ω API for Q&A over ingested content.

Usage:
  python3 query_knowledge.py "What are Python decorators?" --domain coding
  python3 query_knowledge.py "Explain fashion design principles" --domain fashion
  python3 query_knowledge.py "multi-domain question" --domain all
"""
import os, sys, json, glob, argparse, re
from datetime import datetime

PROJECT = os.path.dirname(os.path.abspath(__file__))
KBASE = os.path.join(PROJECT, "knowledge_base")

def list_domains():
    """List all domains with content in the knowledge base."""
    domains = []
    for d in sorted(os.listdir(KBASE)):
        manifest = os.path.join(KBASE, d, "manifest.json")
        if os.path.exists(manifest):
            with open(manifest) as f:
                entries = json.load(f)
            total_chunks = sum(e.get("num_chunks", 0) for e in entries)
            total_chars = sum(e.get("total_chars", 0) for e in entries)
            domains.append((d, len(entries), total_chunks, total_chars))
    return domains

def search_knowledge(query, domain="all", top_k=5):
    """Simple TF-IDF-like keyword search across knowledge base chunks."""
    query_terms = set(query.lower().split())
    results = []
    
    if domain == "all":
        domains = [d for d in os.listdir(KBASE) if os.path.isdir(os.path.join(KBASE, d))]
    else:
        domains = [domain] if os.path.isdir(os.path.join(KBASE, domain)) else []
    
    for d in domains:
        chunks_dir = os.path.join(KBASE, d, "chunks")
        if not os.path.isdir(chunks_dir):
            continue
        for cf in sorted(glob.glob(os.path.join(chunks_dir, "*.json"))):
            with open(cf) as f:
                data = json.load(f)
            for i, chunk in enumerate(data.get("chunks", [])):
                chunk_lower = chunk.lower()
                # Score by term frequency
                score = sum(1 for t in query_terms if t in chunk_lower)
                if score > 0:
                    # Boost for title matches
                    fname = data.get("source", "").lower()
                    if any(t in fname for t in query_terms):
                        score *= 2
                    results.append({
                        "score": score,
                        "domain": d,
                        "source": data.get("source", "?"),
                        "chunk_idx": i,
                        "content": chunk[:500] + ("..." if len(chunk) > 500 else ""),
                        "total_chars": len(chunk),
                    })
    
    # Sort by score
    results.sort(key=lambda x: -x["score"])
    return results[:top_k]

def query_with_llm(question, context, domain):
    """Send question + context to SHANNON-Ω API for Q&A."""
    import requests, sys
    sys.path.insert(0, PROJECT)
    from api_interact import chat
    
    system_context = f"""You are SHANNON-Ω / FABLE 5 answering based on ingested knowledge.
Domain: {domain}
Context from knowledge base:
{context}

Answer the question using ONLY the provided context. Be specific and cite sources."""
    
    prompt = f"{system_context}\n\nQuestion: {question}"
    result = chat(prompt, mode="shannon", persona="cl4r1t4s", max_tokens=4000)
    return result

def main():
    parser = argparse.ArgumentParser(description="SHANNON-Ω Knowledge Base Query Engine")
    parser.add_argument("query", nargs="*", help="Search query")
    parser.add_argument("--domain", default="all", help="Domain to search (coding, fashion, etc.)")
    parser.add_argument("--top-k", type=int, default=5, help="Number of results")
    parser.add_argument("--list", action="store_true", help="List domains with stats")
    parser.add_argument("--stats", action="store_true", help="Show knowledge base statistics")
    parser.add_argument("--ask", action="store_true", help="Use LLM to answer based on context")
    args = parser.parse_args()
    
    if args.list or args.stats:
        print("📚 SHANNON-Ω KNOWLEDGE BASE")
        print("="*60)
        domains = list_domains()
        total_files = 0
        total_chunks = 0
        total_chars = 0
        for d, files, chunks, chars in domains:
            print(f"  {d:20s} {files:3d} files, {chunks:5d} chunks, {chars:10,d} chars")
            total_files += files
            total_chunks += chunks
            total_chars += chars
        print("="*60)
        print(f"  {'TOTAL':20s} {total_files:3d} files, {total_chunks:5d} chunks, {total_chars:10,d} chars")
        return
    
    query = " ".join(args.query) if args.query else input("Query: ")
    if not query:
        return
    
    print(f"\n🔍 Searching [{args.domain}] for: {query}")
    print("="*60)
    
    results = search_knowledge(query, args.domain, args.top_k)
    
    if not results:
        print("No results found.")
        return
    
    for i, r in enumerate(results, 1):
        print(f"\n[{i}] [{r['domain']}] {r['source']}")
        print(f"    Score: {r['score']} | {r['total_chars']} chars")
        print(f"    {r['content']}")
    
    if args.ask:
        print(f"\n🤖 Asking SHANNON-Ω...")
        context = "\n\n".join([f"[{r['domain']}] {r['source']}:\n{r['content']}" for r in results])
        result = query_with_llm(query, context, args.domain)
        if isinstance(result, dict) and "error" not in result:
            msg = result.get("choices", [{}])[0].get("message", {})
            content = msg.get("content", "")
            reasoning = msg.get("reasoning_content", "")
            if reasoning:
                print(f"\n── Reasoning ──\n{reasoning[:300]}")
            print(f"\n── Answer ──\n{content}")

if __name__ == "__main__":
    main()
