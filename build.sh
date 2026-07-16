#!/bin/bash
set -e

echo "=== Parallel Build: Frontend + Backend deps ==="

# Start pip install in background (avoids sequential timeout)
echo "→ Starting pip install --target pyvendor (background)..."
pip install --target /home/runner/workspace/pyvendor -r requirements.txt --quiet 2>/dev/null &
PIP_PID=$!

# Frontend: npm install + vite build (runs in parallel with pip)
echo "→ Starting npm install + vite build..."
npm --prefix luxor-hub install --ignore-engines
npm --prefix luxor-hub run build

# Wait for pip to finish
echo "→ Waiting for pip install to complete..."
wait $PIP_PID
echo "→ pip install done"

# Copy dist to root for Lovable dist-check
echo "=== Copying dist to root ==="
rm -rf dist
cp -r luxor-hub/dist dist
echo "=== Build complete ==="
