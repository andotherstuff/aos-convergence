# AOS Convergence — Oslo 2026

A curated three-day gathering for builders, researchers, funders, and community leaders actively working to expand human agency through open systems.

**May 29–31, 2026 · Oslo, Norway**

## About

AOS Convergence is a small, invitation-only event organized by [And Other Stuff](https://andotherstuff.org) focused on:

- Open protocols over platforms
- Expanding human agency
- Building tools that protect freedom of speech, assembly, and transaction
- Shipping real products, not just theory

## Site

The website includes:

- **Landing page** with event info and inline Nostr login (NIP-07 extension or nsec)
- **Event details** (schedule, venue, Signal group) gated behind NIP-98 server-side authentication
- **Application form** for prospective attendees (via Formspree)

## Architecture

- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui, built on [mkstack](https://soapbox.pub/mkstack)
- **Auth**: Nostr NIP-07 (browser extension) and NIP-98 (HTTP auth) via signed events
- **API**: Cloudflare Worker that validates NIP-98 tokens and checks npubs against an approved attendee list
- **Forms**: Formspree for application submissions

## Development

```bash
# Frontend
npm install
npm run dev

# Worker (in a separate terminal)
cd worker
npm install
npx wrangler dev
```

Set `VITE_API_URL` in your environment to point at the worker (defaults to `http://localhost:8787`).

### Cross-project links

This site is one of two related projects that share branding and link to each other:

- **Website** (this repo) — `convergence.andotherstuff.org`. Marketing/info site with the canonical event schedule, About, application form, and gated `/event` page for approved attendees.
- **Attendee app** (`convergence-app` repo) — `aos-convergence.app`. Public Nostr-powered companion for attendees (social feed, projects, announcements).

The URLs used to link between them are centralized in [`src/lib/appLinks.ts`](src/lib/appLinks.ts) and can be overridden at build time:

| Env var | Default | Purpose |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8787` (dev) | Cloudflare Worker API base |
| `VITE_APP_URL` | `https://aos-convergence.app` | Attendee app URL used in header/footer/event-page CTAs |
| `VITE_WEBSITE_URL` | `https://convergence.andotherstuff.org` | Self-reference used to build deep-link anchors |

Shared design tokens (colors, radii, eyebrow/CTA patterns, header lockup) are documented in [`BRAND.md`](BRAND.md) — both projects follow it to stay visually aligned.

## Managing approved attendee npubs

This project now uses a Cloudflare KV namespace for approvals so multiple admins can manage access from the app.

### Setup

1. Create a KV namespace and bind it as `APPROVALS` in `worker/wrangler.toml`.
2. Set `ADMIN_PUBKEYS` secret (comma-separated hex pubkeys for admin keys).
3. Set `SIGNAL_GROUP_LINK` secret.

```bash
cd worker

# Admin allowlist entries can be npub or hex, comma-separated
npx wrangler secret put ADMIN_PUBKEYS
npx wrangler secret put SIGNAL_GROUP_LINK
```

### Admin management UI

Admins can manage approvals in-app at:

- `/admin`

Admin actions:
- List approved npubs
- Add npub
- Remove npub

All admin API actions require NIP-98 auth and the signer pubkey must be in `ADMIN_PUBKEYS`.

### Legacy fallback

If `APPROVALS` KV is not configured, the worker falls back to `APPROVED_NPUBS` secret for gated access checks only.
This fallback is intended for migration and should be removed once KV is live.

## Sponsors

- [Human Rights Foundation](https://hrf.org) — HRF is offering accepted participants a complimentary [Oslo Freedom Forum](https://hrf.org/latest/the-oslo-freedom-forum-returns-june-1-3-2026) pass (subject to HRF approval).

## License

Open source.
