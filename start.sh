#!/bin/bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== Installing Frontend Dependencies ==="
npm --prefix luxor-hub install --ignore-engines

echo "=== Building Frontend (Vite) ==="
npm --prefix luxor-hub run build

echo "=== Setting up Python Backend Environment ==="
if [ ! -d "venv" ]; then
  echo "Creating Python virtual environment..."
  python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt

echo "=== Starting Backend (Flask) on port 5000 ==="
python3 -m gunicorn main:app --bind 0.0.0.0:5000 --daemon

echo "=== Starting Frontend (Vite Preview) on port 5173 ==="
npm --prefix luxor-hub run preview -- --host 0.0.0.0 --port 5173
