#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "[BUILD] Installing frontend dependencies..."
npm --prefix luxor-hub install

echo "[BUILD] Installing backend dependencies..."
pip3 install -r requirements.txt

echo "[STARTUP] Starting Flask backend on port 5000..."
gunicorn main:app --bind 0.0.0.0:5000 --workers 2 --timeout 120 --daemon

echo "[STARTUP] Starting Vite dev server on port 5173..."
cd "$SCRIPT_DIR/luxor-hub" && npm run dev -- --host 0.0.0.0 --port 5173
