import { useSeoMeta } from '@unhead/react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { nip19 } from 'nostr-tools';
import { SiteLayout } from '@/components/SiteLayout';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useLoginActions } from '@/hooks/useLoginActions';
import { useHardProblems } from '@/hooks/useHardProblems';
import { Button } from '@/components/ui/button';
import { SharedValuesGraphic } from '@/components/hard-problems/SharedValuesGraphic';
import { HoverOrTapCard } from '@/components/ui/hover-or-tap-card';

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  UX:               { bg: '#dbeafe', text: '#1e3a8a' },
  Adoption:         { bg: '#fef3c7', text: '#78350f' },
  Decentralization: { bg: '#ede9fe', text: '#4c1d95' },
  Resilience:       { bg: '#dcfce7', text: '#14532d' },
  Legal:            { bg: '#fee2e2', text: '#7f1d1d' },
  Trust:            { bg: '#e0e7ff', text: '#312e81' },
  Identity:         { bg: '#fce7f3', text: '#831843' },
  Governance:       { bg: '#fef9c3', text: '#713f12' },
  Funding:          { bg: '#cffafe', text: '#164e63' },
  Community:        { bg: '#ccfbf1', text: '#134e4a' },
  Privacy:          { bg: '#f1f5f9', text: '#1e293b' },
  'Open Source':    { bg: '#d1fae5', text: '#064e3b' },
  AI:               { bg: '#f3e8ff', text: '#581c87' },
};

const HardProblems = () => {
  const { user } = useCurrentUser();
  const { logout } = useLoginActions();
  const navigate = useNavigate();
  const { data, isLoading, error } = useHardProblems();

  useSeoMeta({
    title: 'Hard Problems — AOS Convergence Oslo',
    description: 'Hard problems on the minds of AOS Convergence Oslo 2026 attendees.',
  });

  useEffect(() => {
    if (!user) navigate('/');
  }, [user, navigate]);

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
            Open Space
          </span>
          <h1 className="text-[clamp(1.9rem,3.1vw+1.2rem,3rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-foreground mb-4">
            {data.title}
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            {data.intro}
          </p>
          <div className="mt-5 flex justify-center">
            <HoverOrTapCard
              contentClassName="w-[min(440px,calc(100vw-24px))] p-5"
              trigger={
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-foreground/[0.04]"
                >
                  <span className="text-base leading-none">🧭</span>
                  What brings us together?
                </button>
              }
            >
              <SharedValuesGraphic />
            </HoverOrTapCard>
          </div>
        </div>
      </section>

      <div className="max-w-[720px] mx-auto px-6 py-10 md:py-12">
        <div className="space-y-8">
          {data.sections.map((section) => (
            <article key={section.heading}>
              <h2 className="text-[1.35rem] md:text-[1.55rem] font-semibold tracking-[-0.02em] text-foreground mb-2">
                {section.heading}
              </h2>
              {section.tags && section.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {section.tags.map((tag) => {
                    const colors = TAG_COLORS[tag] ?? { bg: '#f1f5f9', text: '#334155' };
                    return (
                      <span
                        key={tag}
                        style={{ backgroundColor: colors.bg, color: colors.text }}
                        className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
                      >
                        {tag}
                      </span>
                    );
                  })}
                </div>
              )}
              <div className="space-y-2.5 text-[0.98rem] leading-[1.6] text-[#3f3e3a]">
                {section.body.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              {section.subsections && section.subsections.length > 0 && (
                <div className="mt-5 space-y-5 border-l-2 border-[rgba(222,219,213,0.9)] pl-6">
                  {section.subsections.map((sub) => (
                    <div key={sub.heading}>
                      <h3 className="text-[1.1rem] font-semibold tracking-[-0.01em] text-foreground mb-2">
                        {sub.heading}
                      </h3>
                      <div className="space-y-2.5 text-[0.98rem] leading-[1.6] text-[#3f3e3a]">
                        {sub.body.map((para, i) => (
                          <p key={i}>{para}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
};

export default HardProblems;
