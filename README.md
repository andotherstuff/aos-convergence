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

## Sponsors

- [Human Rights Foundation](https://hrf.org) — HRF is offering accepted participants a complimentary [Oslo Freedom Forum](https://hrf.org/latest/the-oslo-freedom-forum-returns-june-1-3-2026) pass (subject to HRF approval).

## License

Open source.
