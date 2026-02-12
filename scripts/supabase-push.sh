#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "Missing .env. Create it with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
  exit 1
fi

# Extract project ref from VITE_SUPABASE_URL (e.g. https://xxxx.supabase.co -> xxxx)
URL=$(grep -E '^VITE_SUPABASE_URL=' .env | cut -d= -f2- | tr -d '"' | tr -d "'")
REF=$(echo "$URL" | sed -n 's|https://\([^.]*\)\.supabase\.co.*|\1|p')

if [ -z "$REF" ]; then
  echo "Could not get project ref from VITE_SUPABASE_URL in .env"
  exit 1
fi

echo "Project ref: $REF"
echo "Linking..."
supabase link --project-ref "$REF"
echo "Pushing migrations..."
supabase db push
