#!/bin/bash
set -e

# Replit = Backend Only (Flask API)
# Frontend lives on Vercel (luxor.ly)

PORT="${PORT:-5000}"

echo "=== Starting Gunicorn on port $PORT ==="
export FLASK_APP=main.py
exec gunicorn main:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120
