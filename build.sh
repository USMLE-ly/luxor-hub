#!/bin/bash
set -e

# ============================================================
# Luxor Pro Stylist — Replit Build Script
# ============================================================

echo "=== [1/4] Installing Frontend Dependencies ==="
npm --prefix luxor-hub install --ignore-engines --no-audit --no-fund

echo "=== [2/4] Building Frontend (Vite) ==="
npm --prefix luxor-hub run build

echo "=== [3/4] Setting up Python Virtual Environment ==="
if [ ! -d "venv" ] || [ ! -f "venv/bin/activate" ]; then
  rm -rf venv
  python3 -m venv venv
fi

# shellcheck disable=SC1091
source venv/bin/activate

echo "=== [4/4] Installing Backend Python Packages ==="
pip install --quiet -r requirements.txt

# Verify critical packages
python3 -c "import gunicorn; import flask; import flask_cors; print('All packages OK')"

echo "=== Build Complete ==="
