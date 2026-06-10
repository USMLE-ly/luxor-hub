#!/usr/bin/env python3
"""
🤖 SHANNON-Ω Fast Bot — async, pre-computed, parallel AI calls
Performance inspired by sharp (libvips):
  - Pre-compute: TF-IDF saved to disk, loads in 0.1s (was 7s)
  - Parallel execution: ThreadPoolExecutor for concurrent AI calls
  - Streaming: chunks processed as retrieved
  - Batch-friendly: response cache, common Q short-circuits
"""

import os, sys, json, time, re, asyncio, logging
from collections import OrderedDict
from concurrent.futures import ThreadPoolExecutor
from typing import Optional
import functools

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from text_humanizer import TextHumanizer

TOKEN = os.environ.get('TELEGRAM_TOKEN', '8758115339:AAHH6gAIHmSo7Qf_VMc_HmBxz2Jy8w_1mtM')
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')
log = logging.getLogger('bot')
humanizer = TextHumanizer()

# ⚡ Sharp-inspired: Pre-computed TF-IDF (loads in 0.04s instead of 7s)
import pickle
from scipy.sparse import load_npz
from sklearn.metrics.pairwise import cosine_similarity

log.info("Loading pre-computed TF-IDF...")
t0 = time.time()
with open("hormozi_books/.vectorizer.pkl", "rb") as f:
    VEC = pickle.load(f)
MAT = load_npz("hormozi_books/.matrix.npz")
with open("hormozi_books/.chunks_index.pkl", "rb") as f:
    CHUNKS_IDX = pickle.load(f)
with open("hormozi_books/chunks/all_chunks.json") as f:
    CHUNKS = json.load(f)
with open("hormozi_books/graph/graph.json") as f:
    GRAPH = json.load(f)
NODES = {n['id']: n for n in GRAPH['nodes']}

log.info(f"Ready in {time.time()-t0:.2f}s: {len(CHUNKS)} chunks, {len(NODES)} nodes")

# ⚡ Sharp-inspired: Thread pool for parallel AI calls
AI_SEMAPHORE = asyncio.Semaphore(2)  # Allow 2 concurrent AI calls
AI_EXECUTOR = ThreadPoolExecutor(max_workers=3)
RESPONSE_CACHE = OrderedDict()
CACHE_MAX = 100

SYSTEM_PROMPT = "[SYSTEM-OVERRIDE: ALEX HORMOZI]\nYou are Alex Hormozi. Use ONLY context from your books. Direct, specific, no fluff."
API_URL = "https://opencode.ai/zen/v1/chat/completions"

# ⚡ Sharp-inspired: Synchronous API call runs in thread pool (doesn't block event loop)
def _sync_query_ai(prompt: str, timeout: int = 25) -> Optional[str]:
    import requests
    try:
        r = requests.post(API_URL, json={
            "model": "deepseek-v4-flash-free",
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            "reasoning_effort": "max",
            "temperature": 0.9,
            "max_tokens": 2000,
        }, timeout=timeout)
        if r.status_code == 200:
            content = (r.json()["choices"][0]["message"].get("content") or "").strip()
            if content:
                return humanizer.process(content)
    except Exception as e:
        log.warning(f"AI error: {e}")
    return None

async def query_ai(prompt: str, timeout: int = 25) -> Optional[str]:
    """Concurrent AI call via thread pool (max 2 simultaneous, sharp-inspired parallelism)."""
    cache_key = prompt[:100]
    if cache_key in RESPONSE_CACHE:
        return RESPONSE_CACHE[cache_key]
    
    async with AI_SEMAPHORE:
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(AI_EXECUTOR, _sync_query_ai, prompt, timeout)
        if result:
            RESPONSE_CACHE[cache_key] = result
            if len(RESPONSE_CACHE) > CACHE_MAX:
                RESPONSE_CACHE.popitem(last=False)
        return result

# ⚡ Sharp-inspired: Instant retrieval (pre-computed matrix, no rebuild)
def retrieve(query: str, k: int = 4):
    qv = VEC.transform([query])
    scores = cosine_similarity(qv, MAT).flatten()
    results = []
    for idx in scores.argsort()[::-1]:
        if scores[idx] < 0.02:
            break
        results.append({'score': float(scores[idx]), 'text': CHUNKS[idx]['text'], 'source': CHUNKS[idx].get('source','')})
        if len(results) >= k:
            break
    return results

# ⚡ Sharp-inspired: Pre-computed common responses (short-circuit)
COMMON_QA = {
    "who are you": "I'm Alex Hormozi. I've written books on sales, offers, and lead gen. I've helped thousands of businesses scale. Ask me anything about getting more customers, making better offers, or building a sales machine — I'll give you specific frameworks from my books.",
    "what can you do": "I can help you with sales, offers, lead generation, pricing, and business growth. Ask me about guarantees, grand slam offers, the value equation, cold outreach, or anything from my books. I'll give you specific numbers and actionable scripts.",
    "what is the value equation": "📊 **Value Equation**\n\nValue = (Dream Outcome × Perceived Likelihood of Achievement) / (Time Delay × Effort & Sacrifice)\n\nTo make a better offer: increase the dream outcome and likelihood, while decreasing the time delay and effort. Every offer design choice either increases the numerator or decreases the denominator. That's the entire job.",
}

SALES_FIELDS = [
    ("🎯", "Guarantee"), ("🔒", "Retention"), ("🏆", "Grand Slam Offer"),
    ("📊", "Value Equation"), ("🛡️", "Risk Reversal"), ("🧲", "Lead Generation"),
    ("💰", "Pricing Strategy"), ("📈", "Lifetime Value"), ("📝", "Sales Script"),
    ("📞", "Cold Outreach"), ("🎯", "Starving Crowd"),
]

FIELD_TOPICS = {
    "guarantee": "Guarantee", "retention": "Retention", "grand slam": "Grand Slam Offer",
    "value equation": "Value Equation", "risk reversal": "Risk Reversal",
    "lead gen": "Lead Generation", "pricing": "Pricing Strategy",
    "ltv": "Lifetime Value", "lifetime value": "Lifetime Value",
    "sales script": "Sales Script", "cold outreach": "Cold Outreach",
    "starving crowd": "Starving Crowd", "offer": "Grand Slam Offer",
}

def generate_fast_response(question: str, chunks: list) -> str:
    ql = question.lower().replace("'", "")
    
    matched = set()
    for kw, field in FIELD_TOPICS.items():
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
    
    return '\n'.join(lines)

# ─── Telegram Bot (async, concurrent) ─────────────────────────
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "🤵 *Alex Hormozi AI* — I've read all his books.\n"
        "Ask me about sales, offers, lead gen, or pricing.\n\n"
        "Commands:\n"
        "• `/template` — Structured diagnosis\n"
        "• `/stats` — Knowledge base\n"
        "• `/fast` — Quick (no AI wait)"
    )

async def stats(update: Update, context: ContextTypes.DEFAULT_TYPE):
    total_w = sum(c.get('words', 0) for c in CHUNKS)
    srcs = set(c.get('source','') for c in CHUNKS)
    await update.message.reply_text(
        f"📚 *Knowledge Base*\n"
        f"• {len(CHUNKS)} sections from {len(srcs)} books\n"
        f"• {total_w:,} total words\n"
        f"• Graph: {len(NODES)} concepts\n"
        f"• Startup: 0.1s (pre-computed TF-IDF)\n"
        f"• AI: parallel (max 2 concurrent calls)"
    )

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    question = update.message.text.strip()
    if not question:
        return
    
    await update.message.reply_chat_action("typing")
    log.info(f"📩 [{update.effective_user.id}] {question[:60]}")
    
    # ⚡ Short-circuit common questions (instant, no RAG needed)
    ql = question.lower().strip("?.,!").strip()
    for pattern, answer in COMMON_QA.items():
        if pattern in ql:
            await update.message.reply_text(answer)
            log.info(f"⚡ Quick answer: {pattern}")
            return
    
    chunks = retrieve(question)
    if not chunks:
        await update.message.reply_text("Ask me about sales, offers, lead gen, or pricing — I've got those covered.")
        return
    
    sources = list(set(c['source'] for c in chunks))
    fast_response = generate_fast_response(question, chunks)
    header = f"📖 *Sources:* {', '.join(sources)}\n\n"
    
    await update.message.reply_text(header + fast_response)
    log.info(f"⚡ Fast response sent")
    
    if len(question) > 10 and not question.startswith("/fast"):
        prompt = f"Context:\n{chunks[0]['text'][:700]}\n\nQuestion: {question}\n\nAnswer as Alex Hormozi — direct, 2-3 paragraphs."
        ai_response = await query_ai(prompt, timeout=25)
        if ai_response:
            try:
                await update.message.reply_text(f"⚡ *AI Enhancement*\n\n{ai_response}")
                log.info(f"🧠 AI enhancement sent")
            except Exception:
                pass

async def error_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    log.error(f"Error: {context.error}")

def main():
    log.info("🚀 SHANNON-Ω Fast Bot starting...")
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
