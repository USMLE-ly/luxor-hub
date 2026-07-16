#!/bin/bash
set -e

echo "=== Bootstrapping pip ==="
python3 -m ensurepip --default-pip 2>/dev/null || echo "Pip already installed"

echo "=== Building Frontend ==="
npm --prefix luxor-hub install --ignore-engines
npm --prefix luxor-hub run build

echo "=== Copying dist to root ==="
rm -rf dist
cp -r luxor-hub/dist dist

echo "=== Installing Backend Python Packages ==="
python3 -m pip install --break-system-packages -r requirements.txt

echo "=== Build complete ==="
