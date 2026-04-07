import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from './useCurrentUser';
import { API_BASE } from '@/lib/apiBase';
import { authFetch, parseError } from '@/lib/adminApi';

export interface ApprovalRecord {
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

export interface ApprovalUpsertInput {
  npub: string;
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

interface ApprovalsResponse {
  items: ApprovalRecord[];
  count: number;
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
    mutationFn: async ({ npub, name, email, tshirt_size, dietary_restrictions, mobility_concerns, signal, contact_email_only, hrf_opt_in, outreach_status, notes }: ApprovalUpsertInput) => {
      if (!user) throw new Error('Not logged in');

      const url = `${API_BASE}/api/admin/approvals`;
      const response = await authFetch(user, url, 'POST', {
        npub, name, email, tshirt_size, dietary_restrictions, mobility_concerns, signal, contact_email_only, hrf_opt_in, outreach_status, notes,
      });
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
    mutationFn: async ({ npub, name, email, tshirt_size, dietary_restrictions, mobility_concerns, signal, contact_email_only, hrf_opt_in, outreach_status, notes }: ApprovalUpsertInput) => {
      if (!user) throw new Error('Not logged in');

      const url = `${API_BASE}/api/admin/approvals/${encodeURIComponent(npub)}`;
      const response = await authFetch(user, url, 'PUT', {
        name, email, tshirt_size, dietary_restrictions, mobility_concerns, signal, contact_email_only, hrf_opt_in, outreach_status, notes,
      });
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
