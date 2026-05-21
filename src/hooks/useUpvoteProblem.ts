import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from './useCurrentUser';
import { API_BASE } from '@/lib/apiBase';
import { createNip98Token } from '@/lib/nip98Auth';
import type { UpvotesData } from './useHardProblemsUpvotes';

export function useUpvoteProblem() {
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slug: string) => {
      if (!user) throw new Error('Not logged in');
      const url = `${API_BASE}/api/hard-problems/upvote`;
      const token = await createNip98Token(user, url, 'POST');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Nostr ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slug }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error || 'Failed to upvote');
      }
      return response.json() as Promise<{ count: number; voted: boolean }>;
    },
    onSuccess: (data, slug) => {
      queryClient.setQueryData(
        ['hard-problems-upvotes', user?.pubkey],
        (old: UpvotesData | undefined) => {
          if (!old) return old;
          return {
            counts: { ...old.counts, [slug]: data.count },
            userVotes: data.voted
              ? [...old.userVotes, slug]
              : old.userVotes.filter((v) => v !== slug),
          };
        },
      );
    },
  });
}
