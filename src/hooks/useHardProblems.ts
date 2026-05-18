import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from './useCurrentUser';
import { API_BASE } from '@/lib/apiBase';
import { createNip98Token } from '@/lib/nip98Auth';

export interface HardProblemSubsection {
  heading: string;
  body: string[];
}

export interface HardProblemSection {
  heading: string;
  body: string[];
  subsections?: HardProblemSubsection[];
}

export interface HardProblemsData {
  title: string;
  intro: string;
  sections: HardProblemSection[];
}

/**
 * Synthesized, de-identified "Hard Problems" insights for Open Space.
 * Application-derived, so it uses the same NIP-98 + approved-attendee gate as
 * {@link useEventDetails} / {@link useProjectDirectory} and never reaches the
 * public frontend bundle.
 */
export function useHardProblems({ enabled = true }: { enabled?: boolean } = {}) {
  const { user } = useCurrentUser();

  return useQuery<HardProblemsData>({
    queryKey: ['hard-problems', user?.pubkey],
    queryFn: async () => {
      if (!user) {
        throw new Error('Not logged in');
      }

      const url = `${API_BASE}/api/hard-problems`;
      const token = await createNip98Token(user, url, 'GET');

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
        throw new Error((body as { error?: string }).error || 'Failed to fetch hard problems');
      }

      return response.json();
    },
    enabled: enabled && !!user,
    retry: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
