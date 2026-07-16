#!/bin/bash
set -e

# ============================================================
# Luxor Pro Stylist — Replit Production Start Script
# ============================================================
# PORT 5173 is mapped to external :80 via .replit [[ports]]
# Do NOT change this port — the deployment healthcheck expects it.
# ============================================================

PORT=5173
export PORT

# Kill any lingering processes from previous deploys
pkill -f gunicorn 2>/dev/null || true
pkill -f flask 2>/dev/null || true
sleep 1

# Remove stale broken installations
rm -rf pyvendor 2>/dev/null || true

# ── Python Virtual Environment ──────────────────────────────
echo "=== [1/4] Setting up Python Virtual Environment ==="
if [ ! -d "venv" ] || [ ! -f "venv/bin/activate" ]; then
  rm -rf venv
  python3 -m venv venv
fi

echo "=== [2/4] Installing Backend Python Packages ==="
# shellcheck disable=SC1091
source venv/bin/activate
pip install --quiet -r requirements.txt

# ── Ensure frontend dist exists ─────────────────────────────
echo "=== [3/4] Checking Frontend Build ==="
if [ ! -f "luxor-hub/dist/index.html" ]; then
  echo "Frontend not built — building now..."
  npm --prefix luxor-hub install --ignore-engines --no-audit --no-fund
  npm --prefix luxor-hub run build
fi

# ── Start Gunicorn ──────────────────────────────────────────
echo "=== [4/4] Starting Gunicorn on port $PORT ==="
export FLASK_APP=main.py
exec gunicorn main:app \
  --bind "0.0.0.0:${PORT}" \
  --workers 2 \
  --threads 2 \
  --timeout 120 \
  --graceful-timeout 30 \
  --access-logfile - \
  --error-logfile -
