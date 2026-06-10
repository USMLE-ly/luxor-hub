#!/usr/bin/env python3
"""
🤖 SHANNON-Ω Raw Polling Bot — No python-telegram-bot dependency.
Uses raw getUpdates to avoid Telegram 409 conflict issues.
Plugin-based: Hormozi AI + Health monitoring.
"""
import os, sys, json, time, re, logging, asyncio
import requests

TOKEN = os.environ.get('TELEGRAM_TOKEN', '8758115339:AAHH6gAIHmSo7Qf_VMc_HmBxz2Jy8w_1mtM')
API_BASE = f"https://api.telegram.org/bot{TOKEN}"

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from plugins.hormozi_plugin import HormoziPlugin
from text_humanizer import TextHumanizer

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')
log = logging.getLogger('bot')

hplugin = HormoziPlugin()

def tg(method, **kw):
    try:
        r = requests.get(f"{API_BASE}/{method}", params=kw, timeout=10)
        return r.json() if r.status_code == 200 else None
    except Exception as e:
        log.error(f"tg: {e}")
        return None

def send(chat_id, text, pm="Markdown"):
    if not text:
        return
    for i in range(0, len(text), 4000):
        tg("sendMessage", chat_id=chat_id, text=text[i:i+4000], parse_mode=pm)

def main():
    log.info("🚀 SHANNON-Ω Bot starting (raw polling)...")
    me = tg("getMe")
    if not me:
        log.error("❌ Can't reach Telegram")
        return
    log.info(f"✅ @{me['result']['username']}")
    
    offset = 0
    while True:
        try:
            r = tg("getUpdates", offset=offset, timeout=10, allowed_updates="message")
            if r and r.get("ok"):
                for u in r.get("result", []):
                    offset = u["update_id"] + 1
                    msg = u.get("message", {})
                    cid = msg.get("chat", {}).get("id")
                    text = msg.get("text", "").strip()
                    name = msg.get("from", {}).get("first_name", "")
                    if not cid or not text:
                        continue
                    log.info(f"📩 {name}: {text[:60]}")
                    
                    if text.startswith("/start") or text.startswith("/help"):
                        send(cid, "🤵 *Alex Hormozi AI* — I've read all his books.\nAsk me about sales, offers, lead gen, or pricing.\n\nCommands:\n• `/template` — Structured diagnosis\n• `/stats` — Knowledge base\n• `/health` — Bot status")
                        continue
                    if text.startswith("/stats"):
                        rag = hplugin.rag
                        srcs = {}
                        for c in rag.chunks:
                            s = c.get('source', 'unknown')
                            srcs[s] = srcs.get(s, 0) + 1
                        total_w = sum(c.get('words', 0) for c in rag.chunks)
                        send(cid, f"📚 *Knowledge Base*\n• {len(rag.chunks)} sections from {len(srcs)} books\n• {total_w:,} total words\n• Graph: {len(hplugin.graph.nodes)} concepts\n• Model: deepseek-v4-flash-free")
                        continue
                    if text.startswith("/health"):
                        import datetime
                        send(cid, "💓 *Bot Health*\n• Status: ✅ Online\n• Running: raw polling\n• Humanizer: active\n• Model: deepseek-v4-flash-free")
                        continue
                    if text.startswith("/template"):
                        args = text.split(maxsplit=1)
                        question = args[1] if len(args) > 1 else "Analyze my business offer"
                    else:
                        question = text
                        if text.startswith("/"):
                            continue
                    
                    # Process via Hormozi plugin
                    chunks = hplugin.rag.retrieve(question)
                    if not chunks:
                        send(cid, "Ask me about sales, offers, lead gen, or pricing — I've got those covered.")
                        continue
                    
                    structured = hplugin._is_sales_query(question)
                    prompt = hplugin._build_prompt(question, chunks, structured)
                    response = hplugin._query_ai(prompt)
                    
                    sources = list(set(c['source'] for c in chunks))
                    
                    if response:
                        if structured:
                            response = hplugin._format_structured(response)
                        full = f"📖 *Sources:* {', '.join(sources)}\n\n{response}"
                        send(cid, full)
                    else:
                        # Smart fallback
                        sections = []
                        for c in chunks[:3]:
                            paras = [p for p in c['text'].split('\n\n') if len(p.strip()) > 50]
                            excerpt = (paras[0] if paras else c['text'])[:500]
                            sections.append(f"📖 From *{c['source']}*:\n\n{excerpt}")
                        send(cid, f"⚡ *Quick Answer (AI busy)*\n\n" + "\n\n---\n\n".join(sections))
            
            time.sleep(1)
        except KeyboardInterrupt:
            break
        except Exception as e:
            log.error(f"⚠️ {e}")
            time.sleep(3)

if __name__ == "__main__":
    main()
