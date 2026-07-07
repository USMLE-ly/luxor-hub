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
FUNCTIONS_DIR="../supabase/functions"

echo "🔗 Linking to Supabase project $PROJECT_REF..."

echo "🚀 Deploying all edge functions..."
for func_dir in "$FUNCTIONS_DIR"/*/; do
  name=$(basename "$func_dir")
  echo "  📦 Deploying $name..."
  npx supabase functions deploy "$name" --project-ref "$PROJECT_REF" 2>&1 | tail -1
done

echo "✅ All functions deployed!"
echo ""
echo "🔑 Don't forget to set secrets:"
echo "   supabase secrets set LOVABLE_API_KEY=your_key --project-ref $PROJECT_REF"
