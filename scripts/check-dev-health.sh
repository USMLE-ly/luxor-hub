#!/bin/bash
# Health check with retries and log dump on failure
# Usage: scripts/check-dev-health.sh [port] [max_retries] [sleep_secs]

PORT="${1:-8080}"
MAX_RETRIES="${2:-30}"
SLEEP_SECS="${3:-2}"

echo "[HEALTH] Checking dev server on port $PORT (max ${MAX_RETRIES} retries, ${SLEEP_SECS}s apart)..."

for i in $(seq 1 "$MAX_RETRIES"); do
  sleep "$SLEEP_SECS"
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT/" 2>/dev/null)
  if [ "$HTTP_CODE" = "200" ]; then
    echo "[HEALTH] ✅ Healthy (HTTP $HTTP_CODE) after ${i}x${SLEEP_SECS}s"
    BODY=$(curl -s "http://localhost:$PORT/" 2>/dev/null)
    echo "$BODY" | head -5
    if echo "$BODY" | grep -q 'id="root"'; then
      echo "[HEALTH] ✅ Root div present"
    else
      echo "[HEALTH] ⚠️ Root div not found"
    fi
    exit 0
  fi
  echo "[HEALTH] Attempt $i: HTTP $HTTP_CODE — still waiting..."
done

# FAILURE: dump logs
echo "[HEALTH] ❌ FAILED after $MAX_RETRIES retries. Dumping last server state:"
echo "--- LAST LOGS (if available) ---"
if [ -f /tmp/vite-dev-log.txt ]; then
  tail -50 /tmp/vite-dev-log.txt
else
  echo "(no log file at /tmp/vite-dev-log.txt)"
fi
echo "--- PORTS IN USE ---"
ss -tlnp 2>/dev/null | grep -E "8080|5000" || echo "(no ports 8080/5000 bound)"
echo "--- Failing command ---"
echo "npm run dev (in luxor-hub/)"
exit 1
