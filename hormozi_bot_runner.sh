#!/usr/bin/env bash
# Self-contained bot runner - survives shell exit
cd /root/Documents/Codex/2026-06-08/make-the-deepseek-v4-flash-free
source .venv/bin/activate
export PYTHONUNBUFFERED=1

# Run forever
while true; do
  python3 -u -c '
import os, sys, json, time, logging, requests
sys.path.insert(0, ".")
from telegram_bot_hormozi import HormoziRAG, query_hormozi

TOKEN = "8758115339:AAHH6gAIHmSo7Qf_VMc_HmBxz2Jy8w_1mtM"
BASE = f"https://api.telegram.org/bot{TOKEN}"
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(message)s")
log = logging.getLogger("bot")

def tg(method, **kw):
    try:
        r = requests.get(f"{BASE}/{method}", params=kw, timeout=5)
        return r.json() if r.status_code == 200 else None
    except: return None

def send(chat_id, text, pm="Markdown"):
    if text:
        for i in range(0, len(text), 4000):
            tg("sendMessage", chat_id=chat_id, text=text[i:i+4000], parse_mode=pm)

rag = HormoziRAG()
me = tg("getMe")
log.info(f"Bot: @{me.get("result",{}).get("username","?")}" if me else "FAIL")
offset = 0

while True:
    try:
        r = tg("getUpdates", offset=offset, timeout=2, allowed_updates="message")
        if r and r.get("ok"):
            for u in r.get("result", []):
                offset = u["update_id"] + 1
                msg = u.get("message", {})
                cid = msg.get("chat", {}).get("id")
                text = msg.get("text", "").strip()
                name = msg.get("from", {}).get("first_name", "F")
                if not cid or not text: continue
                log.info(f"{name}: {text[:50]}")
                if text == "/start":
                    send(cid, "🤵 *Alex Hormozi* — ask me about sales, offers, leads.\n/stats for info")
                elif text == "/stats":
                    send(cid, rag.get_stats(), "Markdown")
                elif not text.startswith("/"):
                    tg("sendChatAction", chat_id=cid, action="typing")
                    cs = rag.retrieve(text)
                    if cs:
                        resp = query_hormozi(text, cs)
                        if resp:
                            srcs = list(set(c["source"] for c in cs))
                            send(cid, f"📖 *Sources:* {', '.join(srcs)}\n\n{resp}")
                        else:
                            send(cid, f"📖 From *{cs[0]['source']}*:\n\n{cs[0]['text'][:3000]}")
        time.sleep(1)
    except Exception as e:
        log.error(f"E: {e}")
        time.sleep(3)
' 2>&1
  echo "[$(date)] Bot died, restarting..." 
  sleep 2
done
