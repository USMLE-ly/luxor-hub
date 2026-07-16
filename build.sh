#!/bin/bash
set -e

echo "=== Bootstrapping pip (system-safe) ==="
curl -sS https://bootstrap.pypa.io/get-pip.py | python3 || echo "pip already exists"

echo "=== Building Frontend ==="
npm --prefix luxor-hub install --ignore-engines
npm --prefix luxor-hub run build

echo "=== Copying dist to root ==="
rm -rf dist
cp -r luxor-hub/dist dist

echo "=== Installing Backend Python Packages (user mode) ==="
python3 -m pip install --user -r requirements.txt

echo "=== Build complete ==="
