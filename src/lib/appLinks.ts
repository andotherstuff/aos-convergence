/**
 * Canonical cross-project URLs.
 *
 * The AOS Convergence experience spans two related projects that share
 * branding and link to each other:
 *
 *  - **Website** (this repo) — convergence.andotherstuff.org. The marketing
 *    and information surface: About, Program, gated /event page with the
 *    full timed agenda, and the application form.
 *  - **App** — aos-convergence.app. The attendee-facing companion app
 *    (public Nostr feed, project showcase, announcements, zaps).
 *
 * Centralizing these URLs here keeps the two surfaces easy to re-point
 * (e.g., for staging deploys) and ensures consistent labeling across all
 * call sites. Override at build time with `VITE_APP_URL` / `VITE_WEBSITE_URL`.
 *
 * See `BRAND.md` at the root of this repo for the shared design contract
 * (colors, radii, eyebrow/CTA patterns, header lockup) that keeps the two
 * projects feeling like one product.
 */

/** Public URL of the attendee companion app. */
export const APP_URL =
  import.meta.env.VITE_APP_URL ?? "https://aos-convergence.app";

/** Public URL of this marketing/info website. */
export const WEBSITE_URL =
  import.meta.env.VITE_WEBSITE_URL ?? "https://convergence.andotherstuff.org";

/**
 * Deep-link to the full timed agenda on the gated `/event` page. Requires
 * the visitor to be logged in and on the approved attendee list. The app
 * does not currently link here directly (it uses the public anchor below),
 * but the URL is exposed so future surfaces can deep-link approved users.
 */
export const SCHEDULE_ANCHOR_URL = `${WEBSITE_URL}/event#schedule`;

/**
 * Deep-link to the public day-by-day "Event Flow" section on `/program`.
 * This is the default schedule destination the app links to because it
 * never blocks unapproved visitors. Approved attendees can click through
 * to the full timed agenda from there.
 */
export const PROGRAM_ANCHOR_URL = `${WEBSITE_URL}/program#event-flow`;
