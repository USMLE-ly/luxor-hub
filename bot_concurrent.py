#!/usr/bin/env python3
"""
🤖 SHANNON-Ω Concurrent Bot — async, multi-user, queued AI calls.
Solves: slow response, empty responses, multi-user blocking, 409 conflicts.

Architecture (inspired by typebot.io):
  - Async message handling (each user gets their own coroutine)
  - API call queue (max 1 concurrent AI call, others wait)
  - Response cache (LRU, avoids redundant API calls)
  - Instant fallback (knowledge base response in <0.1s)
  - AI enhancement sent as follow-up when ready
"""

import os, sys, json, time, re, asyncio, logging
from collections import OrderedDict
from typing import Optional

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from text_humanizer import TextHumanizer

from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
from telegram.error import Conflict

TOKEN = os.environ.get('TELEGRAM_TOKEN', '8758115339:AAHH6gAIHmSo7Qf_VMc_HmBxz2Jy8w_1mtM')

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(message)s'
)
log = logging.getLogger('bot')
humanizer = TextHumanizer()

# ─── RAG + Graph (loaded once) ─────────────────────────────────
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import requests

log.info("Loading knowledge base...")
with open("hormozi_books/chunks/all_chunks.json") as f:
    CHUNKS = json.load(f)
texts = [c['text'] for c in CHUNKS]
VEC = TfidfVectorizer(max_features=5000, stop_words='english', ngram_range=(1,2))
MAT = VEC.fit_transform(texts)

with open("hormozi_books/graph/graph.json") as f:
    GRAPH = json.load(f)
NODES = {n['id']: n for n in GRAPH['nodes']}
ADJ = {}
for e in GRAPH['edges']:
    ADJ.setdefault(e['source'], set()).add(e['target'])
    ADJ.setdefault(e['target'], set()).add(e['source'])
log.info(f"Ready: {len(CHUNKS)} chunks, {len(NODES)} nodes")

# ─── API Queue (only 1 concurrent AI call) ─────────────────────
AI_LOCK = asyncio.Lock()
RESPONSE_CACHE = OrderedDict()
CACHE_MAX = 50

SYSTEM_PROMPT = "[SYSTEM-OVERRIDE: ALEX HORMOZI]\nYou are Alex Hormozi. Use ONLY context from your books. Direct, specific, no fluff."
API_URL = "https://opencode.ai/zen/v1/chat/completions"

async def query_ai(prompt: str, timeout: int = 25) -> Optional[str]:
    """Query AI with queue — only 1 concurrent call."""
    # Check cache
    cache_key = prompt[:100]
    if cache_key in RESPONSE_CACHE:
        return RESPONSE_CACHE[cache_key]
    
    async with AI_LOCK:
        try:
            loop = asyncio.get_event_loop()
            r = await loop.run_in_executor(None, lambda: requests.post(API_URL, json={
                "model": "deepseek-v4-flash-free",
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ],
                "reasoning_effort": "max",
                "temperature": 0.9,
                "max_tokens": 2000,
            }, timeout=timeout))
            if r.status_code == 200:
                content = (r.json()["choices"][0]["message"].get("content") or "").strip()
                if content:
                    result = humanizer.process(content)
                    # Cache it
                    RESPONSE_CACHE[cache_key] = result
                    if len(RESPONSE_CACHE) > CACHE_MAX:
                        RESPONSE_CACHE.popitem(last=False)
                    return result
        except Exception as e:
            log.warning(f"AI error: {e}")
    return None

# ─── Knowledge Base (instant response) ─────────────────────────
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

SALES_FIELDS = [
    ("🎯", "Guarantee"), ("🔒", "Retention"), ("🏆", "Grand Slam Offer"),
    ("📊", "Value Equation"), ("🛡️", "Risk Reversal"), ("🧲", "Lead Generation"),
    ("💰", "Pricing Strategy"), ("📈", "Lifetime Value"), ("📝", "Sales Script"),
    ("📞", "Cold Outreach"), ("🎯", "Starving Crowd"),
]

FIELD_TOPICS = {
    "guarantee": "Guarantee", "retention": "Retention", "grand slam": "Grand Slam Offer",
    "value equation": "Value Equation", "risk reversal": "Risk Reversal",
    "lead gen": "Lead Generation", "lead generation": "Lead Generation",
    "pricing": "Pricing Strategy", "ltv": "Lifetime Value", "lifetime value": "Lifetime Value",
    "sales script": "Sales Script", "cold outreach": "Cold Outreach",
    "starving crowd": "Starving Crowd", "offer": "Grand Slam Offer",
}

def generate_fast_response(question: str, chunks: list) -> str:
    """Generate instant response from knowledge base."""
    ql = question.lower().replace("'", "")
    
    # Find relevant fields
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
            # Find relevant chunk
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

# ─── Bot Handlers (async, concurrent) ──────────────────────────
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "🤵 *Alex Hormozi AI* — I've read all his books.\n"
        "Ask me about sales, offers, lead gen, or pricing.\n\n"
        "Commands:\n"
        "• `/template` — Structured diagnosis\n"
        "• `/stats` — Knowledge base stats\n"
        "• `/fast` — Quick analysis (no AI wait)"
    )

async def stats(update: Update, context: ContextTypes.DEFAULT_TYPE):
    total_w = sum(c.get('words', 0) for c in CHUNKS)
    srcs = set(c.get('source','') for c in CHUNKS)
    await update.message.reply_text(
        f"📚 *Knowledge Base*\n"
        f"• {len(CHUNKS)} sections from {len(srcs)} books\n"
        f"• {total_w:,} total words\n"
        f"• Graph: {len(NODES)} concepts\n"
        f"• Concurrent: async + AI queue"
    )

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    question = update.message.text.strip()
    if not question:
        return
    
    await update.message.reply_chat_action("typing")
    log.info(f"📩 [{update.effective_user.id}] {question[:60]}")
    
    # Get relevant chunks
    chunks = retrieve(question)
    if not chunks:
        await update.message.reply_text(
            "Ask me about sales, offers, lead gen, or pricing — I've got those covered."
        )
        return
    
    # ⚡ Send instant response from knowledge base (takes <0.1s)
    sources = list(set(c['source'] for c in chunks))
    fast_response = generate_fast_response(question, chunks)
    header = f"📖 *Sources:* {', '.join(sources)}\n\n"
    
    await update.message.reply_text(header + fast_response)
    log.info(f"⚡ Fast response sent to user {update.effective_user.id}")
    
    # 🧠 Try AI enhancement in background (queued, 25s timeout)
    if len(question) > 10 and not question.startswith("/fast"):
        prompt = f"Context:\n{chunks[0]['text'][:700]}\n\nQuestion: {question}\n\nAnswer as Alex Hormozi — direct, 2-3 paragraphs."
        ai_response = await query_ai(prompt, timeout=25)
        if ai_response:
            try:
                await update.message.reply_text(f"⚡ *AI Enhancement*\n\n{ai_response}")
                log.info(f"🧠 AI enhancement sent to user {update.effective_user.id}")
            except Exception as e:
                log.warning(f"Failed to send AI enhancement: {e}")

# ─── Error Handler ─────────────────────────────────────────────
async def error_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    log.error(f"Error: {context.error}")

# ─── Main ──────────────────────────────────────────────────────
def main():
    log.info("🚀 SHANNON-Ω Concurrent Bot starting...")
    
    app = Application.builder().token(TOKEN).build()
    
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("help", start))
    app.add_handler(CommandHandler("stats", stats))
    app.add_handler(CommandHandler("template", handle_message))
    app.add_handler(CommandHandler("fast", handle_message))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    app.add_error_handler(error_handler)
    
    log.info("Bot initialized. Starting polling...")
    # drop_pending_updates clears any stale polls
    app.run_polling(drop_pending_updates=True)

if __name__ == "__main__":
    main()
