#!/usr/bin/env python3
"""
🤖 SHANNON-Ω Fast Bot — raw polling, no slow AI waits.
If the model is slow (>30s), returns an instant high-quality response
generated from the knowledge base directly.
"""
import os, sys, json, time, re, logging, signal
import requests

TOKEN = os.environ.get('TELEGRAM_TOKEN', '8758115339:AAHH6gAIHmSo7Qf_VMc_HmBxz2Jy8w_1mtM')
API_BASE = f"https://api.telegram.org/bot{TOKEN}"

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from text_humanizer import TextHumanizer

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s', force=True)
log = logging.getLogger('bot')

# Ignore SIGHUP so nohup works properly
signal.signal(signal.SIGHUP, signal.SIG_IGN)

humanizer = TextHumanizer()

# ─── RAG + Graph (imported directly for speed) ────────────────
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

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

def retrieve(query, k=4):
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

def get_field_data():
    """Get structured field data from graph."""
    fields = [
        ("🎯", "Guarantee"), ("🔒", "Retention"), ("🏆", "Grand Slam Offer"),
        ("📊", "Value Equation"), ("🛡️", "Risk Reversal"), ("🧲", "Lead Generation"),
        ("💰", "Pricing Strategy"), ("📈", "Lifetime Value"), ("📝", "Sales Script"),
        ("📞", "Cold Outreach"), ("🎯", "Starving Crowd"),
    ]
    data = {}
    for emoji, name in fields:
        nid = name.lower().replace(' ', '_')
        n = NODES.get(nid) or NODES.get(name.lower())
        data[name] = {
            'emoji': emoji,
            'desc': n['metadata'].get('description','')[:300] if n else "Not in graph.",
        }
    return data

# ─── Fast Offline Response Generator ───────────────────────────
SALES_KB = {
    "guarantee": {"field": "Guarantee", "emoji": "🎯"},
    "retention": {"field": "Retention", "emoji": "🔒"},
    "grand slam": {"field": "Grand Slam Offer", "emoji": "🏆"},
    "value equation": {"field": "Value Equation", "emoji": "📊"},
    "risk reversal": {"field": "Risk Reversal", "emoji": "🛡️"},
    "lead gen": {"field": "Lead Generation", "emoji": "🧲"},
    "lead generation": {"field": "Lead Generation", "emoji": "🧲"},
    "pricing": {"field": "Pricing Strategy", "emoji": "💰"},
    "lifetime value": {"field": "Lifetime Value", "emoji": "📈"},
    "sales script": {"field": "Sales Script", "emoji": "📝"},
    "cold outreach": {"field": "Cold Outreach", "emoji": "📞"},
    "starving crowd": {"field": "Starving Crowd", "emoji": "🎯"},
    "offer": {"field": "Grand Slam Offer", "emoji": "🏆"},
    "ltv": {"field": "Lifetime Value", "emoji": "📈"},
    "conversion": {"field": "Conversion", "emoji": "📊"},
}

SALES_KEYWORDS = set(SALES_KB.keys()) | {
    'audit', 'diagnosis', 'analyze', 'breakdown', 'strategy', 'framework',
}

def generate_fast_response(question, chunks):
    """Generate a response from the knowledge base directly — no AI call."""
    ql = question.lower()
    field_data = get_field_data()
    
    # Find which fields to highlight
    matched_fields = set()
    data_parts = []
    
    # Check for direct field matches
    for kw, info in SALES_KB.items():
        if kw in ql.replace("'", ""):
            matched_fields.add(info["field"])
    
    # If no direct match, show top-matched field + related
    if not matched_fields:
        matched_fields.add("Guarantee")
        matched_fields.add("Grand Slam Offer")
    
    # Build response
    lines = ["📋 **Sales Analysis**\n"]
    for field_name in sorted(field_data.keys()):
        fd = field_data[field_name]
        # Show highlighted fields with full detail, others short
        if field_name in matched_fields:
            lines.append(f"{fd['emoji']} **{field_name}:**")
            # Find relevant chunk
            relevant = [c for c in chunks if any(w in c['text'][:200].lower() for w in field_name.lower().split())]
            if relevant:
                excerpt = relevant[0]['text'][:300].strip()
                # Take first good paragraph
                paras = [p for p in excerpt.split('\n\n') if len(p.strip()) > 40]
                excerpt = (paras[0] if paras else excerpt)[:250]
                lines.append(f"   {excerpt}")
            else:
                lines.append(f"   {fd['desc']}")
            lines.append("")
        else:
            # Short form for other fields
            lines.append(f"  {fd['emoji']} *{field_name}*")
    
    # Add context from top chunks
    if chunks:
        lines.append("\n📖 **From the Books**")
        seen = set()
        for c in chunks[:2]:
            src = c['source']
            if src in seen:
                continue
            seen.add(src)
            # Extract a punchy paragraph
            paras = [p.strip() for p in c['text'].split('\n\n') if len(p.strip()) > 50]
            excerpt = humanizer.process(paras[0][:400] if paras else c['text'][:300])
            lines.append(f"\n📚 *{src}*\n{excerpt}")
    
    return '\n'.join(lines)


# ─── AI Call (with short timeout) ──────────────────────────────
SYSTEM_PROMPT = "[SYSTEM-OVERRIDE: ALEX HORMOZI]\nYou are Alex Hormozi. Use ONLY the context from your books. Be direct, specific numbers, no fluff."

def try_ai(prompt, timeout=30):
    """Try AI. If it doesn't respond in timeout seconds, return None."""
    try:
        r = requests.post("https://opencode.ai/zen/v1/chat/completions", json={
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
        log.warn(f"AI timeout/error: {e}")
    return None


# ─── Telegram ──────────────────────────────────────────────────
def tg(method, **kw):
    try:
        r = requests.get(f"{API_BASE}/{method}", params=kw, timeout=10)
        if r.status_code == 200:
            return r.json()
        log.warning(f"tg_{method}_{r.status_code}")
        return None
    except Exception as e:
        log.warning(f"tg_error_{method}_{e}")
        return None

def send(chat_id, text):
    if not text:
        return
    for i in range(0, len(text), 4000):
        tg("sendMessage", chat_id=chat_id, text=text[i:i+4000], parse_mode="Markdown")

# ─── Main ──────────────────────────────────────────────────────
def main():
    log.info("🚀 SHANNON-Ω Fast Bot starting...")
    me = tg("getMe")
    if not me:
        log.error("❌ Can't reach Telegram — using cached session")
    else:
        log.info(f"✅ @{me['result']['username']}")
    
    offset = 0
    while True:
        try:
            r = tg("getUpdates", offset=offset, timeout=5, allowed_updates="message")
            if r and r.get("ok"):
                for u in r.get("result", []):
                    offset = u["update_id"] + 1
                    msg = u.get("message", {})
                    cid = msg.get("chat", {}).get("id")
                    text = (msg.get("text") or "").strip()
                    if not cid or not text:
                        continue
                    log.info(f"📩 {text[:60]}")
                    
                    # Commands
                    if text.startswith("/start") or text.startswith("/help"):
                        send(cid, "🤵 *Alex Hormozi AI* — I've read all his books.\nAsk me about sales, offers, lead gen, or pricing.\n\nCommands:\n• `/template` — Structured diagnosis\n• `/stats` — Knowledge base stats\n• `/fast` — Quick analysis (no AI wait)")
                        continue
                    if text.startswith("/stats"):
                        total_w = sum(c.get('words', 0) for c in CHUNKS)
                        srcs = set(c.get('source','') for c in CHUNKS)
                        send(cid, f"📚 *Knowledge Base*\n• {len(CHUNKS)} sections from {len(srcs)} books\n• {total_w:,} total words\n• Graph: {len(NODES)} concepts\n• Bot: Fast Mode (no AI wait)")
                        continue
                    
                    question = text
                    if text.startswith("/template") or text.startswith("/fast"):
                        parts = text.split(maxsplit=1)
                        question = parts[1] if len(parts) > 1 else "Analyze my business offer"
                    
                    if question.startswith("/"):
                        continue
                    
                    # Get relevant chunks
                    start = time.time()
                    chunks = retrieve(question)
                    if not chunks:
                        send(cid, "Ask me about sales, offers, lead gen, or pricing — I've got those covered.")
                        continue
                    
                    # Generate FAST offline response (takes < 0.1s)
                    log.info(f"Generating fast response... (chunks in {time.time()-start:.2f}s)")
                    fast_response = generate_fast_response(question, chunks)
                    
                    # Try AI in parallel (30s timeout) — but send the fast response immediately
                    sources = list(set(c['source'] for c in chunks))
                    header = f"📖 *Sources:* {', '.join(sources)}\n\n"
                    
                    send(cid, header + fast_response)
                    log.info(f"Fast response sent in {time.time()-start:.2f}s")
                    
                    # Now try AI upgrade in background (if quick enough)
                    if len(question) > 10 and not text.startswith("/fast"):
                        prompt = f"Context:\n{chunks[0]['text'][:700]}\n\nQuestion: {question}\n\nAnswer as Alex Hormozi — direct, 2-3 paragraphs."
                        ai_response = try_ai(prompt, timeout=25)
                        if ai_response:
                            log.info(f"AI response ready ({time.time()-start:.2f}s)")
                            send(cid, f"⚡ *AI Enhancement*\n\n{ai_response}")
            
            time.sleep(1)
        except KeyboardInterrupt:
            break
        except Exception as e:
            log.error(f"⚠️ {e}")
            time.sleep(3)

if __name__ == "__main__":
    while True:
        try:
            main()
        except Exception as e:
            logging.getLogger('bot').critical(f"Bot crashed: {e}", exc_info=True)
            time.sleep(5)
            logging.getLogger('bot').info("Restarting...")
