#!/bin/bash
# Deploy all 18 Supabase Edge Functions
# Usage: SUPABASE_ACCESS_TOKEN="sbp_..." bash scripts/deploy-edge-functions.sh

set -e

if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
  echo "❌ SUPABASE_ACCESS_TOKEN not set."
  echo "   Get one: Supabase Dashboard → Settings → API → Access Tokens"
  exit 1
fi

PROJECT_REF="zmqfcyweqllmupszbppd"
# Functions dir relative to script location: scripts/../supabase/functions
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FUNCTIONS_DIR="$SCRIPT_DIR/../supabase/functions"

echo "🔗 Deploying to Supabase project $PROJECT_REF..."
echo "📁 Functions directory: $FUNCTIONS_DIR"

echo "🚀 Deploying all edge functions..."
for func_dir in "$FUNCTIONS_DIR"/*/; do
  name=$(basename "$func_dir")
  echo "  📦 Deploying $name..."
  npx supabase functions deploy "$name" --project-ref "$PROJECT_REF" 2>&1 | tail -1
done

echo "✅ All functions deployed!"
echo ""
echo "🔑 Set required secrets:"
echo "   npx supabase secrets set MIMO_API_KEY=your_key --project-ref $PROJECT_REF"
