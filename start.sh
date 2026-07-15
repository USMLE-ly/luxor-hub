#!/bin/bash
set -e

echo "=== Setting up Python Backend Environment ==="
if [ ! -d "venv" ]; then
  echo "Creating Python virtual environment..."
  python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt --quiet

echo "=== Starting Backend (Flask) on port 5000 ==="
export FLASK_APP=main.py
export FLASK_ENV=production
flask run --host=0.0.0.0 --port=5000 &
FLASK_PID=$!
echo "Flask PID: $FLASK_PID"

# Wait for Flask to bind
sleep 3

# Verify Flask is alive
if kill -0 $FLASK_PID 2>/dev/null; then
  echo "Flask is running on port 5000"
else
  echo "WARNING: Flask may have crashed. Trying gunicorn fallback..."
  python3 -m gunicorn main:app --bind 0.0.0.0:5000 --daemon
  sleep 2
fi

echo "=== Starting Frontend (Vite Preview) on port 5173 ==="
npm --prefix luxor-hub run preview -- --host 0.0.0.0 --port 5173
