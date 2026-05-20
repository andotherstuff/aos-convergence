import { useSeoMeta } from '@unhead/react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { nip19 } from 'nostr-tools';
import { SiteLayout } from '@/components/SiteLayout';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useLoginActions } from '@/hooks/useLoginActions';
import {
  useProjectDirectory,
  type AttendeeProject,
  type FoundryProject,
} from '@/hooks/useProjectDirectory';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectStagesGraphic } from '@/components/projects/ProjectStagesGraphic';
import { HoverOrTapCard } from '@/components/ui/hover-or-tap-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type Item = AttendeeProject | FoundryProject;
type SourceFilter = 'all' | 'foundry' | 'attendee';

const Projects = () => {
  const { user } = useCurrentUser();
  const { logout } = useLoginActions();
  const navigate = useNavigate();
  const { data, isLoading, error } = useProjectDirectory();

  const [query, setQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');

  useSeoMeta({
    title: 'Attendee Projects — AOS Convergence Oslo',
    description: 'Projects from AOS Convergence Oslo 2026 attendees and the AOS Foundry.',
  });

  useEffect(() => {
    if (!user) navigate('/');
  }, [user, navigate]);

  const all: Item[] = useMemo(
    () => (data ? [...data.foundry, ...data.projects] : []),
    [data],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((it) => {
      if (sourceFilter !== 'all' && it.source !== sourceFilter) return false;
      if (q) {
        const hay =
          it.source === 'foundry'
            ? `${it.title} ${it.description} ${it.tags.join(' ')}`
            : `${it.title} ${it.website.join(' ')} ${it.github.join(' ')} ${it.other.join(' ')}`;
        if (!hay.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [all, query, sourceFilter]);

  if (!user) return null;
  const npub = nip19.npubEncode(user.pubkey);

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="max-w-[1120px] mx-auto px-6 py-20 text-center">
          <p className="text-sm text-muted-foreground">Verifying your attendance...</p>
        </div>
      </SiteLayout>
    );
  }

  if (error) {
    const isNotApproved = error.message === 'NOT_APPROVED';
    return (
      <SiteLayout>
        <div className="max-w-[540px] mx-auto px-6 py-16 md:py-24">
          <span className="text-xs font-medium tracking-[0.16em] uppercase text-[#716f6a]/60 mb-2 block">
            AOS Convergence
          </span>
          <h1 className="text-[clamp(1.5rem,2.5vw+1rem,2.2rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-[#0f100f] mb-6">
            {isNotApproved ? 'Not on the approved list' : 'Something went wrong'}
          </h1>
          <div className="bg-red-50 border border-red-200 rounded-[18px] p-6 mb-5">
            <p className="text-sm text-red-700 font-medium mb-2">
              {isNotApproved ? 'Access denied' : 'Error'}
            </p>
            {isNotApproved ? (
              <p className="text-sm text-[#716f6a]">
                The npub{' '}
                <code className="text-xs bg-[#f2f1f0] px-1.5 py-0.5 rounded break-all">
                  {npub}
                </code>{' '}
                is not on our approved attendee list.
              </p>
            ) : (
              <p className="text-sm text-[#716f6a]">{error.message}</p>
            )}
          </div>
          <Button
            variant="outline"
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="rounded-xl"
          >
            Log out and try a different key
          </Button>
        </div>
      </SiteLayout>
    );
  }

  if (!data) return null;

  return (
    <SiteLayout>
      <section
        className="pt-14 pb-8 md:pt-20 md:pb-10"
        style={{ background: 'radial-gradient(circle at top, #f7f6f4, #fbfaf8 55%)' }}
      >
        <div className="max-w-[720px] mx-auto px-6 text-center">
          <span className="text-xs font-medium tracking-[0.16em] uppercase text-muted-foreground/60 mb-3 block">
            What's cooking
          </span>
          <h1 className="text-[clamp(1.9rem,3.1vw+1.2rem,3rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-foreground mb-3">
            Attendee Projects
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            What attendees and the AOS Foundry are building.
          </p>
          <div className="mt-5 flex justify-center">
            <HoverOrTapCard
              contentClassName="w-[min(440px,calc(100vw-24px))] p-5"
              trigger={
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-foreground/[0.04]"
                >
                  <span className="text-base leading-none">🚀</span>
                  How far along is everything?
                </button>
              }
            >
              <ProjectStagesGraphic />
            </HoverOrTapCard>
          </div>
        </div>
      </section>

      <div className="max-w-[1120px] mx-auto px-6 py-10 space-y-6">
        <div className="flex flex-col lg:flex-row gap-3">
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects…"
            className="rounded-full"
            aria-label="Search projects"
          />
          <div className="flex gap-2">
            {(['all', 'foundry', 'attendee'] as const).map((s) => (
              <Button
                key={s}
                type="button"
                variant={sourceFilter === s ? 'default' : 'outline'}
                onClick={() => setSourceFilter(s)}
                className="rounded-full capitalize shrink-0"
              >
                {s}
              </Button>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Showing {filtered.length} of {all.length}
        </p>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-sm text-muted-foreground">
            No projects match your filters.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((it) => (
              <ProjectCard key={it.id} item={it} />
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
};

export default Projects;
