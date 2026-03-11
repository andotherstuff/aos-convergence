import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from './useCurrentUser';
import { API_BASE } from '@/lib/apiBase';
import { createNip98Token } from '@/lib/nip98Auth';

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
        throw new Error((body as { error?: string }).error || 'Failed to fetch event details');
      }

      return response.json();
    },
    enabled: !!user,
    retry: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
