#!/bin/bash
set -e

# Single-process: Gunicorn serves frontend + API
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"
echo "Working directory: $(pwd)"

# Find pyvendor relative to script location
export PYTHONPATH="$SCRIPT_DIR/pyvendor:$PYTHONPATH"
export LD_LIBRARY_PATH="/home/runner/.pythonlibs/lib:$LD_LIBRARY_PATH"

PORT="${PORT:-5000}"

echo "=== Starting Gunicorn on port $PORT ==="
export FLASK_APP=main.py

# Try gunicorn from pyvendor first, fall back to flask run
if [ -f "$SCRIPT_DIR/pyvendor/bin/gunicorn" ]; then
  exec "$SCRIPT_DIR/pyvendor/bin/gunicorn" main:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120
elif python3 -c "import gunicorn" 2>/dev/null; then
  exec python3 -m gunicorn main:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120
else
  echo "⚠️ gunicorn not found, falling back to flask run"
  exec flask run --host=0.0.0.0 --port=$PORT
fi
