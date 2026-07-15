#!/bin/bash
set -e
echo "=== Starting Backend (Flask) on port 5000 ==="
source venv/bin/activate
python3 -m gunicorn main:app --bind 0.0.0.0:5000 --daemon

echo "=== Starting Frontend (Vite Preview) on port 5173 ==="
npm --prefix luxor-hub run preview -- --host 0.0.0.0 --port 5173
