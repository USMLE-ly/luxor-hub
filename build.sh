#!/bin/bash
set -e

# Replit = Backend only. Frontend is on Vercel.
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== Building Frontend ==="
npm --prefix luxor-hub install --ignore-engines
npm --prefix luxor-hub run build

echo "=== Copying dist to root for Lovable dist-check ==="
rm -rf dist
cp -r luxor-hub/dist dist

# Backend deps — install to pyvendor/ relative to workspace root
echo "=== Installing Backend Python Packages (pyvendor/) ==="
pip install --target "$SCRIPT_DIR/pyvendor" -r requirements.txt --quiet 2>/dev/null || true

echo "=== Build complete ==="
