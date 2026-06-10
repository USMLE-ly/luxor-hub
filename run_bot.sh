#!/usr/bin/env bash
# 🤖 Telegram Bot Service — auto-restart on crash
# Run: ./run_bot.sh [start|stop|restart|status]

BOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BOT_SCRIPT="$BOT_DIR/telegram_bot.py"
PID_FILE="$BOT_DIR/bot.pid"
LOG_FILE="$BOT_DIR/bot_output.log"
VENV="$BOT_DIR/.venv/bin/activate"

start() {
    if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
        echo "Bot already running (PID: $(cat $PID_FILE))"
        exit 0
    fi
    
    cd "$BOT_DIR"
    source "$VENV"
    
    echo "Starting Telegram bot..."
    nohup python3 "$BOT_SCRIPT" >> "$LOG_FILE" 2>&1 &
    PID=$!
    echo $PID > "$PID_FILE"
    echo "Bot started (PID: $PID)"
    
    # Wait a few seconds then check
    sleep 3
    if kill -0 $PID 2>/dev/null; then
        echo "✅ Bot is running"
    else
        echo "❌ Bot failed to start"
        tail -5 "$LOG_FILE"
    fi
}

stop() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        echo "Stopping bot (PID: $PID)..."
        kill $PID 2>/dev/null
        rm -f "$PID_FILE"
        echo "Bot stopped"
    else
        echo "No PID file found"
    fi
}

restart() {
    stop
    sleep 1
    start
}

status() {
    if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
        echo "✅ Bot is running (PID: $(cat $PID_FILE))"
        echo "Recent log:"
        tail -5 "$LOG_FILE"
    else
        echo "❌ Bot is not running"
    fi
}

case "${1:-start}" in
    start)   start ;;
    stop)    stop ;;
    restart) restart ;;
    status)  status ;;
    *)
        echo "Usage: $0 {start|stop|restart|status}"
        exit 1
        ;;
esac
