#!/usr/bin/env bash
# Rebuild the attendee directory (npubs) from a spreadsheet and (re)seed it
# into Cloudflare KV. Personal data — KV-only, never committed.
#
#   npm run attendees:reload -- /path/to/attendee-npubs.xlsx            # local
#   npm run attendees:reload -- /path/to/attendee-npubs.xlsx --remote   # prod
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
XLSX="${1:-/Users/lizsw/aos-convergence-attendee-npubs.xlsx}"
MODE="${2:---local}"

if [[ ! -f "$XLSX" ]]; then
  echo "error: spreadsheet not found: $XLSX" >&2
  exit 1
fi
if [[ "$MODE" != "--local" && "$MODE" != "--remote" ]]; then
  echo "error: second arg must be --local or --remote (got: $MODE)" >&2
  exit 1
fi

echo "→ building attendee list from $XLSX"
python3 "$ROOT/scripts/build-attendees-data.py" "$XLSX"

echo "→ seeding KV ($MODE)"
cd "$ROOT/worker"
npx wrangler kv key put --binding=APPROVALS "attendees:directory" \
  --path attendees-data.local.json "$MODE"

echo "✓ done — hard-refresh the browser to see the update"
