import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from './useCurrentUser';
import { API_BASE } from '@/lib/apiBase';
import { createNip98Token } from '@/lib/nip98Auth';

export interface UpvotesData {
  counts: Record<string, number>;
  userVotes: string[];
}

export function useHardProblemsUpvotes({ enabled = true }: { enabled?: boolean } = {}) {
  const { user } = useCurrentUser();

  return useQuery<UpvotesData>({
    queryKey: ['hard-problems-upvotes', user?.pubkey],
    queryFn: async () => {
      if (!user) throw new Error('Not logged in');
      const url = `${API_BASE}/api/hard-problems/upvotes`;
      const token = await createNip98Token(user, url, 'GET');
      const response = await fetch(url, {
        method: 'GET',
        headers: { Authorization: `Nostr ${token}` },
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error || 'Failed to fetch upvotes');
      }
      return response.json();
    },
    enabled: enabled && !!user,
    staleTime: 0,
  });
}
