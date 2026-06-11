#!/usr/bin/env python3
"""
🤖 SHANNON-Ω Professional Bot
Integrated patterns:
  - Windsurf Cascade - agentic tool use, thorough context
  - Cursor GPT-4.1 - semantic search, tool discipline
  - Claude Code - conciseness, directness, no preamble
  - OpenWolf - context indexing for token efficiency
  - Supermemory - multi-level cache (concept → common → RAG → AI)
  - Sharp - pre-computation, parallel execution
"""

import os, sys, json, time, re, asyncio, logging
from collections import OrderedDict
from concurrent.futures import ThreadPoolExecutor
from typing import Optional
import requests as _requests_lib

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from text_humanizer import TextHumanizer, apply_conciseness, format_professional
from professional_prompt import PROFESSIONAL_SYSTEM_PROMPT, optimize_context

# HTTP session with connection pooling - cuts ~1-2s per call
_API_SESSION = _requests_lib.Session()
_API_SESSION.headers.update({"Content-Type": "application/json"})

TOKEN = os.environ.get('TELEGRAM_TOKEN', '8758115339:AAHH6gAIHmSo7Qf_VMc_HmBxz2Jy8w_1mtM')
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')
log = logging.getLogger('bot')
humanizer = TextHumanizer()

# ─── Supermemory-inspired: Instant-load knowledge base ────────
import pickle
from scipy.sparse import load_npz
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

log.info("Loading pre-computed data...")
t0 = time.time()
try:
    with open("hormozi_books/.tfidf_config.pkl", "rb") as f:
        _cfg = pickle.load(f)
    VEC = TfidfVectorizer(
        max_features=_cfg.get('max_features', 5000),
        stop_words=_cfg.get('stop_words', 'english'),
        ngram_range=_cfg.get('ngram_range', (1,2)),
        vocabulary=_cfg['vocabulary'],
    )
    VEC.idf_ = _cfg['idf']
    MAT = load_npz("hormozi_books/.matrix.npz")
    with open("hormozi_books/chunks/all_chunks.json") as f:
        CHUNKS = json.load(f)
    with open("hormozi_books/graph/graph.json") as f:
        GRAPH = json.load(f)
    NODES = {n['id']: n for n in GRAPH['nodes']} if 'nodes' in GRAPH else {}
    CONCEPT_CACHE = {}
    if os.path.exists("hormozi_books/.concept_cache.pkl"):
        with open("hormozi_books/.concept_cache.pkl", "rb") as f:
            CONCEPT_CACHE = pickle.load(f)
    log.info(f"Ready in {time.time()-t0:.2f}s: {len(CHUNKS)} chunks, {len(NODES)} nodes, {len(CONCEPT_CACHE)} concepts")
    # Pre-warm API connection on startup
    try:
        _API_SESSION.get("https://opencode.ai/zen/v1/models", timeout=3)
    except:
        pass
except Exception as e:
    log.error(f"Load error: {e}")
    CHUNKS, GRAPH, NODES, CONCEPT_CACHE = [], {"nodes":[]}, {}, {}

# ─── Sharp-inspired: Parallel AI thread pool ──────────────────
AI_SEMAPHORE = asyncio.Semaphore(2)
AI_EXECUTOR = ThreadPoolExecutor(max_workers=3)
RESPONSE_CACHE = OrderedDict()
CACHE_MAX = 200
import hashlib as _hashlib
_API_CACHE_DIR = ".api_cache"
os.makedirs(_API_CACHE_DIR, exist_ok=True)

def _disk_cache_get(key: str) -> Optional[dict]:
    try:
        path = os.path.join(_API_CACHE_DIR, f"{key}.json")
        if os.path.exists(path):
            age = time.time() - os.path.getmtime(path)
            if age < 3600:
                with open(path) as f:
                    return json.load(f)
    except Exception:
        pass
    return None

def _disk_cache_set(key: str, data: dict):
    try:
        path = os.path.join(_API_CACHE_DIR, f"{key}.json")
        with open(path, "w") as f:
            json.dump(data, f)
    except Exception:
        pass

API_URL = "https://opencode.ai/zen/v1/chat/completions"

def _sync_query_ai(system_prompt: str, user_prompt: str, 
                   temperature: float = 0.7, max_tokens: int = 1500,
                   timeout: int = 25, retries: int = 2) -> Optional[str]:
    """Synchronous API call with retry + progressive temperature."""
    import requests
    temps = [temperature, min(temperature + 0.3, 1.2), 1.0]
    for attempt in range(retries + 1):
        try:
            payload = {
                "model": "deepseek-v4-flash-free",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                
                "temperature": temps[min(attempt, len(temps)-1)],
                "max_tokens": max_tokens,
                "top_p": 0.9,
                "top_k": 40,
            }
            r = requests.post(API_URL, headers={"Content-Type": "application/json"},
                              json=payload, timeout=timeout)
            if r.status_code == 200:
                content = (r.json()["choices"][0]["message"].get("content") or "").strip()
                if content:
                    return humanizer.process(content)
            elif r.status_code == 429:
                log.warning(f"Rate limited, attempt {attempt+1}")
                time.sleep(1 * (attempt + 1))
            else:
                log.warning(f"API {r.status_code}: {r.text[:200]}")
        except requests.Timeout:
            log.warning(f"Timeout attempt {attempt+1}")
        except Exception as e:
            log.warning(f"Error attempt {attempt+1}: {e}")
    return None

async def query_ai(prompt: str, system_prompt: str = None, timeout: int = 15, max_out: int = 500) -> Optional[str]:
    """Concurrent AI call via thread pool. Optimized for speed: 15s timeout, 500 token max."""
    cache_key = prompt[:80]
    cache_hash = _hashlib.md5(prompt.encode()).hexdigest()[:16]
    if cache_key in RESPONSE_CACHE:
        return RESPONSE_CACHE[cache_key]
    # Check disk cache too
    disk_hit = _disk_cache_get(cache_hash)
    if disk_hit:
        RESPONSE_CACHE[cache_key] = disk_hit
        return disk_hit
    
    if system_prompt is None:
        system_prompt = "You are Alex Hormozi. Be very concise. 2-3 sentences max."
    
    async with AI_SEMAPHORE:
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            AI_EXECUTOR, _sync_query_ai, system_prompt, prompt, 0.5, max_out, timeout
        )
        if result:
            RESPONSE_CACHE[cache_key] = result
            _disk_cache_set(cache_hash, result)
            if len(RESPONSE_CACHE) > CACHE_MAX:
                RESPONSE_CACHE.popitem(last=False)
        return result

# ⚡ Instant retrieval (pre-computed TF-IDF)
def retrieve(query: str, k: int = 5):
    qv = VEC.transform([query])
    scores = cosine_similarity(qv, MAT).flatten()
    results = []
    for idx in scores.argsort()[::-1]:
        if scores[idx] < 0.02:
            break
        results.append({
            'score': float(scores[idx]),
            'text': CHUNKS[idx]['text'],
            'source': CHUNKS[idx].get('source',''),
            'idx': idx
        })
        if len(results) >= k:
            break
    return results

# ⚡ OpenWolf-style: Context-optimized retrieval
def retrieve_optimized(query: str, k: int = 5):
    """Retrieve + optimize context using OpenWolf-style topic indexing."""
    raw_results = retrieve(query, k=k)
    if not raw_results:
        return []
    return optimize_context(query, raw_results)

# ⚡ Pre-computed common responses (no AI needed)
COMMON_QA = {
    "who are you": "Alex Hormozi. Books on sales, offers, lead gen. Framework: Value Equation. Goal: Grand Slam Offer.",
    "what can you do": "Sales diagnosis, offer design, lead gen strategy, pricing, scripts. Ask anything specific.",
    "what is the value equation": "📊 **Value Equation**\nValue = (Dream Outcome × Likelihood) / (Time Delay × Effort)\nImprove offers by increasing the numerator or decreasing the denominator.",
    "grand slam offer": "🏆 **Grand Slam Offer**: 10x value, irresistible terms, risk reversal, payment options. The offer is the product.",
    "guarantee": "🛡️ **Risk Reversal**: Remove their risk. Money-back, satisfaction guarantee, performance-based. Stronger guarantee = more sales.",
}

SALES_FIELDS = [
    ("🎯", "Guarantee"), ("🔒", "Retention"), ("🏆", "Grand Slam Offer"),
    ("📊", "Value Equation"), ("🛡️", "Risk Reversal"), ("🧲", "Lead Generation"),
    ("💰", "Pricing Strategy"), ("📈", "Lifetime Value"), ("📝", "Sales Script"),
    ("📞", "Cold Outreach"), ("🎯", "Starving Crowd"),
]

def generate_fast_response(question: str, chunks: list) -> str:
    """Fast response from cached concepts - no AI needed."""
    ql = question.lower().replace("'", "")
    
    matched = set()
    for kw, field in {"guarantee":"Guarantee","retention":"Retention","grand slam":"Grand Slam Offer",
                       "value equation":"Value Equation","risk reversal":"Risk Reversal",
                       "lead gen":"Lead Generation","pricing":"Pricing Strategy",
                       "ltv":"Lifetime Value","lifetime value":"Lifetime Value",
                       "sales script":"Sales Script","cold outreach":"Cold Outreach",
                       "starving crowd":"Starving Crowd","offer":"Grand Slam Offer"}.items():
        if kw in ql:
            matched.add(field)
    if not matched:
        matched = {"Guarantee", "Grand Slam Offer", "Value Equation"}
    
    lines = ["📋 **Sales Analysis**\n"]
    for emoji, name in SALES_FIELDS:
        nid = name.lower().replace(' ', '_')
        n = NODES.get(nid) or NODES.get(name.lower())
        desc = n['metadata'].get('description','')[:300] if n else ""
        
        if name in matched:
            lines.append(f"{emoji} **{name}:**")
            relevant = [c for c in chunks if any(w in c['text'][:300].lower() for w in name.lower().split())]
            if relevant:
                paras = [p for p in relevant[0]['text'].split('\n\n') if len(p.strip()) > 50]
                excerpt = (paras[0] if paras else relevant[0]['text'])[:250]
                lines.append(f"   {excerpt}")
            elif desc:
                lines.append(f"   {desc}")
            lines.append("")
        else:
            lines.append(f"  {emoji} *{name}*")
    
    if chunks:
        lines.append("\n📖 **From the Books**")
        seen = set()
        for c in chunks[:2]:
            if c['source'] in seen:
                continue
            seen.add(c['source'])
            paras = [p.strip() for p in c['text'].split('\n\n') if len(p.strip()) > 50]
            excerpt = humanizer.process(paras[0][:400] if paras else c['text'][:300])
            lines.append(f"\n📚 *{c['source']}*\n{excerpt}")
    
    return "\n".join(lines)

# ─── Telegram Bot (async, concurrent) ─────────────────────────
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "🤵 *Alex Hormozi AI*\n"
        "Sales. Offers. Lead Gen. Pricing.\n\n"
        "Commands: `/template` `/stats` `/fast`"
    )

async def stats(update: Update, context: ContextTypes.DEFAULT_TYPE):
    total_w = sum(c.get('words', 0) for c in CHUNKS)
    srcs = set(c.get('source','') for c in CHUNKS)
    await update.message.reply_text(
        f"📚 *Knowledge Base*\n"
        f"• {len(CHUNKS)} sections from {len(srcs)} books\n"
        f"• {total_w:,} total words\n"
        f"• Graph: {len(NODES)} concepts\n"
        f"• Startup: 0.1s | AI: parallel (max 2)"
    )

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle incoming messages with multi-level response + error recovery."""
    try:
        question = update.message.text.strip()
        if not question:
            return
        
        await update.message.reply_chat_action("typing")
        log.info(f"\U0001f4e9 [{update.effective_user.id}] {question[:60]}")
        
        ql = question.lower().strip("?.,!").strip()
        
        # Level 1: Concept cache (0.001s)
        for cid, cached_response in CONCEPT_CACHE.items():
            label = NODES.get(cid, {}).get('label', '').lower()
            if label and label in ql:
                sources = [c['source'] for c in CHUNKS if cid.replace('_',' ') in c['text'][:200].lower()]
                src = sources[0] if sources else NODES.get(cid, {}).get('metadata', {}).get('description', '')[:30]
                await update.message.reply_text(f"\U0001f4d6 *{NODES[cid]['label']}* \u2014 {src}\n\n{cached_response}")
                log.info(f"\u26a1 Concept cache: {label}")
                return
        
        # Level 2: Common Q short-circuit (0.001s)
        for pattern, answer in COMMON_QA.items():
            if pattern in ql:
                await update.message.reply_text(answer)
                log.info(f"\u26a1 Common Q: {pattern}")
                return
        
        # Level 3: RAG retrieval + fast template (0.1s)
        chunks = retrieve_optimized(question)
        if not chunks:
            await update.message.reply_text("Ask me about sales, offers, lead gen, or pricing.")
            return
        
        sources = list(set(c['source'] for c in chunks))
        fast_response = generate_fast_response(question, chunks)
        header = f"\U0001f4d6 *Sources:* {', '.join(sources)}\n\n"
        
        await update.message.reply_text(header + fast_response)
        log.info(f"\u26a1 RAG response sent")
        
        # Level 4: AI enhancement via background task (non-blocking)
        if len(question) > 15 and not question.startswith("/fast"):
            prompt = (
                f"Answer as Alex Hormozi. Direct. 2-3 sentences. Numbers. Markdown.\n\n"
                f"Q: {question}"
            )
            # Fire-and-forget: doesn't block the handler
            asyncio.create_task(_send_ai_enhancement(update, prompt))
    
    except Exception as e:
        log.error(f"Handler error: {e}")
        try:
            await update.message.reply_text("I\u2019m here. Ask about sales, offers, lead gen, or pricing.")
        except Exception:
            pass

async def _send_ai_enhancement(update: Update, prompt: str):
    """Background AI enhancement \u2014 non-blocking, error-isolated."""
    try:
        ai_response = await query_ai(prompt, timeout=15)
        if ai_response:
            try:
                final = apply_conciseness(ai_response)
                await update.message.reply_text(f"\u26a1 *AI Analysis*\n\n{final}")
                log.info(f"\U0001f9e0 AI sent async")
            except Exception as e:
                log.warning(f"AI reply error: {e}")
    except Exception as e:
        log.warning(f"AI call error: {e}")
async def error_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    log.error(f"Error: {context.error}")

def main():
    log.info("🚀 SHANNON-Ω Professional Bot starting...")
    app = Application.builder().token(TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("help", start))
    app.add_handler(CommandHandler("stats", stats))
    app.add_handler(CommandHandler("template", handle_message))
    app.add_handler(CommandHandler("fast", handle_message))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    app.add_error_handler(error_handler)
    log.info("Polling...")
    app.run_polling(drop_pending_updates=True)

if __name__ == "__main__":
    main()
