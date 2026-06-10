#!/usr/bin/env bash
cd /root/Documents/Codex/2026-06-08/make-the-deepseek-v4-flash-free
source .venv/bin/activate
export PYTHONUNBUFFERED=1
exec python3 -u telegram_bot_hormozi.py
