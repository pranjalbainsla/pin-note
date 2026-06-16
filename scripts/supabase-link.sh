#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v npx >/dev/null 2>&1; then
  echo "npx is required (Node.js 18+)." >&2
  exit 1
fi

PROJECT_REF="${1:-}"
if [[ -z "$PROJECT_REF" ]]; then
  echo "Usage: ./scripts/supabase-link.sh <project-ref>" >&2
  echo "Find project ref in the Supabase dashboard URL:" >&2
  echo "  https://supabase.com/dashboard/project/<project-ref>" >&2
  echo "Or parse it from SUPABASE_URL in server/.env (subdomain before .supabase.co)." >&2
  exit 1
fi

echo "Logging in to Supabase (opens browser)..."
npx supabase login

echo "Linking project ref: $PROJECT_REF"
npx supabase link --project-ref "$PROJECT_REF"

echo ""
echo "Linked. Next steps for an existing remote database:"
echo ""
echo "  If tables were created manually in the dashboard, baseline migration history:"
echo "       ./scripts/supabase-baseline-remote.sh"
echo ""
echo "  Do NOT run 'npx supabase db pull' before baselining — it creates an empty stub"
echo "  migration and causes a history mismatch."
echo ""
echo "  db pull also requires Docker Desktop. This project uses remote-only migrations"
echo "  (baseline + db push). You do not need db pull after baselining."
echo ""
echo "  After baselining, verify:"
echo "       npx supabase migration list"
