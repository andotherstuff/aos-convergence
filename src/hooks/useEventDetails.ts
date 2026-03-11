import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from './useCurrentUser';

const API_BASE = import.meta.env.VITE_API_URL || 'https://aos-convergence-api.protestnet.workers.dev';

export interface ScheduleItem {
  time: string;
  event: string;
}

export interface ScheduleDay {
  day: string;
  subtitle: string;
  items: ScheduleItem[];
}

export interface EventDetailsData {
  signalGroupLink: string;
  schedule: ScheduleDay[];
  location: {
    city: string;
    venueNote: string;
    exploreNote: string;
  };
}

export function useEventDetails() {
  const { user } = useCurrentUser();

  return useQuery<EventDetailsData>({
    queryKey: ['event-details', user?.pubkey],
    queryFn: async () => {
      if (!user) {
        throw new Error('Not logged in');
      }

      const url = `${API_BASE}/api/event`;

      // Create a NIP-98 auth event (kind 27235)
      const authEvent = await user.signer.signEvent({
        kind: 27235,
        content: '',
        tags: [
          ['u', url],
          ['method', 'GET'],
        ],
        created_at: Math.floor(Date.now() / 1000),
      });

      // Base64-encode the signed event as the NIP-98 token
      const token = btoa(JSON.stringify(authEvent));

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
        throw new Error((body as { error?: string }).error || 'Failed to fetch event details');
      }

      return response.json();
    },
    enabled: !!user,
    retry: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
