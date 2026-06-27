#!/bin/bash
set -e
echo "[BUILD] Installing frontend dependencies..."
cd luxor-hub && npm install
echo "[BUILD] Building frontend..."
npm run build
echo "[BUILD] Copying dist to root..."
mkdir -p ../dist
cp -r dist/. ../dist/
echo "[BUILD] dist ready"
