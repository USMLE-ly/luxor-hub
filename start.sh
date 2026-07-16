#!/bin/bash
set -e

PORT="${PORT:-5000}"

# Ensure pip is available (Replit's Nix may break it)
curl -sS https://bootstrap.pypa.io/get-pip.py | python3 - --user 2>/dev/null || true

echo "=== Installing Backend Python Packages ==="
export PATH="$HOME/.local/bin:$PATH"
export PYTHONPATH="$HOME/.local/lib/python3.11/site-packages:$PYTHONPATH"
python3 -m pip install --user --break-system-packages -r requirements.txt

echo "=== Starting Gunicorn on port $PORT ==="
export FLASK_APP=main.py
exec python3 -m gunicorn main:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120
