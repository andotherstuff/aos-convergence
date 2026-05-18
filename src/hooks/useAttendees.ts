import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from './useCurrentUser';
import { API_BASE } from '@/lib/apiBase';
import { createNip98Token } from '@/lib/nip98Auth';

export interface Attendee {
  npub: string;
}

/**
 * Gated attendee roster (npubs only). Same NIP-98 + approved-attendee gate as
 * {@link useEventDetails}; display names/avatars are resolved client-side.
 */
export function useAttendees({ enabled = true }: { enabled?: boolean } = {}) {
  const { user } = useCurrentUser();

  return useQuery<Attendee[]>({
    queryKey: ['attendees', user?.pubkey],
    queryFn: async () => {
      if (!user) throw new Error('Not logged in');

      const url = `${API_BASE}/api/attendees`;
      const token = await createNip98Token(user, url, 'GET');

      const response = await fetch(url, {
        method: 'GET',
        headers: { Authorization: `Nostr ${token}` },
      });

      if (response.status === 403) throw new Error('NOT_APPROVED');
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error || 'Failed to fetch attendees');
      }

      const data = (await response.json()) as { attendees: Attendee[] };
      return data.attendees;
    },
    enabled: enabled && !!user,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
