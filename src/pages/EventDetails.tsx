import { useSeoMeta } from '@unhead/react';
import { useNavigate, Link } from 'react-router-dom';
import { SiteLayout } from '@/components/SiteLayout';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useEventDetails } from '@/hooks/useEventDetails';
import { useLoginActions } from '@/hooks/useLoginActions';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { nip19 } from 'nostr-tools';

const EventDetails = () => {
  const { user } = useCurrentUser();
  const { logout } = useLoginActions();
  const navigate = useNavigate();
  const { data, isLoading, error } = useEventDetails();

  useSeoMeta({
    title: 'Event Details — AOS Convergence Oslo',
    description: 'Full event details for approved attendees of AOS Convergence Oslo 2026.',
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

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

          <div className="bg-red-50 border border-red-200 rounded-[18px] p-6 mb-8">
            <p className="text-sm text-red-700 font-medium mb-2">
              {isNotApproved ? 'Access denied' : 'Error'}
            </p>
            {isNotApproved ? (
              <>
                <p className="text-sm text-[#716f6a] mb-1">
                  The npub <code className="text-xs bg-[#f2f1f0] px-1.5 py-0.5 rounded break-all">{npub}</code> is not on our approved attendee list.
                </p>
                <p className="text-sm text-[#716f6a]">
                  If you believe this is an error, please contact the organizers.
                </p>
              </>
            ) : (
              <p className="text-sm text-[#716f6a]">{error.message}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => { logout(); navigate('/'); }}
              className="rounded-xl"
            >
              Log out and try a different key
            </Button>
            <Link
              to="/interest"
              className="inline-flex items-center px-4 py-2 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
            >
              Apply to attend
            </Link>
          </div>
        </div>
      </SiteLayout>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <SiteLayout>
      {/* Welcome */}
      <section className="py-16 md:py-24" style={{ background: 'radial-gradient(circle at top, #f7f6f4, #fbfaf8 55%)' }}>
        <div className="max-w-[1120px] mx-auto px-6">
          <span className="text-xs font-medium tracking-[0.16em] uppercase text-muted-foreground/60 mb-2 block">
            Welcome, Attendee
          </span>
          <h1 className="text-[clamp(1.9rem,3.1vw+1.2rem,3rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-foreground mb-6">
            AOS Convergence — Oslo
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground max-w-2xl">
            You're confirmed. Here's everything you need to know about the event.
          </p>
        </div>
      </section>

      {/* Signal Group */}
      <section className="bg-[#f7f6f4] py-12">
        <div className="max-w-[1120px] mx-auto px-6">
          <div className="bg-card rounded-[18px] p-6 border border-border shadow-sm max-w-xl">
            <h2 className="text-base font-semibold text-foreground mb-2">Join the Signal Group</h2>
            <p className="text-sm text-muted-foreground mb-4">
              All event coordination happens in our Signal group chat. Join now to connect with other attendees.
            </p>
            <a
              href={data.signalGroupLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-medium hover:translate-y-[-1px] hover:shadow-lg transition-all"
            >
              Open Signal Group
            </a>
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section className="py-16">
        <div className="max-w-[1120px] mx-auto px-6">
          <span className="text-xs font-medium tracking-[0.16em] uppercase text-muted-foreground/60 mb-2 block">
            Program
          </span>
          <h2 className="text-[1.65rem] font-semibold tracking-[-0.02em] text-foreground mb-10">
            Three-day agenda
          </h2>

          <div className="space-y-8">
            {data.schedule.map((day) => (
              <div key={day.day} className="bg-card rounded-[18px] p-6 border border-border shadow-sm">
                <h3 className="text-base font-semibold text-foreground mb-1">{day.day}</h3>
                <p className="text-xs text-muted-foreground mb-4">{day.subtitle}</p>
                <div className="space-y-3">
                  {day.items.map((item) => (
                    <div key={item.time} className="flex gap-4">
                      <span className="text-xs font-medium text-muted-foreground w-28 shrink-0 pt-0.5">{item.time}</span>
                      <span className="text-sm text-foreground">{item.event}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="bg-[#f7f6f4] py-16">
        <div className="max-w-[1120px] mx-auto px-6">
          <span className="text-xs font-medium tracking-[0.16em] uppercase text-muted-foreground/60 mb-2 block">
            Location
          </span>
          <h2 className="text-[1.65rem] font-semibold tracking-[-0.02em] text-foreground mb-6">
            {data.location.city}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card rounded-[18px] p-6 border border-border shadow-sm">
              <h3 className="text-base font-semibold text-foreground mb-2">Venue</h3>
              <p className="text-sm text-muted-foreground">{data.location.venueNote}</p>
            </div>
            <div className="bg-card rounded-[18px] p-6 border border-border shadow-sm">
              <h3 className="text-base font-semibold text-foreground mb-2">Explore Oslo</h3>
              <p className="text-sm text-muted-foreground">{data.location.exploreNote}</p>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default EventDetails;
