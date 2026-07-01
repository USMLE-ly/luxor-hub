#!/bin/bash
set -e
echo "[BUILD] Building frontend..."

# Navigate to the frontend directory
cd luxor-hub

# Install dependencies
npm install --ignore-scripts --no-optional 2>/dev/null || npm install --ignore-scripts 2>/dev/null || npm install

# Build with Vite
npm run build

# Copy dist to root for Vercel
echo "[BUILD] Copying dist to deploy root..."
mkdir -p ../dist
cp -r dist/. ../dist/
echo "[BUILD] dist ready"
