#!/bin/bash
set -e

PORT="${PORT:-5173}"

# Kill any lingering pyvendor references from old builds
rm -rf pyvendor 2>/dev/null || true

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
