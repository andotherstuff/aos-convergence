import { useSeoMeta } from '@unhead/react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { nip19 } from 'nostr-tools';
import { SiteLayout } from '@/components/SiteLayout';
import { WelcomeGuideContent } from '@/components/WelcomeGuideContent';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useLoginActions } from '@/hooks/useLoginActions';
import { useWelcomeGuide } from '@/hooks/useWelcomeGuide';
import { Button } from '@/components/ui/button';

const WelcomeGuide = () => {
  const { user } = useCurrentUser();
  const { logout } = useLoginActions();
  const navigate = useNavigate();
  const { data, isLoading, error } = useWelcomeGuide();

  useSeoMeta({
    title: 'Welcome Guide — AOS Convergence Oslo',
    description: 'Everything approved attendees need to know on the ground at AOS Convergence Oslo 2026.',
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
      <WelcomeGuideContent data={data} />
    </SiteLayout>
  );
};

export default WelcomeGuide;
