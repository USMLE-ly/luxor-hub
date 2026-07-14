#!/bin/bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== Installing Dependencies ==="
npm --prefix luxor-hub install
pip3 install -r requirements.txt

echo "=== Building Frontend (Vite) ==="
npm --prefix luxor-hub run build

echo "=== Starting Backend (Flask) on port 5000 ==="
gunicorn main:app --bind 0.0.0.0:5000 --daemon

echo "=== Starting Frontend (Vite Preview) on port 5173 ==="
npm --prefix luxor-hub run preview -- --host 0.0.0.0 --port 5173
