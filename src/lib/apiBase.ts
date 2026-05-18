// First-party, same-origin as the site (route: convergence.andotherstuff.org/api/*).
// Using the apex site domain — not *.workers.dev — so Brave Shields / content
// blockers don't block API calls. Override with VITE_API_URL for local dev.
export const API_BASE = import.meta.env.VITE_API_URL || 'https://convergence.andotherstuff.org';
