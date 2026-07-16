#!/bin/bash
set -e

echo "=== Building Frontend ==="
npm --prefix luxor-hub install --ignore-engines
npm --prefix luxor-hub run build

echo "=== Copying dist to root for Lovable dist-check ==="
rm -rf dist
cp -r luxor-hub/dist dist
echo "=== Frontend build complete ==="

# Backend deps — pip install --target pyvendor (travels with workspace)
echo "=== Installing Backend Python Packages ==="
pip install --target /home/runner/workspace/pyvendor -r requirements.txt --quiet 2>/dev/null || true

# Collect artifacts on success
bash scripts/ci-artifacts.sh || true
