#!/bin/bash
set -e

echo "=== Building Frontend ==="
npm --prefix luxor-hub install --ignore-engines
npm --prefix luxor-hub run build

echo "=== Copying dist to root ==="
rm -rf dist
cp -r luxor-hub/dist dist

echo "=== Installing Backend Python Packages ==="
# --user: writes to ~/.local (writable), not /nix/store (read-only)
# --break-system-packages: bypasses PEP 668 externally-managed check
python3 -m pip install --user --break-system-packages -r requirements.txt

echo "=== Build complete ==="
