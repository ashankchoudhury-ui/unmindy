#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Deploying UNMINDY landing page..."

# Check if vercel CLI is available
if ! command -v vercel &> /dev/null; then
  echo "📦 Vercel CLI not found. Install with: npm i -g vercel"
  echo "   Or deploy manually from Vercel dashboard."
  exit 1
fi

# Deploy landing page
echo "📤 Deploying landing page..."
cd "$(dirname "$0")/../landing"
vercel --yes --prod

echo "✅ Done!"
