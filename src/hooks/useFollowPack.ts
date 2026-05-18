import { useMutation } from '@tanstack/react-query';
import { nip19 } from 'nostr-tools';
import { useNostrPublish } from './useNostrPublish';

/** NIP-51 addressable follow pack (the kind following.space publishes). */
const FOLLOW_PACK_KIND = 39089;
/** Stable `d` identifier so re-publishing updates the same pack. */
const PACK_D = 'aos-convergence-2026';

function npubToHex(npub: string): string | null {
  try {
    const d = nip19.decode(npub);
    return d.type === 'npub' ? (d.data as string) : null;
  } catch {
    return null;
  }
}

/**
 * Publishes the signed-in attendee's personal follow pack — a kind-39089
 * event containing the people they starred. This is intentionally a
 * **public** Nostr event: only the user's hand-picked selections, published
 * by their own choice.
 */
export function useFollowPack() {
  const { mutateAsync: publish } = useNostrPublish();

  return useMutation({
    mutationFn: async (npubs: string[]) => {
      const pubkeys = npubs
        .map(npubToHex)
        .filter((pk): pk is string => pk !== null);

      if (pubkeys.length === 0) {
        throw new Error('Star some people first — the pack would be empty.');
      }

      const tags: string[][] = [
        ['d', PACK_D],
        ['title', 'AOS Convergence 2026 — my connections'],
        [
          'description',
          'People I want to connect with at AOS Convergence 2026, Oslo.',
        ],
        ...pubkeys.map((pk) => ['p', pk]),
      ];

      return publish({
        kind: FOLLOW_PACK_KIND,
        content: '',
        tags,
        created_at: Math.floor(Date.now() / 1000),
      });
    },
  });
}
