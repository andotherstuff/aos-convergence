import { createNip98Token } from './nip98Auth';

type AuthUser = Parameters<typeof createNip98Token>[0];

export async function authFetch(
  user: AuthUser,
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  body?: Record<string, unknown>,
): Promise<Response> {
  const token = await createNip98Token(user, url, method);

  return fetch(url, {
    method,
    headers: {
      Authorization: `Nostr ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

export async function parseError(response: Response): Promise<Error> {
  const body = await response.json().catch(() => ({}));
  const message = (body as { error?: string }).error || 'Request failed';
  return new Error(message);
}
