#!/usr/bin/env python3
"""
🤖 Alex Hormozi Bot — Simple polling loop.
Answers sales & lead gen questions strictly from Alex Hormozi's books.
"""

import os, sys, json, time, logging, requests
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from telegram_bot_hormozi import HormoziRAG, query_hormozi

TOKEN = os.environ.get('TELEGRAM_TOKEN', '8758115339:AAHH6gAIHmSo7Qf_VMc_HmBxz2Jy8w_1mtM')
BASE = f"https://api.telegram.org/bot{TOKEN}"

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
log = logging.getLogger(__name__)

def tg(method: str, **kwargs):
    """Call Telegram Bot API."""
    try:
        r = requests.get(f"{BASE}/{method}", params=kwargs, timeout=10)
        return r.json() if r.status_code == 200 else None
    except Exception as e:
        log.error(f"tg {method}: {e}")
        return None

def send(chat_id: int, text: str, parse_mode: str = "Markdown"):
    if not text: return
    for i in range(0, len(text), 4000):
        tg("sendMessage", chat_id=chat_id, text=text[i:i+4000], parse_mode=parse_mode)

def main():
    log.info("📚 Loading Hormozi knowledge base...")
    rag = HormoziRAG()
    log.info(f"✅ {len(rag.chunks)} chunks loaded")
    
    me = tg("getMe")
    if not me:
        log.error("❌ Telegram API unreachable")
        return
    log.info(f"✅ Bot: @{me['result']['username']}")
    
    offset = 0
    log.info(f"🤖 Hormozi AI Bot live! Message @Al_bosifybot")
    
    while True:
        try:
            result = tg("getUpdates", offset=offset, timeout=10, allowed_updates="message")
            if not result or not result.get("ok"):
                time.sleep(2)
                continue
            
            for update in result.get("result", []):
                offset = update["update_id"] + 1
                msg = update.get("message", {})
                chat_id = msg.get("chat", {}).get("id")
                text = msg.get("text", "").strip()
                name = msg.get("from", {}).get("first_name", "Friend")
                
                if not chat_id or not text:
                    continue
                
                log.info(f"📩 {name}: {text[:60]}...")
                
                if text == "/start":
                    send(chat_id, 
                        f"🤵 *Alex Hormozi* — at your service, {name}.\n\n"
                        f"I've read all his books. Ask me about sales, offers, leads, pricing.\n"
                        f"• /stats for knowledge base info")
                    continue
                
                if text == "/stats":
                    send(chat_id, rag.get_stats(), parse_mode="Markdown")
                    continue
                
                if text.startswith("/"):
                    continue
                
                # Show typing
                tg("sendChatAction", chat_id=chat_id, action="typing")
                
                # Find relevant content from books
                chunks = rag.retrieve(text)
                if not chunks:
                    send(chat_id, "Ask me about sales, offers, lead gen, or pricing — I've got those in the books.")
                    continue
                
                sources = list(set(c['source'] for c in chunks))
                response = query_hormozi(text, chunks)
                
                if response:
                    full = f"📖 *Sources:* {', '.join(sources)}\n\n{response}"
                    send(chat_id, full)
                else:
                    c = chunks[0]
                    send(chat_id, f"📖 From *{c['source']}*:\n\n{c['text'][:3000]}")
            
            time.sleep(1)
            
        except KeyboardInterrupt:
            log.info("Shutdown")
            break
        except Exception as e:
            log.error(f"❌ {e}")
            time.sleep(5)

if __name__ == "__main__":
    main()
