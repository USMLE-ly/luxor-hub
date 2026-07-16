#!/bin/bash
# Build preflight: checks that package names won't 404 from sandbox registries.
# If a name resolves to a private/internal package, prints the exact fix.
# Usage: bash scripts/preflight-build.sh

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

FAIL=0

check_package_name() {
  local pkg_json="$1"
  local label="$2"

  if [ ! -f "$pkg_json" ]; then
    echo -e "${YELLOW}[PREFLIGHT] $label: $pkg_json not found, skipping${NC}"
    return
  fi

  local name
  name=$(node -e "console.log(require('./$pkg_json').name || '')")
  local private
  private=$(node -e "console.log(require('./$pkg_json').private || false)")

  if [ -z "$name" ]; then
    echo -e "${GREEN}[PREFLIGHT] $label: no name field (OK for workspace)${NC}"
    return
  fi

  echo -e "[PREFLIGHT] $label: name=$name private=$private"

  # Check for private/internal names that will 404 on public npm
  if echo "$name" | grep -qE '^@lovable/|^@vercel/|^@replit/|^@next/'; then
    echo -e "${RED}[PREFLIGHT] ❌ $label: '$name' looks like a private/sandbox-scoped package.${NC}"
    echo -e "${RED}   This will 404 when the build system tries to install/publish it.${NC}"
    echo ""
    echo -e "${YELLOW}   FIX: Change the 'name' field in $pkg_json to something unique:${NC}"
    echo -e "${YELLOW}     \"name\": \"luxor-hub\"${NC}"
    echo -e "${YELLOW}   Then run: npm install${NC}"
    echo -e "${YELLOW}   This prevents the build system from treating your repo as an npm package.${NC}"
    FAIL=1
    return
  fi

  # Check if name matches a known public package that would cause conflicts
  if echo "$name" | grep -qE '^react$|^vite$|^typescript$|^next$'; then
    echo -e "${RED}[PREFLIGHT] ❌ $label: '$name' collides with a well-known public package.${NC}"
    echo -e "${YELLOW}   FIX: Rename to something project-specific like 'luxor-hub'.${NC}"
    FAIL=1
    return
  fi

  echo -e "${GREEN}[PREFLIGHT] $label: '$name' looks safe${NC}"
}

echo "[PREFLIGHT] === Build Preflight Checks ==="

# 1. Check root package.json
check_package_name "package.json" "Root"

# 2. Check luxor-hub/package.json
check_package_name "luxor-hub/package.json" "luxor-hub"

# 3. Check for .npmrc that might point to a sandbox registry
for rc in .npmrc luxor-hub/.npmrc; do
  if [ -f "$rc" ]; then
    echo -e "[PREFLIGHT] Found $rc:"
    cat "$rc"
    if grep -qE 'registry.*replit|registry.*sandbox|registry.*vercel|registry.*lovable' "$rc" 2>/dev/null; then
      echo -e "${RED}[PREFLIGHT] ❌ $rc points to a sandbox/private registry.${NC}"
      echo -e "${YELLOW}   FIX: Remove or comment out the registry line:${NC}"
      echo -e "${YELLOW}     # registry=https://registry.npmjs.org/${NC}"
      FAIL=1
    fi
  fi
done

# 4. Check for lockfile integrity
for lock in package-lock.json luxor-hub/package-lock.json; do
  if [ -f "$lock" ]; then
    if node -e "JSON.parse(require('fs').readFileSync('$lock','utf8'))" 2>/dev/null; then
      echo -e "${GREEN}[PREFLIGHT] $lock: valid JSON${NC}"
    else
      echo -e "${RED}[PREFLIGHT] ❌ $lock: corrupted JSON${NC}"
      echo -e "${YELLOW}   FIX: Delete $lock and run npm install to regenerate${NC}"
      FAIL=1
    fi
  fi
done

# 5. Check node_modules exists
if [ ! -d "luxor-hub/node_modules" ]; then
  echo -e "${YELLOW}[PREFLIGHT] luxor-hub/node_modules missing — npm install needed before build${NC}"
fi

echo ""
if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}[PREFLIGHT] ✅ All checks passed${NC}"
  exit 0
else
  echo -e "${RED}[PREFLIGHT] ❌ Preflight failed — fix the issues above before building${NC}"
  exit 1
fi
