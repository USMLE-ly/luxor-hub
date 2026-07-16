#!/bin/bash
set -e

# Replit = Backend Only
PORT="${PORT:-5000}"

echo "=== Bootstrapping pip ==="
python3 -m ensurepip --default-pip 2>/dev/null || echo "Pip already installed"

echo "=== Installing Backend Python Packages ==="
python3 -m pip install --break-system-packages -r requirements.txt

echo "=== Starting Gunicorn on port $PORT ==="
export FLASK_APP=main.py
exec python3 -m gunicorn main:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120
