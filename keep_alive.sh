#!/usr/bin/env bash
cd /root/Documents/Codex/2026-06-08/make-the-deepseek-v4-flash-free
source .venv/bin/activate
export PYTHONUNBUFFERED=1
while true; do
    echo "[$(date)] Starting bot..."
    python3 -u hormozi_bot_simple.py >> hormozi_bot.log 2>&1
    echo "[$(date)] Bot exited with $?" >> hormozi_bot.log
    sleep 2
done
