#!/bin/bash
# Verify built assets contain NO direct Replit URLs.
# Allow: hostname checks like hostname.includes("replit.app") — these are runtime checks
# Reject: hardcoded full URLs like https://nice-useful-plot.replit.app:5000/...
# Usage: scripts/guard-no-replit-urls.sh [dist_dir]

DIST_DIR="${1:-luxor-hub/dist}"

echo "[URL-GUARD] Scanning $DIST_DIR for direct Replit URLs..."

if [ ! -d "$DIST_DIR" ]; then
  echo "[URL-GUARD] ❌ Directory $DIST_DIR does not exist. Run build first."
  exit 1
fi

# Find files containing "replit.app" (any reference)
HITS=$(grep -rl "replit\.app" "$DIST_DIR" 2>/dev/null || true)

BAD_HITS=""
GOOD_HITS=""

for file in $HITS; do
  # Extract actual matches
  while IFS= read -r match; do
    # Allow hostname checks (no protocol prefix = just a pattern match)
    if echo "$match" | grep -qP 'hostname\.includes\(|hostname\.endsWith\(|hostname\s*===\s*'; then
      GOOD_HITS="$GOOD_HITS$file: $match\n"
    # Reject full URLs with protocol
    elif echo "$match" | grep -qP 'https?://'; then
      BAD_HITS="$BAD_HITS$file: $match\n"
    else
      # Anything else — flag as suspicious
      BAD_HITS="$BAD_HITS$file: $match\n"
    fi
  done < <(grep -oP '.{0,60}replit\.app.{0,60}' "$file" 2>/dev/null)
done

if [ -n "$BAD_HITS" ]; then
  echo "[URL-GUARD] ❌ FOUND direct Replit URLs in built assets:"
  echo -e "$BAD_HITS"
  echo "[URL-GUARD] Remove hardcoded Replit URLs from frontend source."
  echo "[URL-GUARD] Use relative paths (/api/...) and let vercel.json rewrites proxy to Replit."
  exit 1
fi

if [ -n "$GOOD_HITS" ]; then
  echo "[URL-GUARD] ℹ️ Found hostname checks (benign runtime detection):"
  echo -e "$GOOD_HITS"
fi

echo "[URL-GUARD] ✅ No hardcoded Replit URLs found in $DIST_DIR"
exit 0
