# AOS Convergence — Brand & Design Contract

This document is the shared design contract between the two related AOS Convergence projects:

- **Website** — `convergence.andotherstuff.org` (this repo). Marketing/info surface with the canonical event schedule, About, application form, and gated `/event` page for approved attendees.
- **Attendee app** — `aos-convergence.app` (`convergence-app` repo). Public Nostr-powered companion for attendees (social feed, projects, announcements).

Both surfaces should feel like one product family. When in doubt, copy the patterns documented here verbatim rather than inventing new ones. Updates to this document should be mirrored in the other repo's `AGENTS.md`.

---

## Cross-project links

All website ↔ app links go through small, dedicated modules so URLs can be re-pointed in one place:

- Website: [`src/lib/appLinks.ts`](src/lib/appLinks.ts) — exports `APP_URL`, `WEBSITE_URL`, `SCHEDULE_ANCHOR_URL`, `PROGRAM_ANCHOR_URL`.
- App: `src/lib/constants.ts` — exports `WEBSITE_URL`, `WEBSITE_PROGRAM_FLOW_URL`, `WEBSITE_SCHEDULE_URL`, `WEBSITE_ABOUT_URL`, `WEBSITE_APPLY_URL` (the legacy `PROGRAM_URL` alias remains for the "public overview" fallback shown to logged-out users on the in-app Schedule page).

**Schedule data is shared.** Both the website's `/event` page and the app's `/schedule` page fetch the same gated payload from the worker at `${API_BASE}/api/event` using NIP-98 HTTP Auth (kind 27235). The user must be signed in with Nostr **and** be on the worker's `APPROVALS` KV list to see it. Schedule items live in `worker/src/index.ts` — update them there and both surfaces pick up the change after their TanStack Query staleTime expires (5 minutes).

The app additionally renders a **"Now happening" banner** at the top of the Home and Schedule pages, computed from the same payload using Europe/Oslo wall-clock time. Logic is in `src/lib/scheduleNow.ts` (pure, unit-tested) and `src/components/schedule/NowHappening.tsx` (React).

**Client tag on published events.** Every event the app publishes carries a `["client", "aos-convergence.app"]` tag (canonical value defined in the app at `src/hooks/useNostrPublish.ts:CLIENT_TAG_VALUE`). Rendered feed posts authored by *other* Nostr clients show a small "via &lt;client&gt;" badge in the header; posts authored by this app or carrying no `client` tag render no badge. The composer also surfaces a subtle "Public on Nostr" indicator and a Settings → "Publishing &amp; privacy" disclosure so attendees understand the network is not private to convergence members.

Stable shortcut paths:

- `convergence.andotherstuff.org/event#schedule` — full timed agenda on the website (gated, requires website login + approval).
- `convergence.andotherstuff.org/program#event-flow` — public day-by-day overview (no auth).
- `aos-convergence.app/schedule` — in-app schedule page (gated; renders the same data the website serves, plus the live "Now happening" banner).

---

## Color palette

Identical light-mode tokens on both surfaces. The app additionally implements a dark inverse; the website does not (yet).

| Token | HSL | Hex | Purpose |
|---|---|---|---|
| `--background` | `40 33% 97–98%` | `#fbfaf8` | warm cream page background |
| `--foreground` | `120 3–4% 6–7%` | `#0f100f` | near-black text / primary |
| `--card` / `--popover` | `0 0% 100%` | `#ffffff` | cards |
| `--muted-foreground` | `30–40 3–4% 43%` | `#716f6a` | secondary text, eyebrows |
| `--border` / `--input` | `36–40 10–15% 85%` | `#dedbd5` | warm-dust borders |
| `--secondary` / `--muted` / `--accent` | `40 10–11% 95%` | `#f2f1f0` | soft cream-gray accent panels |
| `--aos-bg-alt` (app only) | `40 20% 97%` | `#f7f6f4` | alternate background |
| `--destructive` | `0 65% 45%` | — | errors only |

PWA / browser chrome:

- `theme-color`: `#fbfaf8`
- `manifest.background_color`: `#fbfaf8`
- `manifest.theme_color`: `#0f100f` (app) / not yet set (website — to be aligned)

---

## Radii

Base radius is **18px**. Use the following scale:

| Use | Value |
|---|---|
| Inline chips, small inputs | 14px (`rounded-[14px]`) |
| Buttons, secondary panels | 16px (`rounded-[16px]`) |
| Cards (default) | **18px** (`rounded-[18px]`) |
| Hero modules / large content blocks | 28px (`rounded-[28px]`) |
| Primary CTAs, pills, tabs | 9999px (`rounded-full`) |

In the app's Tailwind 4 theme, `--radius: 1.125rem` (= 18px) drives the `--radius-sm/md/lg/xl` ramp.

---

## Typography

Both projects currently ship the **system font stack** with no custom face:

```css
system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif
```

Tracking conventions (must match across both surfaces):

| Element | Class / value |
|---|---|
| Eyebrow / kicker | `text-xs tracking-[0.12em] uppercase text-muted-foreground/60` |
| Display headline | `text-[clamp(1.9rem,3.1vw+1.2rem,3rem)] font-semibold tracking-[-0.03em]` |
| Section headline (h2) | `text-[1.4rem] font-semibold tracking-[-0.02em]` |
| Body text | `text-sm` or `text-base leading-relaxed text-muted-foreground` |
| Brand wordmark line 1 | `text-[0.68rem] uppercase tracking-[0.12em] text-muted-foreground font-medium` |
| Brand wordmark line 2 | `text-sm font-semibold tracking-wide text-foreground` |

If/when a custom typeface is adopted, install via `@fontsource-variable/<name>` and set `--font-sans` in both repos' global CSS.

---

## Header lockup

Both surfaces use the same 40×40 logo tile + two-line wordmark layout. The wordmark text differs slightly to reflect each surface's role:

- **Website:** `And Other Stuff` / `Technology for Human Thriving`
- **App:** `And Other Stuff` / `Convergence`

Logo: `/AOS_Official.svg` (identical asset in both repos), rendered at `size-10 rounded-xl` with `border border-[rgba(0,0,0,0.06)]` and a soft shadow (`0 8px 18px rgba(0, 0, 0, 0.06)`). The app additionally applies `dark:invert`.

---

## CTAs

Two canonical button patterns:

**Primary (filled pill):**
```html
<a class="inline-flex items-center px-6 py-3 rounded-full
          bg-foreground text-background text-sm font-medium
          hover:bg-foreground/90 transition-colors">
```

**Secondary (outlined pill, e.g., "Open App"):**
```html
<a class="inline-flex items-center gap-1.5 px-6 py-3 rounded-full
          border border-foreground/15 text-sm font-medium text-foreground
          hover:bg-foreground/[0.04] transition-colors">
```

External links (anything pointing to the other surface) always include:

- `target="_blank"`
- `rel="noopener noreferrer"`
- An `aria-label` clarifying the destination and "(opens in a new tab)"
- A small arrow-up-right glyph after the label

---

## Cross-link surface placement

| Surface | Placement | Destination | Label |
|---|---|---|---|
| Website header (desktop + mobile) | After Apply/Admin | `APP_URL` | "Open App" |
| Website footer | Adjacent to `andotherstuff.org` | `APP_URL` | "Attendee App ↗" |
| Website `/event` hero | Next to Signal CTA | `APP_URL` | "Open App" |
| Website `/program` bottom CTA row | Next to Apply | `APP_URL` | "Approved? Open App" |
| Website `/program` bottom CTA row | Next to Apply | `/event#schedule` | "See the full timed agenda →" |
| App desktop thumbnav | Rightmost segmented control item | `/schedule` (in-app) | "Schedule" |
| App home page (above the kicker) | "Now happening" banner | `/schedule` (in-app) | Live label, item title, countdown |
| App schedule page (above the agenda) | "Now happening" banner | `/schedule` (in-app) | Live label, item title, countdown |
| App bottom nav (mobile) | Rightmost tab | `/schedule` (in-app) | "Schedule" |
| App footer | Inline link group | Several website URLs | "Schedule ↗", "About ↗", "Apply ↗", "Official site ↗" |

---

## OG / social previews

Both surfaces should expose:

- `og:type=website`
- `og:site_name=AOS Convergence`
- A 1600×900 PNG `og-image.png` shared across both repos (the app's `/public/og-image.png` is the reference asset).
- `twitter:card=summary_large_image`

The website's `og-image.png` is a TODO at the time of writing — see `index.html` for the marker.

---

## When to update this document

- A new shared surface (e.g., a "people" / attendee directory) is added to either project.
- A token (color, radius, font) changes in one project — update here first, then propagate.
- A new cross-link surface is introduced — record it in the placement table above.
