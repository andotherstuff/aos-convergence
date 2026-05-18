#!/usr/bin/env python3
"""
Importer: clean the attendee-projects export (link columns only) and emit a
GITIGNORED JSON file to upload into Cloudflare KV (key `projects:directory`).

The current export has only `link_github`, `link_other`, `link_website` —
no descriptions, no npubs. Cards are link-only; a display title is derived
from the best available URL. The 13 Foundry projects (rich descriptions) are
merged in + de-duplicated by the worker, not here.

Personal/curated data, public repo — never commit. Worker serves it gated.

Usage:
    python3 scripts/build-projects-data.py /path/to/attendee-projects.xlsx
"""
import hashlib
import html
import json
import re
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "worker" / "projects-data.local.json"
KV_KEY = "projects:directory"

# Per-project icon overrides (by stable id). Applied last, after enrichment,
# so they survive reloads. Used when the GitHub-avatar/monogram default isn't
# what the organizer wants.
# id -> site whose real favicon to use (resolved from that site's HTML at
# build time). Forces a favicon even when the default would be a GitHub avatar.
ICON_OVERRIDES = {
    "p_cae0ed801099": "https://abrimos.info",  # abrimos.info
    "p_42f17bbfc2d5": "https://seattlecommunitynetwork.org",  # Seattle Community Network
    "p_cc048afaf77e": "https://weboftrustfoundation.com",  # Web of Trust Foundation
}

# Per-project EXACT icon URL overrides (by stable id), applied last. Use when a
# specific favicon URL is known-good and we don't want HTML/site resolution.
ICON_URL_OVERRIDES = {
    "p_8b8327841d9b": "https://proofmode.org/favicon.ico",  # Proofmode
    "p_3697e5a313b2": "https://bffbtc.org/favicon.ico",  # Bitcoin for Fairness
}

# Per-project display-title overrides (by stable id), applied after enrichment.
TITLE_OVERRIDES = {
    "p_42f17bbfc2d5": "Seattle Community Network",
    "p_f0172c42c700": "Vertex",
    "p_8aede5875f39": "Hello.cv",
    "p_dca2904e9a26": "Alexandria Gitcitadel",
    "p_3697e5a313b2": "Bitcoin for Fairness",
    "p_7b4ce7cbacb8": "SocialRoots",
    "p_7b6865534ff8": "Open Collective",
    "p_f1276b1ba6bd": "Blacksky Algorithms",
}

# Per-project description overrides (by stable id), applied after enrichment.
# Curated, public-facing copy — overrides whatever OpenGraph scraping found.
DESCRIPTION_OVERRIDES = {
    "p_cae0ed801099": (
        "Abrimos.info combines experience opening data with extensive "
        "narrative, research and development capabilities to create reliable "
        "and verified databases that promote strategic knowledge."
    ),
    "p_3697e5a313b2": (
        "Bitcoin for Fairness is an initiative raising knowledge and "
        "understanding of Bitcoin with a focus on civil and human rights."
    ),
    "p_6af0ced575e5": (
        "Use AI to aggregate content, publish unstoppable stories on Nostr's "
        "censorship-resistant relay network, and earn with Bitcoin Lightning "
        "subscriptions."
    ),
    "p_7b6865534ff8": (
        "Open Collective provides the infrastructure for effective financial "
        "coordination. Enabling organizations, groups and communities to "
        "build trust around money."
    ),
    "p_998382d06c16": "Web application for Cashu mint management.",
    "p_f1276b1ba6bd": (
        "Building the future of self-governable online communities with "
        "tools that make complex infrastructure simple to deploy."
    ),
}

# Per-project website-link overrides (by stable id). Replaces website[]
# entirely, applied after enrichment.
WEBSITE_OVERRIDES = {
    "p_f1276b1ba6bd": ["https://blackskyweb.xyz"],  # Blacksky Algorithms
}

# Projects removed by the organizer (by stable id) — dropped from output.
REMOVE_IDS = {
    "p_f1f580aafdae",  # Andrea Diaz Correia - Open source developer
    "p_66ba911503b0",  # techno-ethica · Wouter Constant
    "p_4e9f57352a06",  # gaby-frei - Overview
    "p_ad7d0547f2f9",  # Towards Liberty
}
URL_RE = re.compile(r"https?://[^\s,;]+", re.IGNORECASE)


def repair_url(raw: str) -> str | None:
    """Best-effort repair of a single malformed URL-ish token."""
    u = raw.strip().strip(".,;").strip()
    if not u:
        return None
    low = u.lower()
    junk = ("lol", "n/a", "na", "none", "no ", "i avoid", "why would", "i don't use")
    if low in ("no", "-", "—") or any(low.startswith(j) for j in junk):
        m = URL_RE.search(u)
        return m.group(0).rstrip(".,;") if m else None
    if u.startswith("@") and " " not in u:
        return "https://x.com/" + u[1:]
    u = re.sub(r"^\s*https?\s*:?/*", "https://", u, flags=re.IGNORECASE)
    if not u.lower().startswith(("http://", "https://")):
        if re.match(r"^[\w.-]+\.[a-z]{2,}(/|$)", low):
            u = "https://" + u
        else:
            return None
    m = re.match(r"^(https?://)([^/]+)(/.*)?$", u, re.IGNORECASE)
    if m:
        host = m.group(2).replace(" ", ".").replace(",", ".")
        host = re.sub(r"\.{2,}", ".", host).strip(".")
        u = m.group(1).lower() + host + (m.group(3) or "")
    if " " in u or "." not in u.split("//", 1)[-1].split("/", 1)[0]:
        return None
    return u.rstrip(".,;")


def extract_urls(value) -> list[str]:
    if value is None:
        return []
    raw = str(value).strip()
    if not raw:
        return []
    found = URL_RE.findall(raw)
    candidates = found if found else re.split(r"[;\n]| , ", raw)
    out: list[str] = []
    for c in candidates:
        r = repair_url(c)
        if r and r not in out:
            out.append(r)
    return out


def host_of(url: str) -> str:
    m = re.match(r"^https?://([^/]+)", url, re.IGNORECASE)
    return re.sub(r"^www\.", "", m.group(1)).lower() if m else url


def gh_slug(url: str) -> str | None:
    m = re.match(r"^https?://(?:www\.)?github\.com/([^/]+(?:/[^/]+)?)", url, re.I)
    return m.group(1).rstrip("/").lower() if m else None


def origin_of(url: str) -> str | None:
    m = re.match(r"^(https?://[^/]+)", url, re.I)
    return m.group(1) if m else None


def default_icon(project: dict, meta: dict | None = None) -> str:
    """GitHub owner avatar if there's a github link; else the site's real
    favicon parsed from its HTML (with /favicon.ico fallback); else '' so the
    UI shows a monogram."""
    owner = gh_owner(project["github"])
    if owner:
        return f"https://github.com/{owner}.png?size=80"
    if meta and meta.get("icon"):
        return meta["icon"]
    site = (project["website"] or project["other"] or [None])[0]
    origin = origin_of(site) if site else None
    return f"{origin}/favicon.ico" if origin else ""


def derive_title(website: list[str], github: list[str], other: list[str]) -> str:
    if website:
        return host_of(website[0])
    if github:
        return "github.com/" + (gh_slug(github[0]) or host_of(github[0]))
    if other:
        return host_of(other[0])
    return "Untitled project"


def prettify(host_or_slug: str) -> str:
    """canarybitcoin.com -> 'Canary Bitcoin'; github.com/foo-bar -> 'Foo Bar'."""
    base = host_or_slug.split("/")[-1] if "/" in host_or_slug else host_or_slug
    base = re.sub(r"\.(com|org|net|io|dev|app|ai|xyz|so|gg|pub|space|tech|me)$", "", base)
    words = re.split(r"[.\-_]+", base)
    return " ".join(w[:1].upper() + w[1:] for w in words if w) or host_or_slug


def gh_owner(github: list[str]) -> str | None:
    for u in github:
        m = re.match(r"^https?://(?:www\.)?github\.com/([^/?#]+)", u, re.I)
        if m and m.group(1).lower() not in ("orgs", "sponsors", "about"):
            return m.group(1)
    return None


_META_RE = re.compile(
    r'<meta[^>]+(?:property|name)=["\'](og:title|og:description|description)["\']'
    r'[^>]*content=["\']([^"\']*)["\']',
    re.I,
)
_META_RE_REV = re.compile(
    r'<meta[^>]+content=["\']([^"\']*)["\'][^>]*'
    r'(?:property|name)=["\'](og:title|og:description|description)["\']',
    re.I,
)
_TITLE_RE = re.compile(r"<title[^>]*>([^<]+)</title>", re.I)
# <link rel="icon|shortcut icon|apple-touch-icon" href="...">, attrs either order.
_ICON_RE = re.compile(
    r'<link[^>]+rel=["\'][^"\']*\bicon\b[^"\']*["\'][^>]*href=["\']([^"\']+)["\']',
    re.I,
)
_ICON_RE_REV = re.compile(
    r'<link[^>]+href=["\']([^"\']+)["\'][^>]*rel=["\'][^"\']*\bicon\b[^"\']*["\']',
    re.I,
)


def _abs_url(base: str, href: str) -> str | None:
    href = href.strip()
    origin = origin_of(base)
    if not href or not origin:
        return None
    if href.startswith(("http://", "https://")):
        return href
    if href.startswith("//"):
        return "https:" + href
    if href.startswith("/"):
        return origin + href
    return origin + "/" + href.lstrip("./")


def favicon_from_html(page_url: str, raw: str) -> str | None:
    m = _ICON_RE.search(raw) or _ICON_RE_REV.search(raw)
    if m:
        return _abs_url(page_url, html.unescape(m.group(1)))
    return None


def fetch_meta(url: str) -> dict:
    """Best-effort OpenGraph/title scrape of a public page. Never raises."""
    try:
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (compatible; AOSConvergenceBot/1.0)",
                "Accept": "text/html",
            },
        )
        with urllib.request.urlopen(req, timeout=6) as resp:
            raw = resp.read(200_000).decode("utf-8", "ignore")
    except Exception:
        return {}
    found: dict[str, str] = {}
    for m in _META_RE.finditer(raw):
        found.setdefault(m.group(1).lower(), html.unescape(m.group(2)).strip())
    for m in _META_RE_REV.finditer(raw):
        found.setdefault(m.group(2).lower(), html.unescape(m.group(1)).strip())
    tm = _TITLE_RE.search(raw)
    if tm:
        found.setdefault("title", html.unescape(tm.group(1)).strip())
    out = {}
    title = found.get("og:title") or found.get("title")
    desc = found.get("og:description") or found.get("description")
    if title:
        out["title"] = title.strip()[:80]
    if desc:
        out["description"] = re.sub(r"\s+", " ", desc).strip()[:220]
    icon = favicon_from_html(url, raw)
    if icon:
        out["icon"] = icon
    return out


def enrich(project: dict) -> dict:
    primary = (
        (project["website"] or [None])[0]
        or (project["github"] or [None])[0]
        or (project["other"] or [None])[0]
    )
    meta = fetch_meta(primary) if primary else {}
    project["icon"] = default_icon(project, meta)
    project["description"] = meta.get("description", "")
    if meta.get("title"):
        project["title"] = meta["title"]
    else:
        project["title"] = prettify(project["title"])
    return project


def main() -> None:
    src = Path(sys.argv[1]) if len(sys.argv) > 1 and not sys.argv[1].startswith("-") else Path(
        "/Users/lizsw/aos-convergence-attendee-projects.xlsx"
    )
    wb = openpyxl.load_workbook(src, data_only=True)
    ws = wb.worksheets[0]
    rows = list(ws.iter_rows(values_only=True))
    header = [str(h).strip() for h in rows[0]]
    col = {name: i for i, name in enumerate(header)}

    by_key: dict[str, dict] = {}
    skipped = 0
    for r in rows[1:]:
        if not any(c not in (None, "") for c in r):
            continue
        website = extract_urls(r[col["link_website"]])
        github = extract_urls(r[col["link_github"]])
        other = extract_urls(r[col["link_other"]])
        if not (website or github or other):
            skipped += 1
            continue
        # De-dupe identical link sets (same submission twice).
        sig = "|".join(sorted(website + github + other))
        pid = "p_" + hashlib.sha1(sig.encode()).hexdigest()[:12]
        if pid in by_key:
            continue
        by_key[pid] = {
            "id": pid,
            "title": derive_title(website, github, other),
            "website": website,
            "github": github,
            "other": other,
            "source": "attendee",
        }

    projects = list(by_key.values())

    if "--no-enrich" in sys.argv:
        for p in projects:
            p["title"] = prettify(p["title"])
            p["description"] = ""
            p["icon"] = default_icon(p)
        enriched = 0
    else:
        print(f"enriching {len(projects)} projects from public links (build-time)…")
        with ThreadPoolExecutor(max_workers=12) as ex:
            projects = list(ex.map(enrich, projects))
        enriched = sum(1 for p in projects if p.get("description") or p.get("icon"))

    icon_override_cache: dict[str, str] = {}
    for site in set(ICON_OVERRIDES.values()):
        fm = fetch_meta(site)
        icon_override_cache[site] = fm.get("icon") or (
            (origin_of(site) or site) + "/favicon.ico"
        )
    for p in projects:
        if p["id"] in ICON_OVERRIDES:
            p["icon"] = icon_override_cache[ICON_OVERRIDES[p["id"]]]
        if p["id"] in ICON_URL_OVERRIDES:
            p["icon"] = ICON_URL_OVERRIDES[p["id"]]
        if p["id"] in TITLE_OVERRIDES:
            p["title"] = TITLE_OVERRIDES[p["id"]]
        if p["id"] in DESCRIPTION_OVERRIDES:
            p["description"] = DESCRIPTION_OVERRIDES[p["id"]]
        if p["id"] in WEBSITE_OVERRIDES:
            p["website"] = list(WEBSITE_OVERRIDES[p["id"]])

    removed = [p for p in projects if p["id"] in REMOVE_IDS]
    projects = [p for p in projects if p["id"] not in REMOVE_IDS]
    if removed:
        print(f"removed {len(removed)} project(s) per REMOVE_IDS: "
              + ", ".join(p["id"] for p in removed))

    projects = sorted(projects, key=lambda p: p["title"].lower())
    OUT.write_text(json.dumps(projects, ensure_ascii=False, indent=2), encoding="utf-8")
    print(
        f"wrote {OUT} — {len(projects)} attendee projects "
        f"(skipped {skipped} empty; enriched {enriched})"
    )
    print("sample:", json.dumps(projects[0], ensure_ascii=False)[:200])
    print("\nUpload to Cloudflare KV (run from worker/):")
    print(
        f'  cd worker && npx wrangler kv key put --binding=APPROVALS '
        f'"{KV_KEY}" --path ../{OUT.name} --remote'
    )
    print("Local dev: same command with --local instead of --remote.")


if __name__ == "__main__":
    main()
