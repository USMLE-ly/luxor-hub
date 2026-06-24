#!/bin/sh
set -e
cd luxor-hub
rm -rf node_modules/.vite node_modules/.cache

# Lower Node memory to leave room for esbuild Go binary
NODE_OPTIONS="--max-old-space-size=1024" npm install --ignore-scripts=false

# Copy esbuild binary to /tmp in case of noexec
if [ -f node_modules/@esbuild/linux-x64/bin/esbuild ]; then
  cp node_modules/@esbuild/linux-x64/bin/esbuild /tmp/esbuild-bin
  chmod +x /tmp/esbuild-bin
  export ESBUILD_BINARY_PATH=/tmp/esbuild-bin
fi

# GOGC=50 makes Go GC run twice as often, reducing peak memory
# UV_THREADPOOL_SIZE limits parallel I/O to reduce FD/memory use
NODE_OPTIONS="--max-old-space-size=1024" GOGC=50 UV_THREADPOOL_SIZE=4 npx vite build

mkdir -p ../dist
cp -r dist/. ../dist/
