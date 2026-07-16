#!/bin/bash
set -e

echo "=== Building Frontend ==="
npm --prefix luxor-hub install --ignore-engines
npm --prefix luxor-hub run build

echo "=== Copying dist to root ==="
rm -rf dist
cp -r luxor-hub/dist dist

echo "=== Installing Backend Python Packages ==="
export PYTHONPATH="$HOME/.local/lib/python3.11/site-packages:$PYTHONPATH"
python3 -m pip install --user --break-system-packages -r requirements.txt

echo "=== Build complete ==="
