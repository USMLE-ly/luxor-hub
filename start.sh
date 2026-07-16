#!/bin/bash
set -e

PORT="${PORT:-5000}"

echo "=== Starting Gunicorn on port $PORT ==="
export FLASK_APP=main.py
exec python3 -m gunicorn main:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120
