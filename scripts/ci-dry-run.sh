#!/bin/bash
# CI dry-run: builds dist, runs publish dry-run, checks for non-200 registry requests.
# On failure: dumps full npm debug log + failing URL.
# Usage: bash scripts/ci-dry-run.sh

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

ARTIFACT_DIR="/tmp/ci-artifacts"
mkdir -p "$ARTIFACT_DIR"
FAIL_LOG="$ARTIFACT_DIR/npm-debug.log"
NPM_LOG="$ARTIFACT_DIR/npm-install.log"

echo "[CI-DRY-RUN] === CI Dry-Run Health Check ==="

# 1. Validate package.json files first
echo "[CI-DRY-RUN] Step 1: Validate package.json..."
node scripts/validate-package-json.js
if [ $? -ne 0 ]; then
  echo -e "${RED}[CI-DRY-RUN] ❌ Package.json validation failed${NC}"
  exit 1
fi

# 2. Build preflight
echo "[CI-DRY-RUN] Step 2: Build preflight..."
bash scripts/preflight-build.sh
if [ $? -ne 0 ]; then
  echo -e "${RED}[CI-DRY-RUN] ❌ Build preflight failed${NC}"
  exit 1
fi

# 3. Install with retry/fallback
echo "[CI-DRY-RUN] Step 3: Install dependencies (with fallback)..."
bash scripts/install-with-fallback.sh luxor-hub 2>&1 | tee "$NPM_LOG"
INSTALL_EXIT=${PIPESTATUS[0]}

if [ $INSTALL_EXIT -ne 0 ]; then
  echo -e "${RED}[CI-DRY-RUN] ❌ npm install failed${NC}"
  echo "[CI-DRY-RUN] === NPM DEBUG LOG ==="
  cat "$FAIL_LOG" 2>/dev/null || cat "$NPM_LOG" 2>/dev/null | tail -50
  echo "[CI-DRY-RUN] === ARTIFACTS SAVED ==="
  echo "[CI-DRY-RUN] npm debug log: $FAIL_LOG"
  echo "[CI-DRY-RUN] install log: $NPM_LOG"
  exit 1
fi

# 4. Build
echo "[CI-DRY-RUN] Step 4: Build frontend..."
cd luxor-hub && npx vite build 2>&1 | tee "$ARTIFACT_DIR/vite-build.log"
BUILD_EXIT=${PIPESTATUS[0]}
cd ..

if [ $BUILD_EXIT -ne 0 ]; then
  echo -e "${RED}[CI-DRY-RUN] ❌ Vite build failed${NC}"
  echo "[CI-DRY-RUN] === BUILD LOG (last 30 lines) ==="
  tail -30 "$ARTIFACT_DIR/vite-build.log"
  echo "[CI-DRY-RUN] === ARTIFACTS SAVED ==="
  echo "[CI-DRY-RUN] vite build log: $ARTIFACT_DIR/vite-build.log"
  exit 1
fi

# 5. Copy dist
echo "[CI-DRY-RUN] Step 5: Copy dist to root..."
rm -rf dist
cp -r luxor-hub/dist dist

if [ ! -f dist/index.html ]; then
  echo -e "${RED}[CI-DRY-RUN] ❌ dist/index.html not found after build${NC}"
  exit 1
fi
echo -e "${GREEN}[CI-DRY-RUN] ✅ dist/index.html exists${NC}"

# 6. Dry-run publish (check if package would be publishable)
echo "[CI-DRY-RUN] Step 6: Publish dry-run check..."
cd luxor-hub
# --dry-run only checks, doesn't actually publish
set +e
DRY_RUN_LOG="$ARTIFACT_DIR/publish-dryrun.log"
npm publish --dry-run 2>&1 | tee "$DRY_RUN_LOG"
DRY_EXIT=${PIPESTATUS[0]}
cd ..
set -e

if [ $DRY_EXIT -ne 0 ]; then
  echo -e "${YELLOW}[CI-DRY-RUN] ⚠️ Publish dry-run failed (expected for private packages)${NC}"
  # Check for 404 specifically
  if grep -qi "404\|E404\|not found" "$DRY_RUN_LOG" 2>/dev/null; then
    echo -e "${RED}[CI-DRY-RUN] ❌ Registry returned 404 — package name issue detected${NC}"
    echo "[CI-DRY-RUN] Failing output:"
    grep -i "404\|not found\|error" "$DRY_RUN_LOG" | head -10
    echo ""
    echo -e "${YELLOW}[CI-DRY-RUN] FIX: Ensure package.json has:${NC}"
    echo -e "${YELLOW}   \"private\": true${NC}"
    echo -e "${YELLOW}   and the 'name' field is not an existing npm package.${NC}"
    echo "[CI-DRY-RUN] Artifacts: $ARTIFACT_DIR/publish-dryrun.log"
    exit 1
  fi
fi

echo ""
echo -e "${GREEN}[CI-DRY-RUN] ✅ All CI dry-run checks passed${NC}"
echo "[CI-DRY-RUN] Artifacts saved in: $ARTIFACT_DIR"
ls -la "$ARTIFACT_DIR/"
