#!/bin/bash
# Start Flask backend via gunicorn in background (port 5000)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"
if [ -d ".venv" ]; then
  .venv/bin/gunicorn main:app --bind 0.0.0.0:5000 --workers 2 --timeout 120 &
else
  gunicorn main:app --bind 0.0.0.0:5000 --workers 2 --timeout 120 &
fi
FLASK_PID=$!
echo "[STARTUP] Flask backend started (PID=$FLASK_PID) on port 5000"

# Start Vite dev server in foreground
cd "$SCRIPT_DIR/luxor-hub" && npm run dev -- --host 0.0.0.0 --port 5173

# Cleanup on exit
kill $FLASK_PID 2>/dev/null
