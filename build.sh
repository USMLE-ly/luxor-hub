#!/bin/bash
set -e

echo "=== Preflight Checks ==="
bash scripts/preflight-build.sh || {
  echo "❌ Preflight failed. Fix issues above before building."
  exit 1
}

echo "=== Building Frontend ==="
bash scripts/install-with-fallback.sh luxor-hub
npm --prefix luxor-hub run build

echo "=== Copying dist to root for Lovable dist-check ==="
rm -rf dist
cp -r luxor-hub/dist dist
echo "=== Frontend build complete ==="

# Backend deps only needed on Replit — skip gracefully on Lovable CI
if command -v python3 &>/dev/null; then
  echo "=== Installing Backend Python Packages ==="
  pip install -r requirements.txt --break-system-packages --quiet 2>/dev/null || true
else
  echo "=== Skipping Python packages (not available) ==="
fi

# Collect artifacts on success
bash scripts/ci-artifacts.sh || true
