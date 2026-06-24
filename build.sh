#!/bin/sh
set -e
cd luxor-hub
rm -rf node_modules/.vite node_modules/.cache
NODE_OPTIONS="--max-old-space-size=2048" npm install --ignore-scripts=false

# esbuild binary might be on a noexec mount — copy to /tmp and point ESBUILD_BINARY_PATH at it
if [ -f node_modules/@esbuild/linux-x64/bin/esbuild ]; then
  cp node_modules/@esbuild/linux-x64/bin/esbuild /tmp/esbuild-bin
  chmod +x /tmp/esbuild-bin
  export ESBUILD_BINARY_PATH=/tmp/esbuild-bin
fi

NODE_OPTIONS="--max-old-space-size=2048" npx vite build
mkdir -p ../dist
cp -r dist/. ../dist/
