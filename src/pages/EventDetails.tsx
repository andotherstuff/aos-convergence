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

          <div className="bg-red-50 border border-red-200 rounded-[18px] p-6 mb-5">
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
              className="inline-flex items-center px-4 py-2 rounded-xl bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
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
      <section className="pt-14 pb-8 md:pt-20 md:pb-10" style={{ background: 'radial-gradient(circle at top, #f7f6f4, #fbfaf8 55%)' }}>
        <div className="max-w-[720px] mx-auto px-6 text-center">
          <span className="text-xs font-medium tracking-[0.16em] uppercase text-muted-foreground/60 mb-3 block">
            May 29–31, 2026 · Oslo, Norway
          </span>
          <h1 className="text-[clamp(1.9rem,3.1vw+1.2rem,3rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-foreground mb-3">
            Welcome to AOS Convergence
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground mb-5">
            You're confirmed. Three days of Open Space, hackathon, and collaboration — here's everything you need.
          </p>
          <a
            href={data.signalGroupLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 rounded-full bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
          >
            Join the Signal Group
          </a>
          <p className="text-xs text-muted-foreground mt-2">All event coordination happens here</p>
        </div>
      </section>

      {/* Three formats */}
      <div className="max-w-[1120px] mx-auto px-6 -mt-1 mb-2">
        <div className="grid md:grid-cols-3 gap-3">
          <div className="bg-card rounded-[18px] p-5 border border-border shadow-sm">
            <h3 className="text-sm font-semibold text-foreground mb-1.5">Main Stage</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Full-group sessions that frame the work — opening, hackathon kickoff, and closing reflection.
            </p>
          </div>
          <div className="bg-card rounded-[18px] p-5 border border-border shadow-sm">
            <h3 className="text-sm font-semibold text-foreground mb-1.5">Open Space</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Participants create the agenda together. Propose sessions, choose what to join, move freely.
            </p>
          </div>
          <div className="bg-card rounded-[18px] p-5 border border-border shadow-sm">
            <h3 className="text-sm font-semibold text-foreground mb-1.5">Hackathon</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Two days building with agentic tools from the AOS core team. Teams or solo. Collaboration over competition.
            </p>
          </div>
        </div>
      </div>

      {/* Everything else in a single flowing container */}
      <div className="max-w-[1120px] mx-auto px-6 py-12 space-y-10">

        {/* Schedule */}
        <div>
          <span className="text-xs font-medium tracking-[0.16em] uppercase text-muted-foreground/60 mb-2 block">
            Schedule
          </span>
          <h2 className="text-[1.4rem] font-semibold tracking-[-0.02em] text-foreground mb-3">
            Three-day agenda
          </h2>
          <div className="space-y-3">
            {data.schedule.map((day) => (
              <div key={day.day} className="bg-card rounded-[18px] p-5 border border-border shadow-sm">
                <h3 className="text-sm font-semibold text-foreground mb-0.5">{day.day}</h3>
                <p className="text-xs text-muted-foreground mb-3">{day.subtitle}</p>
                <div className="space-y-2">
                  {day.items.map((item) => (
                    <div key={item.time} className="flex gap-4">
                      <span className="text-xs font-medium text-muted-foreground w-28 shrink-0 pt-0.5 tabular-nums">{item.time}</span>
                      <span className="text-sm text-foreground">{item.event}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Times are approximate and may shift. Final schedule will be confirmed in the Signal group.
          </p>
        </div>

        {/* Open Space Deep Dive */}
        <div>
          <span className="text-xs font-medium tracking-[0.16em] uppercase text-muted-foreground/60 mb-2 block">
            Day 1
          </span>
          <h2 className="text-[1.4rem] font-semibold tracking-[-0.02em] text-foreground mb-2">
            Open Space
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground max-w-2xl mb-4">
            After the opening session, we'll use Open Space — a facilitation method where participants create the agenda together based on the topics, questions, and projects they care most about.
          </p>
          <div className="grid md:grid-cols-2 gap-3 mb-3">
            <div className="bg-card rounded-[18px] p-5 border border-border shadow-sm">
              <h3 className="text-sm font-semibold text-foreground mb-2">How it works</h3>
              <ol className="text-sm text-muted-foreground leading-relaxed space-y-1.5 list-decimal list-inside">
                <li>Propose a session topic and briefly introduce it</li>
                <li>Topics are placed on a shared schedule grid</li>
                <li>The agenda emerges from the group within minutes</li>
                <li>Choose sessions to join — move freely between them</li>
              </ol>
            </div>
            <div className="bg-card rounded-[18px] p-5 border border-border shadow-sm">
              <h3 className="text-sm font-semibold text-foreground mb-2">Session ideas</h3>
              <ul className="text-sm text-muted-foreground leading-relaxed space-y-1 list-disc list-inside">
                <li>Share a prototype and ask for feedback</li>
                <li>Compare technical approaches to a problem</li>
                <li>Workshop an early-stage idea</li>
                <li>Explore governance models</li>
                <li>Examine an unsolved problem in decentralized systems</li>
              </ul>
            </div>
          </div>
          <div className="bg-card rounded-[18px] p-5 border border-border shadow-sm max-w-2xl">
            <h3 className="text-sm font-semibold text-foreground mb-2">Four principles</h3>
            <ul className="text-sm text-muted-foreground leading-relaxed space-y-1.5 italic">
              <li>Whoever comes are the right people.</li>
              <li>Whatever happens is the only thing that could have happened.</li>
              <li>Whenever it starts is the right time.</li>
              <li>When it is over, it is over.</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-border">
              <h4 className="text-sm font-semibold text-foreground mb-1">The Rule of Human Agency</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                If you find yourself neither learning nor contributing, use your agency to move somewhere you can — join another session, start a new conversation, or take time to reflect.
              </p>
            </div>
          </div>
        </div>

        {/* Hackathon Deep Dive */}
        <div>
          <span className="text-xs font-medium tracking-[0.16em] uppercase text-muted-foreground/60 mb-2 block">
            Days 2–3
          </span>
          <h2 className="text-[1.4rem] font-semibold tracking-[-0.02em] text-foreground mb-2">
            The Hackathon
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground max-w-2xl mb-4">
            You'll experiment with agentic development tools created by and with the AOS core team — designed for rapid experimentation with decentralized systems and open infrastructure.
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="bg-card rounded-[18px] p-5 border border-border shadow-sm">
              <h3 className="text-sm font-semibold text-foreground mb-2">What you might build</h3>
              <ul className="text-sm text-muted-foreground leading-relaxed space-y-1 list-disc list-inside">
                <li>Applications on open protocols</li>
                <li>Tools for decentralized communities</li>
                <li>Experiments with agentic software systems</li>
                <li>Research prototypes</li>
                <li>Infrastructure for freedom technology ecosystems</li>
              </ul>
            </div>
            <div className="bg-card rounded-[18px] p-5 border border-border shadow-sm">
              <h3 className="text-sm font-semibold text-foreground mb-2">How it works</h3>
              <ul className="text-sm text-muted-foreground leading-relaxed space-y-1">
                <li>Day 2 morning: intro to agentic tools and team formation</li>
                <li>Day 2: multiple sustained work blocks for building</li>
                <li>Day 3 morning: final work block</li>
                <li>Day 3 midday: project demonstrations</li>
                <li>Form teams or work individually — your choice</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Preparing */}
        <div>
          <span className="text-xs font-medium tracking-[0.16em] uppercase text-muted-foreground/60 mb-2 block">
            Preparation
          </span>
          <h2 className="text-[1.4rem] font-semibold tracking-[-0.02em] text-foreground mb-3">
            What to bring and what to expect
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="bg-card rounded-[18px] p-5 border border-border shadow-sm">
              <h3 className="text-sm font-semibold text-foreground mb-2">Bring</h3>
              <ul className="text-sm text-muted-foreground leading-relaxed space-y-1 list-disc list-inside">
                <li>A question you are exploring</li>
                <li>A project you are building</li>
                <li>A perspective from your research or work</li>
                <li>Your laptop — you'll want it for the hackathon</li>
                <li>Curiosity and willingness to collaborate</li>
              </ul>
              <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                You do not need prepared presentations.
              </p>
            </div>
            <div className="bg-card rounded-[18px] p-5 border border-border shadow-sm">
              <h3 className="text-sm font-semibold text-foreground mb-2">This is not a conference</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                The event is not built around:
              </p>
              <ul className="text-sm text-muted-foreground leading-relaxed space-y-1 list-disc list-inside">
                <li>Keynote presentations</li>
                <li>Passive audiences</li>
                <li>Polished talks</li>
                <li>Marketing or promotion</li>
              </ul>
              <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                It's a working environment. You'll get out what you put in.
              </p>
            </div>
          </div>
        </div>

        {/* Oslo */}
        <div>
          <span className="text-xs font-medium tracking-[0.16em] uppercase text-muted-foreground/60 mb-2 block">
            Location
          </span>
          <h2 className="text-[1.4rem] font-semibold tracking-[-0.02em] text-foreground mb-2">
            {data.location.city}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground max-w-2xl mb-4">
            AOS Convergence takes place immediately before the{' '}
            <a href="https://hrf.org/latest/the-oslo-freedom-forum-returns-june-1-3-2026" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">Oslo Freedom Forum</a>{' '}
            (June 1–3), hosted by the Human Rights Foundation. Many participants will continue on to the forum.
          </p>
          <div className="grid md:grid-cols-2 gap-3 mb-3">
            <div className="aspect-[16/9] rounded-[18px] overflow-hidden bg-border">
              <img src="/oslo-1.jpg" alt="Public art in Oslo" className="w-full h-full object-cover" />
            </div>
            <div className="aspect-[16/9] rounded-[18px] overflow-hidden bg-border">
              <img src="/oslo-2.jpg" alt="Oslo Freedom Forum stage" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="bg-card rounded-[18px] p-5 border border-border shadow-sm">
              <h3 className="text-sm font-semibold text-foreground mb-1.5">Venue</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{data.location.venueNote}</p>
            </div>
            <div className="bg-card rounded-[18px] p-5 border border-border shadow-sm">
              <h3 className="text-sm font-semibold text-foreground mb-1.5">Explore Oslo</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{data.location.exploreNote}</p>
            </div>
          </div>
        </div>

      </div>
    </SiteLayout>
  );
};

export default EventDetails;
