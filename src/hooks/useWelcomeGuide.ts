import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from './useCurrentUser';
import { API_BASE } from '@/lib/apiBase';
import { createNip98Token } from '@/lib/nip98Auth';
import { formatNip98SigningError } from '@/lib/nostrExtension';

export interface WelcomeGuideSection {
  heading: string;
  body: string[];
}

export interface WelcomeGuideData {
  title: string;
  signalGroupLink: string;
  intro: string[];
  sections: WelcomeGuideSection[];
}

/**
 * Comprehensive on-the-ground welcome guide for approved attendees.
 * Uses the same NIP-98 + approved-npub gate as {@link useEventDetails}
 * so venue address, organiser names, and evening plans never reach the
 * public frontend bundle.
 */
export function useWelcomeGuide({ enabled = true }: { enabled?: boolean } = {}) {
  const { user } = useCurrentUser();

  return useQuery<WelcomeGuideData>({
    queryKey: ['welcome-guide', user?.pubkey],
    queryFn: async () => {
      if (!user) {
        throw new Error('Not logged in');
      }

      const url = `${API_BASE}/api/welcome-guide`;
      let token: string;

      try {
        token = await createNip98Token(user, url, 'GET');
      } catch (error) {
        throw new Error(formatNip98SigningError(error));
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Nostr ${token}`,
        },
      });

      if (response.status === 403) {
        throw new Error('NOT_APPROVED');
      }

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error || 'Failed to fetch welcome guide');
      }

      return response.json();
    },
    enabled: enabled && !!user,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
