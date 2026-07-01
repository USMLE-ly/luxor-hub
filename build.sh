#!/bin/bash
set -e
echo "[BUILD] Building frontend..."

# Navigate to the frontend directory
cd luxor-hub

# Install dependencies (NO --no-optional — Rollup's native binary is an optional dep)
npm install

# Build with Vite
npm run build

# Copy dist to root for Vercel
echo "[BUILD] Copying dist to deploy root..."
mkdir -p ../dist
cp -r dist/. ../dist/
echo "[BUILD] dist ready"
