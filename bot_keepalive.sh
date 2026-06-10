#!/usr/bin/env bash
# Keep bot alive — runs forever, restarts if crashed
cd /root/Documents/Codex/2026-06-08/make-the-deepseek-v4-flash-free
source .venv/bin/activate

while true; do
    echo "[$(date)] Starting bot..."
    python3 telegram_bot.py
    echo "[$(date)] Bot exited (code $?) — restarting in 3s..." >> bot_keepalive.log
    sleep 3
done
