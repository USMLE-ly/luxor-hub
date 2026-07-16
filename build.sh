#!/bin/bash
set -e
echo "=== Building Frontend ==="
npm --prefix luxor-hub install --ignore-engines
npm --prefix luxor-hub run build

echo "=== Copying dist to root for Lovable dist-check ==="
rm -rf dist
cp -r luxor-hub/dist dist
echo "=== Frontend build complete ==="

# Backend deps only needed on Replit — skip gracefully on Lovable CI
if command -v python3 &>/dev/null; then
  echo "=== Installing Backend Python Packages ==="
  python3 -m venv venv
  . venv/bin/activate
  pip install -r requirements.txt
else
  echo "=== Skipping Python packages (not available) ==="
fi
