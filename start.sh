#!/bin/bash
set -e

# Production: PORT=5173 (mapped to external :80)
# Dev: PORT=5000
PORT="${PORT:-5173}"

echo "=== Setting up Python Virtual Environment ==="
if [ ! -d "venv" ]; then
  python3 -m venv venv
fi

echo "=== Installing Backend Python Packages ==="
source venv/bin/activate
pip install -r requirements.txt

echo "=== Cleaning up old processes ==="
pkill -f gunicorn || true
sleep 1

echo "=== Starting Gunicorn on port $PORT ==="
export FLASK_APP=main.py
exec gunicorn main:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120
