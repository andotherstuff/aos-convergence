import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from './useCurrentUser';
import { API_BASE } from '@/lib/apiBase';
import { authFetch, parseError } from '@/lib/adminApi';

export interface ApplicationDecision {
  submissionId: string;
  status: 'accepted' | 'rejected';
  decidedAt: string;
  decidedBy: string;
  npub?: string;
}

export interface FormspreeSubmission {
  _id: string;
  _submission_id: string; // Reliable ID set by our worker
  _date: string;
  full_name: string;
  email: string;
  nostr_npub: string;
  location: string;
  what_building: string;
  why_aos: string;
  contribution: string;
  alignment: string;
  skin_in_game: string;
  hard_problem: string;
  current_stage: string;
  link_website: string;
  link_github: string;
  link_nostr: string;
  link_twitter: string;
  link_other: string;
  hrf_opt_in: string;
  _decision: ApplicationDecision | null;
  _is_approved: boolean;
}

interface ApplicationsResponse {
  submissions: FormspreeSubmission[];
  pages: number;
}

export interface DecideInput {
  submissionId: string;
  status: 'accepted' | 'rejected';
  npub?: string;
  name?: string;
  email?: string;
  hrf_opt_in?: string;
}

export function useAdminApplications() {
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const queryKey = ['admin-applications', user?.pubkey, page];

  const applicationsQuery = useQuery<ApplicationsResponse>({
    queryKey,
    enabled: !!user,
    retry: false,
    queryFn: async () => {
      if (!user) throw new Error('Not logged in');

      const url = `${API_BASE}/api/admin/applications?page=${page}`;
      const response = await authFetch(user, url, 'GET');
      if (!response.ok) {
        throw await parseError(response);
      }
      return response.json();
    },
  });

  const decideMutation = useMutation({
    mutationFn: async ({ submissionId, status, npub, name, email, hrf_opt_in }: DecideInput) => {
      if (!user) throw new Error('Not logged in');

      const url = `${API_BASE}/api/admin/applications/${encodeURIComponent(submissionId)}/decide`;
      const response = await authFetch(user, url, 'POST', { status, npub, name, email, hrf_opt_in });
      if (!response.ok) {
        throw await parseError(response);
      }
      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-applications'] });
      await queryClient.invalidateQueries({ queryKey: ['admin-approvals'] });
    },
  });

  return {
    user,
    applicationsQuery,
    decideMutation,
    page,
    setPage,
  };
}
