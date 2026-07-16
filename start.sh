#!/bin/bash
set -e

PORT="${PORT:-5000}"

echo "=== Bootstrapping pip (system-safe) ==="
curl -sS https://bootstrap.pypa.io/get-pip.py | python3 || echo "pip already exists"

echo "=== Installing Backend Python Packages (user mode) ==="
python3 -m pip install --user -r requirements.txt

echo "=== Starting Gunicorn on port $PORT ==="
export PATH="$HOME/.local/bin:$PATH"
export FLASK_APP=main.py
exec python3 -m gunicorn main:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120
