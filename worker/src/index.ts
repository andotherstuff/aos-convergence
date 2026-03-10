import { verifyEvent, nip19 } from 'nostr-tools';

interface Env {
  APPROVED_NPUBS: string;
  SIGNAL_GROUP_LINK: string;
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
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin');
    const headers = corsHeaders(origin);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    const url = new URL(request.url);

    if (url.pathname === '/api/event' && request.method === 'GET') {
      return handleEventRequest(request, env, headers);
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  },
} satisfies ExportedHandler<Env>;

async function handleEventRequest(
  request: Request,
  env: Env,
  headers: Record<string, string>,
): Promise<Response> {
  const jsonHeaders = { ...headers, 'Content-Type': 'application/json' };

  // Extract the NIP-98 authorization token
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Nostr ')) {
    return new Response(
      JSON.stringify({ error: 'Missing NIP-98 authorization header' }),
      { status: 401, headers: jsonHeaders },
    );
  }

  const token = authHeader.slice(6); // Remove "Nostr " prefix

  // Decode the base64 token to get the signed event
  let event;
  try {
    const decoded = atob(token);
    event = JSON.parse(decoded);
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid authorization token' }),
      { status: 401, headers: jsonHeaders },
    );
  }

  // Validate the event
  // 1. Must be kind 27235 (NIP-98 HTTP Auth)
  if (event.kind !== 27235) {
    return new Response(
      JSON.stringify({ error: 'Invalid event kind' }),
      { status: 401, headers: jsonHeaders },
    );
  }

  // 2. Verify the signature
  if (!verifyEvent(event)) {
    return new Response(
      JSON.stringify({ error: 'Invalid event signature' }),
      { status: 401, headers: jsonHeaders },
    );
  }

  // 3. Check timestamp — must be within 60 seconds
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - event.created_at) > 60) {
    return new Response(
      JSON.stringify({ error: 'Authorization token expired' }),
      { status: 401, headers: jsonHeaders },
    );
  }

  // 4. Check URL tag matches
  const urlTag = event.tags.find((t: string[]) => t[0] === 'u');
  if (!urlTag) {
    return new Response(
      JSON.stringify({ error: 'Missing URL tag' }),
      { status: 401, headers: jsonHeaders },
    );
  }

  // 5. Check method tag
  const methodTag = event.tags.find((t: string[]) => t[0] === 'method');
  if (!methodTag || methodTag[1].toUpperCase() !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Invalid method tag' }),
      { status: 401, headers: jsonHeaders },
    );
  }

  // 6. Convert the pubkey to npub and check against approved list
  const npub = nip19.npubEncode(event.pubkey);
  const approvedNpubs = env.APPROVED_NPUBS.split(',').map((s: string) => s.trim());

  if (!approvedNpubs.includes(npub)) {
    return new Response(
      JSON.stringify({ error: 'Not on the approved attendee list', npub }),
      { status: 403, headers: jsonHeaders },
    );
  }

  // Approved — return event details
  return new Response(
    JSON.stringify(getEventDetails(env.SIGNAL_GROUP_LINK)),
    { status: 200, headers: jsonHeaders },
  );
}
