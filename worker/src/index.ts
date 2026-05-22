import { verifyEvent, nip19 } from 'nostr-tools';
import { FOUNDRY_PROJECTS } from './foundryProjects';

interface Env {
  APPROVALS?: KVNamespace;
  APPROVED_NPUBS?: string; // Legacy fallback
  ADMIN_PUBKEYS?: string; // Comma-separated admin identities (npub or hex)
  SIGNAL_GROUP_LINK: string;
  FORMSPREE_API_KEY?: string; // API key for fetching form submissions
}

interface ApprovalRecord {
  npub: string;
  name: string;
  email: string;
  tshirt_size: string;
  dietary_restrictions: string;
  mobility_concerns: string;
  signal: string;
  contact_email_only: string;
  hrf_opt_in: string;
  outreach_status: string;
  notes: string;
  addedAt: string;
  addedBy: string;
  updatedAt: string;
  updatedBy: string;
}

interface ApprovalInput {
  npub?: string;
  name?: string;
  email?: string;
  tshirt_size?: string;
  dietary_restrictions?: string;
  mobility_concerns?: string;
  signal?: string;
  contact_email_only?: string;
  hrf_opt_in?: string;
  outreach_status?: string;
  notes?: string;
}

interface ApplicationDecision {
  submissionId: string;
  status: 'accepted' | 'rejected';
  decidedAt: string;
  decidedBy: string;
  npub?: string;
}

interface NostrAuthEvent {
  kind: number;
  pubkey: string;
  created_at: number;
  tags: string[][];
  content: string;
  sig: string;
  id: string;
}

// Welcome Guide — practical on-the-ground info for approved attendees.
// Venue address, organiser names, evening plans, etc. — kept out of the
// public frontend bundle. Inline links use `[text](url)` markdown syntax,
// parsed safely on the client (no HTML passthrough).
function getWelcomeGuide(signalGroupLink: string) {
  return {
    title: 'Welcome to AOS Convergence',
    signalGroupLink,
    intro: [
      "You're confirmed — here's everything you need on the ground in Oslo. Save this page; we'll keep it updated as small details firm up.",
    ],
    sections: [
      {
        heading: 'Getting in from the airport',
        body: [
          "The fastest and most affordable option is the [Flytoget Airport Express](https://www.flytoget.no/en/) — every 20 minutes from Oslo Lufthavn into the city centre, around USD 30.",
          "Taxis and Uber run roughly USD 75 for the same trip.",
        ],
      },
      {
        heading: 'Weather',
        body: [
          "Late May/early June in Oslo runs 9–20°C (48–68°F). The sun rises around 4am and sets close to 10pm — pack for long, bright days.",
          "Rain is always possible. Our venue has deployable covers so we can still use the outdoor area when it turns. [YR](https://www.yr.no/) is the locals' weather app and is usually right.",
        ],
      },
      {
        heading: 'Dress code',
        body: [
          'Come as you are. As long as you won\'t be arrested for public indecency, you\'re good.',
        ],
      },
      {
        heading: 'The venues',
        body: [
          "Both venues are at [Brenneriveien 9C, 0182 Oslo](https://www.google.com/maps/search/?api=1&query=Brenneriveien+9C+0182+Oslo).",
          "Friday and Saturday we're at [BLÅ](https://www.blaaoslo.no/). After breakfast on Sunday May 31 we move across the road to [Ingensteds](https://www.ingensteds.no/).",
        ],
      },
      {
        heading: 'When you arrive',
        body: [
          "Registration opens at 08:30 on Friday May 29. A light breakfast is served from 09:00.",
          "Head to BLÅ — there will be security on the gate. Charlie and Susan will be set up at a table near the entrance to check you in, hand over your badge, and pass along a few goodies.",
        ],
      },
      {
        heading: 'Daily hours',
        body: [
          "Friday and Saturday: 08:30–17:00. Sunday: 08:30–15:00. Breakfast daily from 09:00.",
        ],
      },
      {
        heading: 'Privacy',
        body: [
          "Strict rule: no photos or filming of others without their explicit consent. That includes crowd shots and anyone identifiable in the background.",
        ],
      },
      {
        heading: 'Accessibility',
        body: [
          "Ramps cover the ground-floor zones and bathrooms. There are four optional breakout spaces up two flights of stairs.",
        ],
      },
      {
        heading: 'Security',
        body: [
          "Security is on the door at all times and knows the venue well. They'll be checking badges for attendees and staff. If you have any safety concerns, they're available.",
        ],
      },
      {
        heading: 'Safety',
        body: [
          "The team at the entrance keeps fire and evacuation plans on hand. Please let them know if you're heading offsite at any point — it keeps the attendance count accurate.",
          "If you see anything that concerns you, flag it with the team.",
        ],
      },
      {
        heading: 'Medical',
        body: [
          "Charlie is your onsite medic and keeps basic first-aid supplies at the entrance table. They're certified in First Aid and Pre-Hospital Trauma Life Support. If something comes up during the event, let them know.",
        ],
      },
      {
        heading: 'WiFi & power',
        body: [
          "The venue upgraded its WiFi for us and installed boosters so it reaches every zone. The password is on a sign at the entrance.",
          "Power outlets are in every zone — including outside — and we have extension leads and multiboards on hand.",
        ],
      },
      {
        heading: 'Program',
        body: [
          "The best place for program details is the [Program page](/program) — it will be printed and posted around the venue. The site also has contact info for attendees, the projects everyone is working on, and the hard problems up for discussion.",
          "If Open Space is new to you: it's a way for you to host and participate in the collaboration, co-creation, or dialogue that matters most to you. We'll build the agenda on the first day, and everyone chooses their own adventure. Anyone can bring a topic — the only rule is that if you offer it, you host it. We'll have three to four ~1-hour time slots, and six areas around the venue (up to 24+ sessions). If there are more than six ideas in a slot, there are plenty of cozy corners.",
        ],
      },
      {
        heading: 'Other events at the venue',
        body: [
          "BLÅ is an active club, so it runs evening events after we wrap. Some spaces may become unavailable in the late afternoon for setup — Charlie will let you know when and where.",
          "On Sunday, an artist market runs in the alley next to the venues, so expect a bit more foot traffic.",
        ],
      },
      {
        heading: 'Evenings',
        body: [
          "Karaoke on Friday night has been rumbling in the Signal group. [Star Bar](https://www.starbaroslo.no/) is a 20-minute walk from BLÅ and opens at 19:00 — let Charlie know if you'd like to join.",
          "Saturday night, [DJ Cashu](https://www.instagram.com/djcashu/) is playing at BLÅ. We're working on a deal so Convergence attendees can get in to see her perform — details to follow in Signal.",
        ],
      },
      {
        heading: 'Drinks & snacks',
        body: [
          "[Espresso Catering](https://espressocatering.no/) is running the coffee cart on site, and non-alcoholic drinks are available at the bar at all times. Fruit and snacks are out in the outdoor area throughout the day.",
        ],
      },
      {
        heading: 'Menus',
        body: [
          "Two caterers: [Nordvegan](https://nordvegan.no/) for the vegan menu, [Plato](https://platocatering.no/) for the non-vegan menu. Both companies prioritise ethical and sustainable meals.",
          "If you told us about a dietary restriction in advance, it will be catered for and clearly labelled.",
        ],
      },
      {
        heading: 'Vegetarians',
        body: [
          "You'll be primarily catered for by the non-vegan menu, with extras from the vegan menu so you can take from both.",
        ],
      },
      {
        heading: 'Need anything else?',
        body: [
          "For anything not covered here, message Charlie and/or Susan in the Signal group — Signal is the best way to reach the team.",
          "See you soon!",
        ],
      },
    ],
  };
}

// Event details — only returned to approved attendees.
// These never appear in the frontend bundle.
function getEventDetails(signalGroupLink: string) {
  return {
    signalGroupLink,
    schedule: [
      {
        day: 'Day 1 — Friday, May 29',
        subtitle: 'Orientation & Open Space',
        items: [
          { time: '09:00–10:00', event: 'Arrival, Registration & Breakfast' },
          { time: '10:00–11:00', event: 'Opening Session — Welcome to AOS Convergence' },
          { time: '11:00–11:30', event: 'Open Space Kickoff — Propose Sessions' },
          { time: '11:30–12:30', event: 'Open Space — Session Block 1' },
          { time: '12:30–13:30', event: 'Lunch' },
          { time: '13:30–14:30', event: 'Open Space — Session Block 2' },
          { time: '14:30–15:30', event: 'Open Space — Session Block 3' },
          { time: '15:30–16:00', event: 'Break' },
          { time: '16:00–17:00', event: 'Open Space — Session Block 4' },
        ],
      },
      {
        day: 'Day 2 — Saturday, May 30',
        subtitle: 'Hackathon Launch',
        items: [
          { time: '09:00–09:30', event: 'Coffee & Breakfast' },
          { time: '09:30–10:30', event: 'Hackathon Kickoff — Intro to Agentic Tools' },
          { time: '10:30–12:30', event: 'Team Formation & Hackathon — Work Block 1' },
          { time: '12:30–13:30', event: 'Lunch' },
          { time: '13:30–15:00', event: 'Hackathon — Work Block 2' },
          { time: '15:00–15:30', event: 'Break' },
          { time: '15:30–17:00', event: 'Last-Minute Hacking & Judging' },
        ],
      },
      {
        day: 'Day 3 — Sunday, May 31',
        subtitle: 'Hackathon Completion & Closing',
        items: [
          { time: '09:00–09:30', event: 'Coffee & Breakfast' },
          { time: '09:30–10:30', event: 'Hackathon Finalist Presentations' },
          { time: '10:30–11:00', event: 'Break — Judges Deliberate' },
          { time: '11:00–12:30', event: 'What\'s Next — Open Session on Taking Ideas Forward' },
          { time: '12:30–13:30', event: 'Farewell Lunch' },
          { time: '13:30–14:30', event: 'Closing Session — Reflections & Awards' },
          { time: '14:30–15:00', event: 'Hangout & Goodbyes' },
        ],
      },
    ],
    location: {
      city: 'Oslo, Norway',
      venueNote: 'Exact venue details will be shared in the Signal group closer to the event. The venue is centrally located and easily accessible by public transport.',
      exploreNote: "Oslo offers excellent food, culture, and nature. We'll share recommendations for restaurants, activities, and day trips in the Signal group.",
    },
  };
}

function corsHeaders(origin: string | null): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  headers: Record<string, string>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

function approvalKey(npub: string): string {
  return `approved:${npub}`;
}

function parseCsv(value: string | undefined): string[] {
  if (!value) return [];
  return value.split(',').map((s) => s.trim()).filter(Boolean);
}

function toHexPubkey(value: string): string {
  const trimmed = value.trim();

  if (/^[0-9a-f]{64}$/i.test(trimmed)) {
    return trimmed.toLowerCase();
  }

  const decoded = nip19.decode(trimmed);
  if (decoded.type !== 'npub') {
    throw new Error(`Expected npub or hex pubkey, got ${decoded.type}`);
  }

  return decoded.data.toLowerCase();
}

function canonicalizeNpub(value: string): string {
  const decoded = nip19.decode(value.trim());
  if (decoded.type !== 'npub') {
    throw new Error(`Expected npub, got ${decoded.type}`);
  }
  return nip19.npubEncode(decoded.data);
}

function sanitizeText(value: string | undefined, maxLength: number): string {
  const trimmed = (value ?? '').trim();
  return trimmed.slice(0, maxLength);
}

function normalizeEmail(value: string | undefined): string {
  const email = sanitizeText(value, 320).toLowerCase();
  if (!email) return '';
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    throw new Error('Invalid email format');
  }
  return email;
}

function normalizeApprovalInput(body: ApprovalInput): {
  name: string; email: string; tshirt_size: string; dietary_restrictions: string; mobility_concerns: string;
  signal: string; contact_email_only: string; hrf_opt_in: string; outreach_status: string; notes: string;
} {
  return {
    name: sanitizeText(body.name, 120),
    email: normalizeEmail(body.email),
    tshirt_size: sanitizeText(body.tshirt_size, 10),
    dietary_restrictions: sanitizeText(body.dietary_restrictions, 500),
    mobility_concerns: sanitizeText(body.mobility_concerns, 500),
    signal: sanitizeText(body.signal, 3),
    contact_email_only: sanitizeText(body.contact_email_only, 3),
    hrf_opt_in: sanitizeText(body.hrf_opt_in, 3),
    outreach_status: sanitizeText(body.outreach_status, 20),
    notes: sanitizeText(body.notes, 1000),
  };
}

async function getApprovalRecord(kv: KVNamespace, npub: string): Promise<ApprovalRecord | null> {
  const raw = await kv.get(approvalKey(npub));
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<ApprovalRecord>;
    return {
      npub,
      name: parsed.name ?? '',
      email: parsed.email ?? '',
      tshirt_size: parsed.tshirt_size ?? '',
      dietary_restrictions: parsed.dietary_restrictions ?? '',
      mobility_concerns: parsed.mobility_concerns ?? '',
      signal: parsed.signal ?? '',
      contact_email_only: parsed.contact_email_only ?? '',
      hrf_opt_in: parsed.hrf_opt_in ?? '',
      outreach_status: parsed.outreach_status || 'new',
      notes: parsed.notes ?? '',
      addedAt: parsed.addedAt ?? '',
      addedBy: parsed.addedBy ?? '',
      updatedAt: parsed.updatedAt ?? parsed.addedAt ?? '',
      updatedBy: parsed.updatedBy ?? parsed.addedBy ?? '',
    };
  } catch {
    return {
      npub,
      name: '',
      email: '',
      tshirt_size: '',
      dietary_restrictions: '',
      mobility_concerns: '',
      signal: '',
      contact_email_only: '',
      hrf_opt_in: '',
      outreach_status: 'new',
      notes: '',
      addedAt: '',
      addedBy: '',
      updatedAt: '',
      updatedBy: '',
    };
  }
}

function parseAuthEvent(token: string): NostrAuthEvent {
  const decoded = atob(token);
  return JSON.parse(decoded) as NostrAuthEvent;
}

function validateNip98(
  event: NostrAuthEvent,
  request: Request,
  expectedMethod: string,
): string | null {
  if (event.kind !== 27235) return 'Invalid event kind';
  if (!verifyEvent(event)) return 'Invalid event signature';

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - event.created_at) > 60) {
    return 'Authorization token expired';
  }

  const urlTag = event.tags.find((t) => t[0] === 'u');
  if (!urlTag?.[1]) return 'Missing URL tag';
  // Bind the token to the request path (not scheme/host). The API is served
  // first-party via a Cloudflare [[routes]] pattern, so request.url's host
  // legitimately differs from what the client signs (prod host vs localhost
  // in dev, http vs https behind the edge). The replay protection that
  // matters — endpoint + method + 60s window + signature — is preserved.
  let tagPath: string;
  let reqPath: string;
  try {
    tagPath = new URL(urlTag[1]).pathname;
    reqPath = new URL(request.url).pathname;
  } catch {
    return 'Invalid URL tag';
  }
  if (tagPath !== reqPath) return 'URL tag does not match request URL';

  const methodTag = event.tags.find((t) => t[0] === 'method');
  if (!methodTag?.[1] || methodTag[1].toUpperCase() !== expectedMethod.toUpperCase()) {
    return 'Invalid method tag';
  }

  return null;
}

async function verifyRequest(
  request: Request,
  headers: Record<string, string>,
  expectedMethod: string,
): Promise<NostrAuthEvent | Response> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Nostr ')) {
    return jsonResponse({ error: 'Missing NIP-98 authorization header' }, 401, headers);
  }

  const token = authHeader.slice(6);
  let event: NostrAuthEvent;

  try {
    event = parseAuthEvent(token);
  } catch {
    return jsonResponse({ error: 'Invalid authorization token' }, 401, headers);
  }

  const validationError = validateNip98(event, request, expectedMethod);
  if (validationError) {
    return jsonResponse({ error: validationError }, 401, headers);
  }

  return event;
}

function ensureAdmin(event: NostrAuthEvent, env: Env, headers: Record<string, string>): Response | null {
  const entries = parseCsv(env.ADMIN_PUBKEYS);
  if (entries.length === 0) {
    return jsonResponse({ error: 'Admin access not configured (ADMIN_PUBKEYS is empty)' }, 500, headers);
  }

  const allowed = new Set<string>();
  try {
    for (const entry of entries) {
      allowed.add(toHexPubkey(entry));
    }
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? `Invalid ADMIN_PUBKEYS config: ${error.message}` : 'Invalid ADMIN_PUBKEYS config' },
      500,
      headers,
    );
  }

  if (!allowed.has(event.pubkey)) {
    return jsonResponse({ error: 'NOT_ADMIN' }, 403, headers);
  }

  return null;
}

async function isApprovedNpub(npub: string, env: Env): Promise<boolean> {
  if (env.APPROVALS) {
    const record = await env.APPROVALS.get(approvalKey(npub));
    return record !== null;
  }

  // Legacy fallback only when KV binding is not configured.
  return parseCsv(env.APPROVED_NPUBS).includes(npub);
}

async function listApprovals(env: Env): Promise<ApprovalRecord[]> {
  if (!env.APPROVALS) return [];

  const records: ApprovalRecord[] = [];
  let cursor: string | undefined;

  do {
    const page = await env.APPROVALS.list({ prefix: 'approved:', cursor, limit: 1000 });

    const loaded = await Promise.all(
      page.keys.map(async (key): Promise<ApprovalRecord | null> => {
        const npub = key.name.slice('approved:'.length);
        if (!env.APPROVALS) return null;
        return getApprovalRecord(env.APPROVALS, npub);
      }),
    );

    for (const record of loaded) {
      if (record) records.push(record);
    }

    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);

  records.sort((a, b) => a.npub.localeCompare(b.npub));
  return records;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin');
    const headers = corsHeaders(origin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    const url = new URL(request.url);

    if (url.pathname === '/api/event' && request.method === 'GET') {
      return handleEventRequest(request, env, headers);
    }

    if (url.pathname === '/api/welcome-guide' && request.method === 'GET') {
      return handleWelcomeGuideRequest(request, env, headers);
    }

    if (url.pathname === '/api/projects' && request.method === 'GET') {
      return handleProjectsRequest(request, env, headers);
    }

    if (url.pathname === '/api/attendees' && request.method === 'GET') {
      return handleAttendeesRequest(request, env, headers);
    }

    if (url.pathname === '/api/hard-problems' && request.method === 'GET') {
      return handleHardProblemsRequest(request, env, headers);
    }

    if (url.pathname === '/api/admin/approvals' && request.method === 'GET') {
      return handleListApprovalsRequest(request, env, headers);
    }

    if (url.pathname === '/api/admin/approvals' && request.method === 'POST') {
      return handleAddApprovalRequest(request, env, headers);
    }

    if (url.pathname.startsWith('/api/admin/approvals/') && request.method === 'PUT') {
      return handleUpdateApprovalRequest(request, env, headers, url);
    }

    if (url.pathname.startsWith('/api/admin/approvals/') && request.method === 'DELETE') {
      return handleDeleteApprovalRequest(request, env, headers, url);
    }

    if (url.pathname === '/api/admin/applications' && request.method === 'GET') {
      return handleListApplications(request, env, headers, url);
    }

    if (/^\/api\/admin\/applications\/[^/]+\/decide$/.test(url.pathname) && request.method === 'POST') {
      return handleDecideApplication(request, env, headers, url);
    }

    return jsonResponse({ error: 'Not found' }, 404, headers);
  },
} satisfies ExportedHandler<Env>;

async function handleEventRequest(
  request: Request,
  env: Env,
  headers: Record<string, string>,
): Promise<Response> {
  const verified = await verifyRequest(request, headers, 'GET');
  if (verified instanceof Response) return verified;

  const npub = nip19.npubEncode(verified.pubkey);
  const approved = await isApprovedNpub(npub, env);

  if (!approved) {
    return jsonResponse({ error: 'Not on the approved attendee list', npub }, 403, headers);
  }

  return jsonResponse(getEventDetails(env.SIGNAL_GROUP_LINK), 200, headers);
}

async function handleWelcomeGuideRequest(
  request: Request,
  env: Env,
  headers: Record<string, string>,
): Promise<Response> {
  const verified = await verifyRequest(request, headers, 'GET');
  if (verified instanceof Response) return verified;

  const npub = nip19.npubEncode(verified.pubkey);
  const approved = await isApprovedNpub(npub, env);

  if (!approved) {
    return jsonResponse({ error: 'Not on the approved attendee list', npub }, 403, headers);
  }

  return jsonResponse(getWelcomeGuide(env.SIGNAL_GROUP_LINK), 200, headers);
}

// Attendee project directory — same approved-attendee gate as /api/event.
//
// The dataset is PERSONAL attendee data and is intentionally NOT in this
// (public) repo. It lives only in the APPROVALS KV under `projects:directory`,
// populated out-of-band via `scripts/build-projects-data.py` +
// `wrangler kv key put`. It is served only to approved attendees and never
// reaches the public frontend bundle.
const PROJECTS_KV_KEY = 'projects:directory';
const ATTENDEES_KV_KEY = 'attendees:directory';

interface AttendeeProject {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  website: string[];
  github: string[];
  other: string[];
  source: 'attendee';
  suspectedDuplicateOf?: string;
  duplicateOfTitle?: string;
}

// Shared platforms whose bare host says nothing about project identity — a
// host match here would be a false positive, so we never key on them.
const GENERIC_HOSTS = [
  'x.com', 'twitter.com', 'linkedin.com', 't.me', 'bsky.app', 'mastodon.social',
  'medium.com', 'substack.com', 'docsend.com', 'drive.proton.me', 'youtube.com',
  'opencollective.com', 'vercel.app', 'netlify.app', 'pages.dev', 'github.io',
  'nsite.run', 'gist.github.com', 'notion.site', 'squarespace.com',
];

/**
 * Normalised identity keys for a URL. For code hosts we key on the
 * `owner/repo` slug (not the bare host); for everything else we key on the
 * project's own hostname, skipping generic shared platforms.
 */
function urlKeys(url: string): string[] {
  const m = /^https?:\/\/([^/]+)(\/[^?#]*)?/i.exec(url);
  if (!m) return [];
  const host = m[1].replace(/^www\./i, '').toLowerCase();
  const path = (m[2] || '').replace(/\/+$/, '');

  if (host === 'github.com' || host === 'gitlab.com') {
    const slug = path.split('/').filter(Boolean).slice(0, 2).join('/');
    return slug ? [`${host === 'github.com' ? 'gh' : 'gl'}:${slug.toLowerCase()}`] : [];
  }
  if (GENERIC_HOSTS.some((g) => host === g || host.endsWith('.' + g))) {
    return [];
  }
  return [host];
}

/**
 * Flags attendee projects that look like an existing Foundry project (shared
 * site host or github owner/repo). Both are kept — the flag is advisory so a
 * human can review, never an automatic merge.
 */
function flagDuplicates(attendee: AttendeeProject[]): AttendeeProject[] {
  const foundryIndex = new Map<string, { id: string; title: string }>();
  for (const f of FOUNDRY_PROJECTS) {
    for (const u of [f.site, f.repo]) {
      for (const k of urlKeys(u)) foundryIndex.set(k, { id: f.id, title: f.title });
    }
  }
  return attendee.map((p) => {
    if (NOT_DUPLICATE_PROJECT_IDS.has(p.id)) return p;
    for (const u of [...p.website, ...p.github, ...p.other]) {
      for (const k of urlKeys(u)) {
        const hit = foundryIndex.get(k);
        if (hit) {
          return { ...p, suspectedDuplicateOf: hit.id, duplicateOfTitle: hit.title };
        }
      }
    }
    return p;
  });
}

// Foundry ids whose attendee duplicates have been human-reviewed and confirmed
// as dupes — these attendee cards are dropped, not just badged. Add a foundry
// id here when an organizer says "that's a dupe, remove it".
const CONFIRMED_FOUNDRY_DUPES = new Set<string>([
  'foundry-agora',
  'foundry-bitchat',
]);

// More precise removals: drop a specific attendee project by its (stable,
// link-derived) id. Used when only SOME projects flagged against a Foundry
// project are real dupes — e.g. `divine.video` is the Divine submission, but
// `proofmode.org` merely links divine.video and is a distinct project.
const CONFIRMED_DUPLICATE_PROJECT_IDS = new Set<string>([
  'p_a050d2b406eb', // divine.video — dupe of Foundry "Divine"
  'p_69ac3917bd8d', // github.com/alexgleason
  'p_39d1384c91d5', // github.com/andotherstuff
  'p_17f7b29fd54b', // github.com/callebtc
  'p_5d6c68d45d07', // github.com/erskingardner
  'p_94683f389cd8', // github.com/marykatefain
  'p_9239c1c4c9f8', // gitworkshop.dev
  'p_912ec40bff57', // psacramento.com
  'p_d7bff0a4f2ff', // shakespeare.diy
  'p_7ebb25e1a74b', // zapstore.dev
  'p_954d07c4c6b3', // soapbox.pub (lemonknowsall)
  'p_b43e02520476', // soapbox.pub (groups/soapbox-pub)
  'p_bc79e2ded67f', // soapbox.pub/ditto
  'p_9d9eb6a19b5d', // linkedin-only (fiorellaiannuzzelli)
  'p_1305cf77a984', // linkedin-only (maxwell-degregorio)
  'p_341741e85d23', // linkedin-titled (amit-motwani) — removed per organizer
  'p_8f6eee0441f6', // npub…nsite.run (sandwichfarm) — removed per organizer
  'p_e19fcdf7b9fc', // cashudevkit.org (thesimplekid) — removed per organizer
  'p_c1716e823ebe', // Alexander Hansen Færøy (ahf.me)
  'p_dd91bb3eecb2', // Derek Ross (derekross.me)
  'p_e030d1d53648', // Erik Cativo (erik.day)
  'p_dd49714eeced', // gaby-frei
  'p_cffe1d0624e0', // Sondre Bjellås (sondreb.com)
  'p_1e8164c20855', // nathan day (nathan.day.ag)
  'p_79bcfa75a64f', // hzrd149 (hzrd149.com)
  'p_871b1eb81ac9', // J.G. Montoya (blog.jgmontoya.com)
  'p_69ccd48f3eae', // Josefinalliende
  'p_f1afbf8e4ba9', // Mattlorentz (mattlorentz.com)
  'p_c95dc76c6945', // Xavier Damman (xavierdamman.com)
  'p_bdab2286ca19', // Paul (paulinthejungle.com)
]);

// Attendee projects human-reviewed as NOT duplicates — never carry the
// advisory badge even if a URL coincidentally matches a Foundry project.
const NOT_DUPLICATE_PROJECT_IDS = new Set<string>([
  'p_8b8327841d9b', // proofmode.org — distinct (Guardian Project; merely links divine.video)
]);

async function handleProjectsRequest(
  request: Request,
  env: Env,
  headers: Record<string, string>,
): Promise<Response> {
  const verified = await verifyRequest(request, headers, 'GET');
  if (verified instanceof Response) return verified;

  const npub = nip19.npubEncode(verified.pubkey);
  const approved = await isApprovedNpub(npub, env);

  if (!approved) {
    return jsonResponse({ error: 'Not on the approved attendee list', npub }, 403, headers);
  }

  if (!env.APPROVALS) {
    return jsonResponse({ error: 'APPROVALS KV binding is missing' }, 500, headers);
  }

  const raw = await env.APPROVALS.get(PROJECTS_KV_KEY);
  const attendeeProjects: AttendeeProject[] = raw ? JSON.parse(raw) : [];
  const flagged = flagDuplicates(attendeeProjects);

  // Drop confirmed dupes entirely; keep the rest (unconfirmed flags stay
  // advisory and still render with a review badge).
  const projects = flagged.filter(
    (p) =>
      !CONFIRMED_DUPLICATE_PROJECT_IDS.has(p.id) &&
      !(p.suspectedDuplicateOf && CONFIRMED_FOUNDRY_DUPES.has(p.suspectedDuplicateOf)) &&
      // Drop low-signal cards whose only link is GitHub (no website / other).
      // Structural check, not title-based: enrichment rewrites titles.
      !(p.website.length === 0 && p.other.length === 0 && p.github.length > 0),
  );

  const foundry = [...FOUNDRY_PROJECTS].sort((a, b) =>
    a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }),
  );

  return jsonResponse(
    {
      projects,
      foundry,
      suspectedDuplicates: projects.filter((p) => p.suspectedDuplicateOf).length,
      removedDuplicates: flagged.length - projects.length,
    },
    200,
    headers,
  );
}

// Attendee directory (npubs only) — same approved-attendee gate. Personal
// data: KV-only, never committed. Names/avatars resolved client-side.
async function handleAttendeesRequest(
  request: Request,
  env: Env,
  headers: Record<string, string>,
): Promise<Response> {
  const verified = await verifyRequest(request, headers, 'GET');
  if (verified instanceof Response) return verified;

  const npub = nip19.npubEncode(verified.pubkey);
  const approved = await isApprovedNpub(npub, env);

  if (!approved) {
    return jsonResponse({ error: 'Not on the approved attendee list', npub }, 403, headers);
  }

  if (!env.APPROVALS) {
    return jsonResponse({ error: 'APPROVALS KV binding is missing' }, 500, headers);
  }

  const raw = await env.APPROVALS.get(ATTENDEES_KV_KEY);
  const attendees = raw ? JSON.parse(raw) : [];

  return jsonResponse({ attendees }, 200, headers);
}

// Synthesized, de-identified "Hard Problems" insights for Open Space —
// derived from attendee applications, so it follows the same rule as the
// project/attendee directories: it is NOT in this (public) repo. It lives
// only in APPROVALS KV under `insights:hard-problems`, seeded out-of-band via
// `npm run hard-problems:reload`, and is served only to approved attendees.
const HARD_PROBLEMS_KV_KEY = 'insights:hard-problems';

async function handleHardProblemsRequest(
  request: Request,
  env: Env,
  headers: Record<string, string>,
): Promise<Response> {
  const verified = await verifyRequest(request, headers, 'GET');
  if (verified instanceof Response) return verified;

  const npub = nip19.npubEncode(verified.pubkey);
  const approved = await isApprovedNpub(npub, env);

  if (!approved) {
    return jsonResponse({ error: 'Not on the approved attendee list', npub }, 403, headers);
  }

  if (!env.APPROVALS) {
    return jsonResponse({ error: 'APPROVALS KV binding is missing' }, 500, headers);
  }

  const raw = await env.APPROVALS.get(HARD_PROBLEMS_KV_KEY);
  if (!raw) {
    return jsonResponse({ error: 'Hard Problems content is not seeded yet' }, 404, headers);
  }

  return new Response(raw, {
    status: 200,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

async function handleListApprovalsRequest(
  request: Request,
  env: Env,
  headers: Record<string, string>,
): Promise<Response> {
  const verified = await verifyRequest(request, headers, 'GET');
  if (verified instanceof Response) return verified;

  const adminError = ensureAdmin(verified, env, headers);
  if (adminError) return adminError;

  if (!env.APPROVALS) {
    return jsonResponse({ error: 'APPROVALS KV binding is missing' }, 500, headers);
  }

  const items = await listApprovals(env);
  return jsonResponse({ items, count: items.length }, 200, headers);
}

async function handleAddApprovalRequest(
  request: Request,
  env: Env,
  headers: Record<string, string>,
): Promise<Response> {
  const verified = await verifyRequest(request, headers, 'POST');
  if (verified instanceof Response) return verified;

  const adminError = ensureAdmin(verified, env, headers);
  if (adminError) return adminError;

  if (!env.APPROVALS) {
    return jsonResponse({ error: 'APPROVALS KV binding is missing' }, 500, headers);
  }

  let body: ApprovalInput;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400, headers);
  }

  if (!body.npub) {
    return jsonResponse({ error: 'npub is required' }, 400, headers);
  }

  let npub: string;
  try {
    npub = canonicalizeNpub(body.npub);
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : 'Invalid npub' }, 400, headers);
  }

  let input: ReturnType<typeof normalizeApprovalInput>;
  try {
    input = normalizeApprovalInput(body);
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : 'Invalid request body' }, 400, headers);
  }

  const existing = await getApprovalRecord(env.APPROVALS, npub);
  const now = new Date().toISOString();
  const record: ApprovalRecord = {
    npub,
    name: input.name || existing?.name || '',
    email: input.email || existing?.email || '',
    tshirt_size: input.tshirt_size || existing?.tshirt_size || '',
    dietary_restrictions: input.dietary_restrictions || existing?.dietary_restrictions || '',
    mobility_concerns: input.mobility_concerns || existing?.mobility_concerns || '',
    signal: input.signal || existing?.signal || '',
    contact_email_only: input.contact_email_only || existing?.contact_email_only || '',
    hrf_opt_in: input.hrf_opt_in || existing?.hrf_opt_in || '',
    outreach_status: input.outreach_status || existing?.outreach_status || 'new',
    notes: input.notes || existing?.notes || '',
    addedAt: existing?.addedAt || now,
    addedBy: existing?.addedBy || verified.pubkey,
    updatedAt: now,
    updatedBy: verified.pubkey,
  };

  await env.APPROVALS.put(approvalKey(npub), JSON.stringify(record));

  return jsonResponse({ ok: true, item: record }, 200, headers);
}

async function handleUpdateApprovalRequest(
  request: Request,
  env: Env,
  headers: Record<string, string>,
  url: URL,
): Promise<Response> {
  const verified = await verifyRequest(request, headers, 'PUT');
  if (verified instanceof Response) return verified;

  const adminError = ensureAdmin(verified, env, headers);
  if (adminError) return adminError;

  if (!env.APPROVALS) {
    return jsonResponse({ error: 'APPROVALS KV binding is missing' }, 500, headers);
  }

  const value = decodeURIComponent(url.pathname.slice('/api/admin/approvals/'.length));
  if (!value) {
    return jsonResponse({ error: 'npub path parameter is required' }, 400, headers);
  }

  let npub: string;
  try {
    npub = canonicalizeNpub(value);
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : 'Invalid npub' }, 400, headers);
  }

  let body: ApprovalInput;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400, headers);
  }

  let input: ReturnType<typeof normalizeApprovalInput>;
  try {
    input = normalizeApprovalInput(body);
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : 'Invalid request body' }, 400, headers);
  }

  const existing = await getApprovalRecord(env.APPROVALS, npub);
  if (!existing) {
    return jsonResponse({ error: 'Approval record not found' }, 404, headers);
  }

  const now = new Date().toISOString();
  const updated: ApprovalRecord = {
    ...existing,
    name: input.name,
    email: input.email,
    tshirt_size: input.tshirt_size,
    dietary_restrictions: input.dietary_restrictions,
    mobility_concerns: input.mobility_concerns,
    signal: input.signal,
    contact_email_only: input.contact_email_only,
    hrf_opt_in: input.hrf_opt_in,
    outreach_status: input.outreach_status || existing.outreach_status || 'new',
    notes: input.notes,
    updatedAt: now,
    updatedBy: verified.pubkey,
  };

  await env.APPROVALS.put(approvalKey(npub), JSON.stringify(updated));
  return jsonResponse({ ok: true, item: updated }, 200, headers);
}

async function handleDeleteApprovalRequest(
  request: Request,
  env: Env,
  headers: Record<string, string>,
  url: URL,
): Promise<Response> {
  const verified = await verifyRequest(request, headers, 'DELETE');
  if (verified instanceof Response) return verified;

  const adminError = ensureAdmin(verified, env, headers);
  if (adminError) return adminError;

  if (!env.APPROVALS) {
    return jsonResponse({ error: 'APPROVALS KV binding is missing' }, 500, headers);
  }

  const value = decodeURIComponent(url.pathname.slice('/api/admin/approvals/'.length));
  if (!value) {
    return jsonResponse({ error: 'npub path parameter is required' }, 400, headers);
  }

  let npub: string;
  try {
    npub = canonicalizeNpub(value);
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : 'Invalid npub' }, 400, headers);
  }

  await env.APPROVALS.delete(approvalKey(npub));
  return jsonResponse({ ok: true, npub }, 200, headers);
}

function applicationDecisionKey(submissionId: string): string {
  return `application:${submissionId}`;
}

async function handleListApplications(
  request: Request,
  env: Env,
  headers: Record<string, string>,
  url: URL,
): Promise<Response> {
  const verified = await verifyRequest(request, headers, 'GET');
  if (verified instanceof Response) return verified;

  const adminError = ensureAdmin(verified, env, headers);
  if (adminError) return adminError;

  if (!env.FORMSPREE_API_KEY) {
    return jsonResponse({ error: 'FORMSPREE_API_KEY is not configured' }, 500, headers);
  }

  if (!env.APPROVALS) {
    return jsonResponse({ error: 'APPROVALS KV binding is missing' }, 500, headers);
  }

  const page = url.searchParams.get('page') || '1';
  const formspreeUrl = `https://formspree.io/api/0/forms/mnjgpgjb/submissions?page=${encodeURIComponent(page)}`;

  let formspreeData: { submissions: Record<string, string>[]; pages: number };
  try {
    const resp = await fetch(formspreeUrl, {
      headers: { Authorization: `Bearer ${env.FORMSPREE_API_KEY}` },
    });
    if (!resp.ok) {
      const text = await resp.text();
      return jsonResponse({ error: `Formspree API error: ${resp.status} ${text}` }, 502, headers);
    }
    formspreeData = await resp.json();
  } catch {
    return jsonResponse({ error: 'Failed to fetch from Formspree' }, 502, headers);
  }

  const submissions = formspreeData.submissions ?? [];

  // Enrich each submission with decision status and approval status
  const enriched = await Promise.all(
    submissions.map(async (sub, index) => {
      // Formspree may use _id or id — fall back to index-based key
      const id = (sub._id ?? sub.id ?? `unknown-${index}`) as string;
      const npub = sub.nostr_npub as string | undefined;

      const [decisionRaw, isApproved] = await Promise.all([
        env.APPROVALS!.get(applicationDecisionKey(id)),
        npub ? isApprovedNpub(npub, env) : Promise.resolve(false),
      ]);

      let decision: ApplicationDecision | null = null;
      if (decisionRaw) {
        try { decision = JSON.parse(decisionRaw); } catch { /* ignore */ }
      }

      return { ...sub, _submission_id: id, _decision: decision, _is_approved: isApproved };
    }),
  );

  return jsonResponse({ submissions: enriched, pages: formspreeData.pages ?? 1 }, 200, headers);
}

async function handleDecideApplication(
  request: Request,
  env: Env,
  headers: Record<string, string>,
  url: URL,
): Promise<Response> {
  const verified = await verifyRequest(request, headers, 'POST');
  if (verified instanceof Response) return verified;

  const adminError = ensureAdmin(verified, env, headers);
  if (adminError) return adminError;

  if (!env.APPROVALS) {
    return jsonResponse({ error: 'APPROVALS KV binding is missing' }, 500, headers);
  }

  // Extract submission ID from /api/admin/applications/{id}/decide
  const match = url.pathname.match(/^\/api\/admin\/applications\/([^/]+)\/decide$/);
  if (!match?.[1]) {
    return jsonResponse({ error: 'Submission ID is required' }, 400, headers);
  }
  const submissionId = decodeURIComponent(match[1]);

  let body: { status?: string; npub?: string; name?: string; email?: string; hrf_opt_in?: string };
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400, headers);
  }

  if (body.status !== 'accepted' && body.status !== 'rejected') {
    return jsonResponse({ error: 'status must be "accepted" or "rejected"' }, 400, headers);
  }

  const now = new Date().toISOString();

  // Validate npub and email before writing anything, so a partial failure
  // can't leave an approval record without a corresponding decision.
  let npub: string | undefined;
  let safeEmail = '';
  if (body.status === 'accepted' && body.npub) {
    try {
      npub = canonicalizeNpub(body.npub);
    } catch (error) {
      return jsonResponse({ error: error instanceof Error ? error.message : 'Invalid npub' }, 400, headers);
    }

    try {
      safeEmail = normalizeEmail(body.email);
    } catch {
      // Fall back to raw email if it doesn't pass strict validation
      safeEmail = sanitizeText(body.email, 320).toLowerCase();
    }
  }

  // Write the decision record first, so we never have an approval without a decision
  const decision: ApplicationDecision = {
    submissionId,
    status: body.status,
    decidedAt: now,
    decidedBy: verified.pubkey,
    npub: body.npub,
  };

  await env.APPROVALS.put(applicationDecisionKey(submissionId), JSON.stringify(decision));

  // Now create the approval record
  if (body.status === 'accepted' && npub) {
    const existing = await getApprovalRecord(env.APPROVALS, npub);
    const record: ApprovalRecord = {
      npub,
      name: sanitizeText(body.name, 120) || existing?.name || '',
      email: safeEmail || existing?.email || '',
      tshirt_size: existing?.tshirt_size || '',
      dietary_restrictions: existing?.dietary_restrictions || '',
      mobility_concerns: existing?.mobility_concerns || '',
      signal: existing?.signal || '',
      contact_email_only: existing?.contact_email_only || '',
      hrf_opt_in: sanitizeText(body.hrf_opt_in, 3) || existing?.hrf_opt_in || '',
      outreach_status: existing?.outreach_status || 'new',
      notes: existing?.notes || '',
      addedAt: existing?.addedAt || now,
      addedBy: existing?.addedBy || verified.pubkey,
      updatedAt: now,
      updatedBy: verified.pubkey,
    };
    await env.APPROVALS.put(approvalKey(npub), JSON.stringify(record));
  }

  return jsonResponse({ ok: true, decision }, 200, headers);
}
