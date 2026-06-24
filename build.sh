#!/bin/sh
set -e
cd luxor-hub
rm -rf dist node_modules/.cache

NODE_OPTIONS="--max-old-space-size=1024" npm install --ignore-scripts=false

# Build with Rollup — pure JS/toolchain, no Go/WASM binary needed
NODE_OPTIONS="--max-old-space-size=1024" npx rollup -c rollup.config.js

# Generate index.html (fixed filenames since we disabled hashes)
cat > dist/index.html << 'HTML'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Luxor — AI Fashion Style</title>
  <link rel="stylesheet" href="/assets/index.css" />
  <script>window.globalThis ||= window;</script>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/assets/index.js"></script>
</body>
</html>
HTML

mkdir -p ../dist
cp -r dist/. ../dist/
echo "Build complete: $(wc -c < dist/assets/index.js) bytes JS"
