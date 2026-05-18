import { useMemo } from 'react';
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { NSchema as n } from '@nostrify/nostrify';
import { nip19 } from 'nostr-tools';

/**
 * Bulk-fetches kind-0 profiles for a list of npubs in a single relay query and
 * builds a per-npub lowercased search blob (name + display_name + nip05 +
 * about). Lets the attendee list be searched by name/handle/bio, not just
 * npub — the per-card {@link useAuthor} lookups can't be filtered at the
 * page level.
 */
export function useProfileSearchIndex(npubs: string[]) {
  const { nostr } = useNostr();

  const npubToHex = useMemo(() => {
    const m = new Map<string, string>();
    for (const npub of npubs) {
      try {
        const d = nip19.decode(npub);
        if (d.type === 'npub') m.set(d.data as string, npub);
      } catch {
        /* skip malformed npub */
      }
    }
    return m;
  }, [npubs]);

  const { data } = useQuery<Map<string, string>>({
    queryKey: ['profile-search-index', npubs.length, ...npubs.slice(0, 1)],
    queryFn: async () => {
      const authors = [...npubToHex.keys()];
      const index = new Map<string, string>();
      if (authors.length === 0) return index;

      const events = await nostr.query(
        [{ kinds: [0], authors }],
        { signal: AbortSignal.timeout(4000) },
      );

      // Keep the newest kind-0 per author.
      const latest = new Map<string, (typeof events)[number]>();
      for (const e of events) {
        const prev = latest.get(e.pubkey);
        if (!prev || e.created_at > prev.created_at) latest.set(e.pubkey, e);
      }

      for (const [pubkey, event] of latest) {
        const npub = npubToHex.get(pubkey);
        if (!npub) continue;
        try {
          const md = n.json().pipe(n.metadata()).parse(event.content);
          index.set(
            npub,
            [md.name, md.display_name, md.nip05, md.about]
              .filter(Boolean)
              .join(' ')
              .toLowerCase(),
          );
        } catch {
          /* unparseable metadata — npub-only search still works */
        }
      }
      return index;
    },
    enabled: npubs.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  return data ?? new Map<string, string>();
}
