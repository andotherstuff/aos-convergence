import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from './useCurrentUser';
import { API_BASE } from '@/lib/apiBase';
import { createNip98Token } from '@/lib/nip98Auth';

export interface ApprovalRecord {
  npub: string;
  name: string;
  email: string;
  addedAt: string;
  addedBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface ApprovalUpsertInput {
  npub: string;
  name?: string;
  email?: string;
}

interface ApprovalsResponse {
  items: ApprovalRecord[];
  count: number;
}

async function authFetch(
  user: NonNullable<ReturnType<typeof useCurrentUser>['user']>,
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

async function parseError(response: Response): Promise<Error> {
  const body = await response.json().catch(() => ({}));
  const message = (body as { error?: string }).error || 'Request failed';
  return new Error(message);
}

export function useAdminApprovals() {
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();

  const queryKey = ['admin-approvals', user?.pubkey];

  const approvalsQuery = useQuery<ApprovalsResponse>({
    queryKey,
    enabled: !!user,
    retry: false,
    queryFn: async () => {
      if (!user) throw new Error('Not logged in');

      const url = `${API_BASE}/api/admin/approvals`;
      const response = await authFetch(user, url, 'GET');
      if (!response.ok) {
        throw await parseError(response);
      }
      return response.json();
    },
  });

  const addMutation = useMutation({
    mutationFn: async ({ npub, name, email }: ApprovalUpsertInput) => {
      if (!user) throw new Error('Not logged in');

      const url = `${API_BASE}/api/admin/approvals`;
      const response = await authFetch(user, url, 'POST', { npub, name, email });
      if (!response.ok) {
        throw await parseError(response);
      }
      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ npub, name, email }: ApprovalUpsertInput) => {
      if (!user) throw new Error('Not logged in');

      const url = `${API_BASE}/api/admin/approvals/${encodeURIComponent(npub)}`;
      const response = await authFetch(user, url, 'PUT', { name, email });
      if (!response.ok) {
        throw await parseError(response);
      }
      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (npub: string) => {
      if (!user) throw new Error('Not logged in');

      const url = `${API_BASE}/api/admin/approvals/${encodeURIComponent(npub)}`;
      const response = await authFetch(user, url, 'DELETE');
      if (!response.ok) {
        throw await parseError(response);
      }
      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    user,
    approvalsQuery,
    addMutation,
    updateMutation,
    removeMutation,
  };
}
