#!/usr/bin/env bash
# Watchdog — ensures bot stays alive, run every minute via cron
BOT_DIR="/root/Documents/Codex/2026-06-08/make-the-deepseek-v4-flash-free"
PID_FILE="$BOT_DIR/bot.pid"

if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
    exit 0  # Bot is running
fi

# Bot died, restart it
echo "[$(date)] Bot was down — restarting" >> "$BOT_DIR/watchdog.log"
cd "$BOT_DIR" && source .venv/bin/activate && nohup python3 telegram_bot.py >> bot_output.log 2>&1 &
echo $! > "$PID_FILE"
echo "[$(date)] Restarted with PID: $(cat $PID_FILE)" >> "$BOT_DIR/watchdog.log"
