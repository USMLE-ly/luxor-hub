#!/bin/bash
set -e

# ALWAYS use port 5173 for Replit production (mapped to external :80)
# The .replit [env] section sets PORT=5173, but hardcode as safety net
PORT=5173

# Kill any old processes
pkill -f gunicorn || true
pkill -f flask || true
sleep 1

# Clean up broken old installations
rm -rf pyvendor 2>/dev/null || true

echo "=== Setting up Python Virtual Environment ==="
if [ ! -d "venv" ]; then
  python3 -m venv venv
fi

echo "=== Installing Backend Python Packages ==="
source venv/bin/activate
pip install -r requirements.txt

echo "=== Starting Gunicorn on port $PORT ==="
export FLASK_APP=main.py
exec gunicorn main:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120
