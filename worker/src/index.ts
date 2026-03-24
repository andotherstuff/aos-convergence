import { verifyEvent, nip19 } from 'nostr-tools';

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

// Event details — only returned to approved attendees.
// These never appear in the frontend bundle.
function getEventDetails(signalGroupLink: string) {
  return {
    signalGroupLink,
    schedule: [
      {
        day: 'Day 1 — Thursday, May 29',
        subtitle: 'Orientation & Open Space',
        items: [
          { time: '10:00–11:00', event: 'Arrival & Registration' },
          { time: '11:00–12:30', event: 'Opening Session — Welcome to AOS Convergence' },
          { time: '12:30–13:30', event: 'Lunch' },
          { time: '13:30–14:00', event: 'Open Space Kickoff — Propose Sessions' },
          { time: '14:00–15:15', event: 'Open Space — Session Block 1' },
          { time: '15:15–15:45', event: 'Break' },
          { time: '15:45–17:00', event: 'Open Space — Session Block 2' },
          { time: '17:00–18:00', event: 'Open Space — Session Block 3' },
          { time: '19:00', event: 'Welcome Dinner' },
        ],
      },
      {
        day: 'Day 2 — Friday, May 30',
        subtitle: 'Hackathon Launch',
        items: [
          { time: '09:00–09:30', event: 'Coffee & Breakfast' },
          { time: '09:30–10:30', event: 'Hackathon Kickoff — Intro to Agentic Tools' },
          { time: '10:30–11:00', event: 'Team Formation' },
          { time: '11:00–12:30', event: 'Hackathon — Work Block 1' },
          { time: '12:30–13:30', event: 'Lunch' },
          { time: '13:30–16:00', event: 'Hackathon — Work Block 2' },
          { time: '16:00–16:30', event: 'Break' },
          { time: '16:30–18:30', event: 'Hackathon — Work Block 3' },
          { time: '19:30', event: 'Dinner — Optional evening hacking after' },
        ],
      },
      {
        day: 'Day 3 — Saturday, May 31',
        subtitle: 'Hackathon Completion & Closing',
        items: [
          { time: '09:00–09:30', event: 'Coffee & Breakfast' },
          { time: '09:30–11:30', event: 'Hackathon — Final Work Block' },
          { time: '11:30–12:30', event: 'Project Demonstrations' },
          { time: '12:30–13:30', event: 'Closing Session — Reflections & What\'s Next' },
          { time: '13:30–15:00', event: 'Farewell Lunch' },
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
  signal: string; contact_email_only: string;
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
  if (urlTag[1] !== request.url) return 'URL tag does not match request URL';

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
  } catch (error) {
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
      addedAt: existing?.addedAt || now,
      addedBy: existing?.addedBy || verified.pubkey,
      updatedAt: now,
      updatedBy: verified.pubkey,
    };
    await env.APPROVALS.put(approvalKey(npub), JSON.stringify(record));
  }

  return jsonResponse({ ok: true, decision }, 200, headers);
}
