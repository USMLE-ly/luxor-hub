#!/bin/bash
set -e

echo "=== Building Frontend ==="
npm --prefix luxor-hub install --ignore-engines
npm --prefix luxor-hub run build

echo "=== Copying dist to root ==="
rm -rf dist
cp -r luxor-hub/dist dist

echo "=== Setting up Python Virtual Environment ==="
if [ ! -d "venv" ]; then
  python3 -m venv venv
fi

echo "=== Installing Backend Python Packages ==="
source venv/bin/activate
pip install -r requirements.txt

echo "=== Build complete ==="
