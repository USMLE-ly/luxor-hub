#!/bin/bash
# npm install with retry + fallback to public registry on 404.
# If the sandbox registry returns 404, automatically falls back to registry.npmjs.org.
# Usage: bash scripts/install-with-fallback.sh [prefix_dir]

set -euo pipefail

PREFIX="${1:-luxor-hub}"
MAX_RETRIES=3
PUBLIC_REGISTRY="https://registry.npmjs.org/"

echo "[INSTALL] Running npm install in $PREFIX (with registry fallback)..."

for attempt in $(seq 1 $MAX_RETRIES); do
  echo "[INSTALL] Attempt $attempt/$MAX_RETRIES..."

  # Run npm install, capture output and exit code
  LOG_FILE="/tmp/npm-install-attempt-${attempt}.log"
  set +e
  npm --prefix "$PREFIX" install --ignore-engines 2>&1 | tee "$LOG_FILE"
  EXIT_CODE=${PIPESTATUS[0]}
  set -e

  if [ $EXIT_CODE -eq 0 ]; then
    echo "[INSTALL] ✅ npm install succeeded on attempt $attempt"
    exit 0
  fi

  # Check if failure was a 404
  if grep -qi "404\|E404\|not found\|No matching version" "$LOG_FILE" 2>/dev/null; then
    echo "[INSTALL] ⚠️ 404 detected — falling back to public npm registry..."
    echo "[INSTALL] Setting registry to $PUBLIC_REGISTRY for $PREFIX"
    npm --prefix "$PREFIX" config set registry "$PUBLIC_REGISTRY"

    # Retry with public registry
    set +e
    npm --prefix "$PREFIX" install --ignore-engines 2>&1 | tee "/tmp/npm-install-fallback.log"
    FALLBACK_EXIT=${PIPESTATUS[0]}
    set -e

    if [ $FALLBACK_EXIT -eq 0 ]; then
      echo "[INSTALL] ✅ npm install succeeded with public registry fallback"
      exit 0
    fi

    echo "[INSTALL] ❌ Public registry fallback also failed"
    echo "[INSTALL] Last 30 lines of fallback log:"
    tail -30 "/tmp/npm-install-fallback.log"
    exit 1
  fi

  # Non-404 failure — just retry
  echo "[INSTALL] Non-404 failure, retrying in 2s..."
  sleep 2
done

echo "[INSTALL] ❌ All $MAX_RETRIES attempts failed"
echo "[INSTALL] Last log: $LOG_FILE"
tail -20 "$LOG_FILE"
exit 1
