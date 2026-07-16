#!/bin/bash
set -e

# Replit = Backend Only (Flask API on port 5000)
# Frontend lives on Vercel (luxor.ly)

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"
echo "Working directory: $(pwd)"

# Python path fix for Nix-native packages
export PYTHONPATH="/home/runner/.pythonlibs/lib/python3.11/site-packages:$PYTHONPATH"
export PATH="/home/runner/.pythonlibs/bin:$PATH"
export LD_LIBRARY_PATH="/home/runner/.pythonlibs/lib:$LD_LIBRARY_PATH"

echo "=== Installing Backend Python Packages ==="
pip install -r requirements.txt --quiet 2>/dev/null || true

echo "=== Starting Backend (Gunicorn) on port 5000 ==="
export FLASK_APP=main.py
python3 -m gunicorn main:app --bind 0.0.0.0:5000 --daemon
sleep 2

# Verify Flask is alive
if curl -s --max-time 5 -o /dev/null -w "%{http_code}" http://localhost:5000/api/health | grep -q "200"; then
  echo "✓ Gunicorn is running on port 5000"
else
  echo "✗ Gunicorn health check failed. Trying flask run fallback..."
  flask run --host=0.0.0.0 --port=5000
fi
