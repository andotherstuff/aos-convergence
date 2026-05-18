import { useNostr } from '@nostrify/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';
import { useCurrentUser } from './useCurrentUser';
import { useNostrPublish } from './useNostrPublish';

/**
 * Reads the current user's NIP-02 contact list (kind 3) and lets them follow
 * an additional pubkey. Follows are **additive**: we re-publish the existing
 * list with the new `p` tag appended, preserving every other tag and the
 * `content` (relay list), so we never clobber who they already follow.
 */
export function useFollow() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const { mutateAsync: publish } = useNostrPublish();
  const queryClient = useQueryClient();

  const contactListQuery = useQuery<NostrEvent | null>({
    queryKey: ['contact-list', user?.pubkey],
    queryFn: async () => {
      if (!user) return null;
      const [event] = await nostr.query(
        [{ kinds: [3], authors: [user.pubkey], limit: 1 }],
        { signal: AbortSignal.timeout(3000) },
      );
      return event ?? null;
    },
    enabled: !!user,
    staleTime: 60 * 1000,
  });

  const existing = contactListQuery.data;
  const following = new Set(
    (existing?.tags ?? [])
      .filter((t) => t[0] === 'p' && t[1])
      .map((t) => t[1]),
  );

  const followMutation = useMutation({
    mutationFn: async (pubkey: string) => {
      if (!user) throw new Error('Not logged in');
      if (following.has(pubkey)) return;

      const tags = [...(existing?.tags ?? []), ['p', pubkey]];
      await publish({
        kind: 3,
        content: existing?.content ?? '',
        tags,
        created_at: Math.floor(Date.now() / 1000),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-list', user?.pubkey] });
    },
  });

  return {
    following,
    isFollowing: (pubkey: string) => following.has(pubkey),
    follow: followMutation.mutateAsync,
    isPending: followMutation.isPending,
    isLoading: contactListQuery.isLoading,
  };
}
