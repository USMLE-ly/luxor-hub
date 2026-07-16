#!/bin/bash
# Verify built assets contain ZERO Replit references.
# No hostname checks, no hardcoded URLs — nothing.
# Usage: scripts/guard-no-replit-urls.sh [dist_dir]

DIST_DIR="${1:-luxor-hub/dist}"

echo "[URL-GUARD] Scanning $DIST_DIR for ANY Replit references..."

if [ ! -d "$DIST_DIR" ]; then
  echo "[URL-GUARD] ❌ Directory $DIST_DIR does not exist. Run build first."
  exit 1
fi

# Grep for ANY reference to replit in built JS/HTML/CSS files
HITS=$(grep -rl "replit" "$DIST_DIR" 2>/dev/null || true)

if [ -n "$HITS" ]; then
  echo "[URL-GUARD] ❌ FOUND Replit references in built assets:"
  for f in $HITS; do
    echo "  $f:"
    grep -n "replit" "$f" | head -3
  done
  echo ""
  echo "[URL-GUARD] Frontend source must not reference Replit at all."
  echo "[URL-GUARD] Remove ALL replit references from luxor-hub/src/ and rebuild."
  exit 1
fi

echo "[URL-GUARD] ✅ Zero Replit references in $DIST_DIR"
exit 0
