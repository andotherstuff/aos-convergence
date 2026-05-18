import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from './useCurrentUser';
import { API_BASE } from '@/lib/apiBase';
import { createNip98Token } from '@/lib/nip98Auth';

/** Attendee-submitted project (links only — the export had no descriptions). */
export interface AttendeeProject {
  id: string;
  title: string;
  /** OpenGraph description scraped from the project's own public page. */
  description?: string;
  /** GitHub owner avatar URL, or empty when none (frontend shows a monogram). */
  icon?: string;
  website: string[];
  github: string[];
  other: string[];
  source: 'attendee';
  /** Set when this looks like an existing Foundry project (advisory). */
  suspectedDuplicateOf?: string;
  duplicateOfTitle?: string;
}

/** Foundry project mirrored from andotherstuff.org (public, rich metadata). */
export interface FoundryProject {
  id: string;
  title: string;
  description: string;
  site: string;
  repo: string;
  /** `/logos/*` image path, OR an emoji glyph when there is no logo file. */
  logo: string;
  /** Optional tile background — needed for light/white logos. */
  logoBg?: string;
  tags: string[];
  source: 'foundry';
}

export interface ProjectDirectory {
  projects: AttendeeProject[];
  foundry: FoundryProject[];
  suspectedDuplicates: number;
}

/**
 * Gated project directory: attendee-submitted link sets (duplicate-flagged
 * against Foundry) plus the public Foundry project list. Same NIP-98 +
 * approved-attendee gate as {@link useEventDetails}.
 */
export function useProjectDirectory({ enabled = true }: { enabled?: boolean } = {}) {
  const { user } = useCurrentUser();

  return useQuery<ProjectDirectory>({
    queryKey: ['project-directory', user?.pubkey],
    queryFn: async () => {
      if (!user) throw new Error('Not logged in');

      const url = `${API_BASE}/api/projects`;
      const token = await createNip98Token(user, url, 'GET');

      const response = await fetch(url, {
        method: 'GET',
        headers: { Authorization: `Nostr ${token}` },
      });

      if (response.status === 403) throw new Error('NOT_APPROVED');
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error || 'Failed to fetch projects');
      }

      return (await response.json()) as ProjectDirectory;
    },
    enabled: enabled && !!user,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
