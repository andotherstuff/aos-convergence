import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from './useCurrentUser';
import { API_BASE } from '@/lib/apiBase';
import { createNip98Token } from '@/lib/nip98Auth';

export interface ScheduleItem {
  /** Human-readable display string, e.g. "09:00–10:00". */
  time: string;
  /** Parsed start time in HH:MM (24-hour, Europe/Oslo). Optional for backward compatibility. */
  start?: string;
  /** Parsed end time in HH:MM (24-hour, Europe/Oslo). Optional for backward compatibility. */
  end?: string;
  event: string;
}

export interface ScheduleDay {
  day: string;
  /** ISO date (YYYY-MM-DD) the items fall on. Optional for backward compatibility. */
  date?: string;
  subtitle: string;
  items: ScheduleItem[];
}

export interface EventDetailsData {
  signalGroupLink: string;
  schedule: ScheduleDay[];
  /** IANA timezone the schedule is expressed in. Defaults to Europe/Oslo. */
  timezone?: string;
  /** ISO 8601 timestamp of the event's first item. */
  eventStart?: string;
  /** ISO 8601 timestamp of the event's last item end. */
  eventEnd?: string;
  location: {
    city: string;
    venueNote: string;
    exploreNote: string;
  };
}

export function useEventDetails({ enabled = true }: { enabled?: boolean } = {}) {
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
    enabled: enabled && !!user,
    retry: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
