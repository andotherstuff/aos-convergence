#!/usr/bin/env bash
# (Re)seed the synthesized "Hard Problems" Open Space content into Cloudflare KV.
#
#   npm run hard-problems:reload              # local KV (wrangler dev)
#   npm run hard-problems:reload -- --remote  # prod KV
#
# The content is hand-authored (no spreadsheet build step) but is derived from
# attendee applications, so — like the project/attendee directories — it is
# gitignored and only ever lives in KV, served behind the approved-attendee
# gate at GET /api/hard-problems.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODE="${1:---local}"
DATA="$ROOT/worker/hard-problems-data.local.json"

if [[ ! -f "$DATA" ]]; then
  echo "error: content file not found: $DATA" >&2
  exit 1
fi
if [[ "$MODE" != "--local" && "$MODE" != "--remote" ]]; then
  echo "error: arg must be --local or --remote (got: $MODE)" >&2
  exit 1
fi

# Fail fast on malformed JSON before it reaches KV.
python3 -c "import json,sys; json.load(open('$DATA'))"

echo "→ seeding KV ($MODE)"
cd "$ROOT/worker"
npx wrangler kv key put --binding=APPROVALS "insights:hard-problems" \
  --path "$DATA" "$MODE"

echo "✓ done — hard-refresh the browser to see the update"
