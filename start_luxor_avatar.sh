#!/bin/bash
# Luxor Lookbook Server v2.0
# Creates polished outfit moodboards from your actual clothing item photos.
# No AI credits needed — just image compositing.
#
# Usage:
#   ./start_luxor_avatar.sh
#   ./start_luxor_avatar.sh --port 9999

PORT=8765
if [ "$1" = "--port" ] && [ -n "$2" ]; then PORT="$2"; fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
VENV_PYTHON="$SCRIPT_DIR/.venv/bin/python3"
PYTHON="${VENV_PYTHON:-python3}"

echo "╔═══════════════════════════════════════╗"
echo "║  Starting Luxor Lookbook Server      ║"
echo "║  Port: $PORT                          ║"
echo "║  Mode: screenshot → lookbook         ║"
echo "║                                      ║"
echo "║  When you click 'Generate Avatar'    ║"
echo "║  on the website, tell me and I'll    ║"
echo "║  trigger it from here.               ║"
echo "╚═══════════════════════════════════════╝"

$PYTHON "$SCRIPT_DIR/luxor_avatar_server.py" --port "$PORT"
