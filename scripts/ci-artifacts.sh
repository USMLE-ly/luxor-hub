#!/bin/bash
# CI artifact collector: bundles npm debug logs, dist-check artifacts, build logs
# into a tarball for easy diagnosis of publishing failures.
# Usage: bash scripts/ci-artifacts.sh [output_dir]

set -euo pipefail

OUTPUT_DIR="${1:-/tmp/ci-artifacts}"
ARTIFACT_DIR="$OUTPUT_DIR/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$ARTIFACT_DIR"

echo "[ARTIFACTS] === Collecting CI Artifacts ==="

# 1. npm debug logs
for log in /tmp/npm-install-*.log /tmp/npm-debug.log; do
  if [ -f "$log" ]; then
    cp "$log" "$ARTIFACT_DIR/" 2>/dev/null
    echo "[ARTIFACTS] Copied: $(basename $log)"
  fi
done

# 2. Vite build log
if [ -f "/tmp/ci-artifacts/vite-build.log" ]; then
  cp /tmp/ci-artifacts/vite-build.log "$ARTIFACT_DIR/" 2>/dev/null
  echo "[ARTIFACTS] Copied: vite-build.log"
fi

# 3. Publish dry-run log
if [ -f "/tmp/ci-artifacts/publish-dryrun.log" ]; then
  cp /tmp/ci-artifacts/publish-dryrun.log "$ARTIFACT_DIR/" 2>/dev/null
  echo "[ARTIFACTS] Copied: publish-dryrun.log"
fi

# 4. dist-check: verify dist/ exists and has index.html
DIST_CHECK="$ARTIFACT_DIR/dist-check.txt"
{
  echo "=== dist-check ==="
  if [ -f "dist/index.html" ]; then
    echo "status: PASS"
    echo "dist/index.html: exists ($(wc -c < dist/index.html) bytes)"
    echo "dist/ contents:"
    ls -la dist/ | head -10
  else
    echo "status: FAIL"
    echo "dist/index.html: NOT FOUND"
    echo "luxor-hub/dist/ contents:"
    ls -la luxor-hub/dist/ 2>/dev/null | head -10 || echo "(luxor-hub/dist/ missing too)"
  fi
  echo ""
  echo "=== Root package.json ==="
  cat package.json
  echo ""
  echo "=== luxor-hub/package.json (first 15 lines) ==="
  head -15 luxor-hub/package.json
} > "$ARTIFACT_DIR/dist-check.txt"
echo "[ARTIFACTS] Generated: dist-check.txt"

# 5. Environment snapshot
{
  echo "=== Node ==="
  node --version
  echo "=== npm ==="
  npm --version
  echo "=== npm config ==="
  npm config list
  echo "=== Git HEAD ==="
  git log --oneline -3
  echo "=== Git status ==="
  git status --short
  echo "=== Disk usage ==="
  du -sh luxor-hub/node_modules 2>/dev/null || echo "node_modules: missing"
  du -sh dist 2>/dev/null || echo "dist: missing"
  du -sh luxor-hub/dist 2>/dev/null || echo "luxor-hub/dist: missing"
} > "$ARTIFACT_DIR/env-snapshot.txt"
echo "[ARTIFACTS] Generated: env-snapshot.txt"

# 6. Create tarball
TARBALL="$OUTPUT_DIR/ci-artifacts-$(date +%Y%m%d-%H%M%S).tar.gz"
tar -czf "$TARBALL" -C "$OUTPUT_DIR" "$(basename $ARTIFACT_DIR)"
echo ""
echo "[ARTIFACTS] ✅ All artifacts collected:"
ls -la "$ARTIFACT_DIR/"
echo "[ARTIFACTS] Tarball: $TARBALL"
