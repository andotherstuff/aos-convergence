#!/usr/bin/env python3
"""
Importer: read the approved-attendee npub list and emit a GITIGNORED JSON
file to upload into Cloudflare KV (key `attendees:directory`).

Personal data, public repo — never commit. The worker serves it behind the
approved-attendee gate; display names/avatars are resolved client-side from
Nostr profiles.

Usage:
    python3 scripts/build-attendees-data.py /path/to/attendee-npubs.xlsx
    # then run the printed `wrangler kv key put ...` command
"""
import json
import re
import sys
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "worker" / "attendees-data.local.json"
KV_KEY = "attendees:directory"
NPUB_RE = re.compile(r"npub1[0-9a-z]{20,}")


def main() -> None:
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(
        "/Users/lizsw/aos-convergence-attendee-npubs.xlsx"
    )
    wb = openpyxl.load_workbook(src, data_only=True)
    ws = wb.worksheets[0]

    seen: set[str] = set()
    attendees: list[dict] = []
    for row in ws.iter_rows(values_only=True):
        if not row or not row[0]:
            continue
        m = NPUB_RE.search(str(row[0]).strip())
        if not m:
            continue
        npub = m.group(0)
        if npub in seen:
            continue
        seen.add(npub)
        attendees.append({"npub": npub})

    attendees.sort(key=lambda a: a["npub"])
    OUT.write_text(json.dumps(attendees, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"wrote {OUT} — {len(attendees)} attendees")
    print("\nUpload to Cloudflare KV (run from worker/):")
    print(
        f'  cd worker && npx wrangler kv key put --binding=APPROVALS '
        f'"{KV_KEY}" --path ../{OUT.name} --remote'
    )
    print("Local dev: same command with --local instead of --remote.")


if __name__ == "__main__":
    main()
