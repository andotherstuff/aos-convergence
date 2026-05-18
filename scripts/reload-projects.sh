#!/usr/bin/env bash
# Rebuild the attendee project directory from an updated spreadsheet and
# (re)seed it into Cloudflare KV.
#
#   npm run projects:reload -- /path/to/projects.xlsx            # local KV
#   npm run projects:reload -- /path/to/projects.xlsx --remote   # prod KV
#
# The cleaned data is gitignored (personal data, public repo) — it only ever
# lives in KV. Defaults to the local Miniflare KV used by `wrangler dev`.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
XLSX="${1:-/Users/lizsw/projects.xlsx}"
MODE="${2:---local}"

if [[ ! -f "$XLSX" ]]; then
  echo "error: spreadsheet not found: $XLSX" >&2
  echo "usage: npm run projects:reload -- /path/to/projects.xlsx [--local|--remote]" >&2
  exit 1
fi
if [[ "$MODE" != "--local" && "$MODE" != "--remote" ]]; then
  echo "error: second arg must be --local or --remote (got: $MODE)" >&2
  exit 1
fi

echo "→ cleaning $XLSX"
python3 "$ROOT/scripts/build-projects-data.py" "$XLSX"

echo "→ seeding KV ($MODE)"
cd "$ROOT/worker"
npx wrangler kv key put --binding=APPROVALS "projects:directory" \
  --path projects-data.local.json "$MODE"

echo "✓ done — hard-refresh the browser to see the update"
