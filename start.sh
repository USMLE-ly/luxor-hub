#!/bin/bash
set -e

# Single-process architecture: Gunicorn serves everything
# - GET / → luxor-hub/dist/index.html (frontend)
# - GET /assets/* → luxor-hub/dist/assets/*
# - /api/* → Flask API routes

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"
echo "Working directory: $(pwd)"

# Python path: pyvendor from build step + nix libs
export PYTHONPATH="/home/runner/workspace/pyvendor:$PYTHONPATH"
export LD_LIBRARY_PATH="/home/runner/.pythonlibs/lib:$LD_LIBRARY_PATH"

# PORT: 5000 in dev, 5173 in production (mapped to external :80)
PORT="${PORT:-5000}"

echo "=== Starting Gunicorn on port $PORT ==="
export FLASK_APP=main.py
exec python3 -m gunicorn main:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120
