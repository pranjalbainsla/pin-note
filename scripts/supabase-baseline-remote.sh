#!/usr/bin/env bash
# Baseline an existing remote Supabase database against checked-in migrations.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "Removing empty migration stubs (leftover from failed db pull)..."
while IFS= read -r empty_file; do
  echo "  deleting $empty_file"
  rm "$empty_file"
done < <(find supabase/migrations -name '*.sql' -empty 2>/dev/null)

echo "Marking checked-in migrations as already applied on remote..."
npx supabase migration repair 20260616180000 --status applied
npx supabase migration repair 20260616180100 --status applied

echo ""
npx supabase migration list
echo ""
echo "Done. Local and remote migration history should now match."
echo ""
echo "You do NOT need 'npx supabase db pull' for this setup."
echo "db pull requires Docker Desktop (shadow database). Without Docker, use:"
echo "  npx supabase migration new describe_your_change"
echo "  npx supabase db push"
