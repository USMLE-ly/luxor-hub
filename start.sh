#!/bin/bash
set -e

# CRITICAL: cd to repo root so FLASK_APP=main.py resolves
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"
echo "Working directory: $(pwd)"

echo "=== Setting up Python Backend Environment ==="
if [ ! -d "venv" ]; then
  echo "Creating Python virtual environment..."
  python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt --quiet 2>/dev/null || true

echo "=== Starting Backend (Flask) on port 5000 ==="
export FLASK_APP=main.py
flask run --host=0.0.0.0 --port=5000 &
FLASK_PID=$!

# Wait for Flask to bind
sleep 3

# Verify Flask is alive
if kill -0 $FLASK_PID 2>/dev/null; then
  echo "✓ Flask is running on port 5000 (PID=$FLASK_PID)"
else
  echo "✗ Flask crashed. Trying gunicorn fallback..."
  python3 -m gunicorn main:app --bind 0.0.0.0:5000 --daemon 2>/dev/null || true
  sleep 2
fi

echo "=== Starting Frontend (Vite Preview) on port 5173 ==="
cd "$SCRIPT_DIR/luxor-hub"
npm run preview -- --host 0.0.0.0 --port 5173
