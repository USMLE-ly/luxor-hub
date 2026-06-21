#!/bin/bash
# Luxor Local Servers — Start both avatar + analysis servers
# These replace the GPT-5 / Lovable AI gateway when credits are exhausted.
#
# Usage:
#   ./start_luxor_servers.sh              # Start both on default ports
#   ./start_luxor_servers.sh --ports 8765 8766

AVATAR_PORT="${1:-8765}"
ANALYSIS_PORT="${2:-8766}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
VENV_PYTHON="$SCRIPT_DIR/.venv/bin/python3"
PYTHON="${VENV_PYTHON:-python3}"

echo "╔══════════════════════════════════════════════════════════╗"
echo "║   Luxor Local AI Servers                                ║"
echo "║                                                        ║"
echo "║   Lookbook Server  → :$AVATAR_PORT  (POST /generate-avatar)  ║"
echo "║   Analysis Server  → :$ANALYSIS_PORT  (POST /analyze-outfit)  ║"
echo "║                                                        ║"
echo "║   How it works:                                        ║"
║   1. You upload/select items in the app                    ║"
║   2. App tries local server first                           ║"
║   3. If unreachable, falls back to Supabase edge function   ║"
║   4. Setting VITE env vars forces local mode                 ║"
echo "╚══════════════════════════════════════════════════════════╝"

# Start analysis server in background
$PYTHON "$SCRIPT_DIR/luxor_analysis_server.py" --port "$ANALYSIS_PORT" &
ANALYSIS_PID=$!

# Start avatar server in foreground
$PYTHON "$SCRIPT_DIR/luxor_avatar_server.py" --port "$AVATAR_PORT"
AVATAR_PID=$!

# Cleanup on exit
trap "kill $ANALYSIS_PID $AVATAR_PID 2>/dev/null" EXIT
