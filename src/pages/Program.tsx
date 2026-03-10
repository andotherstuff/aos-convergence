import { useSeoMeta } from '@unhead/react';
import { Link } from 'react-router-dom';
import { SiteLayout } from '@/components/SiteLayout';

const Program = () => {
  useSeoMeta({
    title: 'Program — AOS Convergence Oslo 2026',
    description: 'The structure and format of AOS Convergence: main stage sessions, a collaborative hackathon, and Open Space programming.',
  });

  return (
    <SiteLayout>
      <article className="max-w-[720px] mx-auto px-6 py-16 md:py-24 space-y-8">
        {/* Hero */}
        <header>
          <span className="text-xs font-medium tracking-[0.16em] uppercase text-muted-foreground/60 mb-2 block">
            Program
          </span>
          <h1 className="text-[clamp(1.9rem,3.1vw+1.2rem,3rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-foreground mb-4">
            The Structure of the Event
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            The convergence is organized around three core elements.
          </p>
        </header>

        {/* Main Stage Sessions */}
        <div className="space-y-3">
          <h2 className="text-[1.4rem] font-semibold tracking-[-0.02em] text-foreground">
            Main Stage Sessions
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            A small number of full-group sessions provide shared orientation and reflection points during the event.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            These sessions include:
          </p>
          <ul className="text-sm leading-relaxed text-muted-foreground list-disc list-inside space-y-1">
            <li>An opening session introducing AOS and the goals of the gathering</li>
            <li>A session that launches the collaborative hackathon</li>
            <li>A closing session reflecting on insights and outcomes</li>
          </ul>
          <p className="text-sm leading-relaxed text-muted-foreground">
            These moments provide shared context without dominating the schedule.
          </p>
        </div>

        {/* The Hackathon */}
        <div className="space-y-3">
          <h2 className="text-[1.4rem] font-semibold tracking-[-0.02em] text-foreground">
            The Hackathon
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            At the center of the convergence is a collaborative hackathon.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Participants will experiment with agentic development tools created by and with the AOS core team. These tools are designed to support rapid experimentation with decentralized systems, collaborative software development, and open infrastructure.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Hackathon teams may explore:
          </p>
          <ul className="text-sm leading-relaxed text-muted-foreground list-disc list-inside space-y-1">
            <li>Applications built on open protocols</li>
            <li>Tools for decentralized communities</li>
            <li>Experiments with agentic software systems</li>
            <li>Research prototypes</li>
            <li>Infrastructure for freedom technology ecosystems</li>
          </ul>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Participants may form teams or work individually. The emphasis is on exploration, experimentation, and collaboration rather than competition.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The hackathon runs across multiple work blocks over two days, providing sustained time for building and testing ideas.
          </p>
        </div>

        {/* Open Space */}
        <div className="space-y-3">
          <h2 className="text-[1.4rem] font-semibold tracking-[-0.02em] text-foreground">
            Open Space
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            In addition to the hackathon, much of the convergence operates using Open Space programming.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Open Space is a facilitation approach that allows participants to create the agenda together based on the topics, questions, and projects they care most about.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Sessions may include:
          </p>
          <ul className="text-sm leading-relaxed text-muted-foreground list-disc list-inside space-y-1">
            <li>Technical deep dives</li>
            <li>Research discussions</li>
            <li>Governance exploration</li>
            <li>Collaborative design sessions</li>
            <li>Project demonstrations</li>
            <li>Problem-solving conversations</li>
          </ul>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Participants propose topics and conversations that they believe would be valuable for others.
          </p>

          <h3 className="text-base font-semibold text-foreground pt-3">How Open Space Works</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            At the beginning of the Open Space portion of the event, participants propose session topics. Each topic is briefly introduced and placed on a shared schedule grid. Within a short period of time, the agenda emerges from the interests of the group. Participants then choose the sessions they want to join. Some conversations will draw larger groups. Others will become small working discussions.
          </p>

          <h3 className="text-base font-semibold text-foreground pt-3">Principles of Open Space</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Four simple principles guide the process:
          </p>
          <ul className="text-sm leading-relaxed text-muted-foreground space-y-1 italic">
            <li>Whoever comes are the right people.</li>
            <li>Whatever happens is the only thing that could have happened.</li>
            <li>Whenever it starts is the right time.</li>
            <li>When it is over, it is over.</li>
          </ul>

          <h3 className="text-base font-semibold text-foreground pt-3">The Rule of Human Agency</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            If you find yourself in a situation where you are neither learning nor contributing, you are encouraged to use your agency to move somewhere you can.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            You might:
          </p>
          <ul className="text-sm leading-relaxed text-muted-foreground list-disc list-inside space-y-1">
            <li>Join another session</li>
            <li>Start a new conversation</li>
            <li>Gather a small group around a new idea</li>
            <li>Take time to reflect or connect with others</li>
          </ul>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Open systems function best when participants take responsibility for their own engagement.
          </p>

          <h3 className="text-base font-semibold text-foreground pt-3">What Makes a Good Session</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Open Space sessions are not presentations. Good sessions invite collaboration and exploration. They often begin with a question, a prototype, or a challenge that others can help explore.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Examples include:
          </p>
          <ul className="text-sm leading-relaxed text-muted-foreground list-disc list-inside space-y-1">
            <li>Sharing a prototype and asking for feedback</li>
            <li>Comparing technical approaches to a problem</li>
            <li>Workshopping an early-stage idea</li>
            <li>Exploring governance models</li>
            <li>Examining an unsolved problem in decentralized systems</li>
          </ul>
        </div>

        {/* What to Bring / What Not to Expect */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <h2 className="text-[1.4rem] font-semibold tracking-[-0.02em] text-foreground">
              What to Bring
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Participants do not need prepared presentations. Instead, consider bringing:
            </p>
            <ul className="text-sm leading-relaxed text-muted-foreground list-disc list-inside space-y-1">
              <li>A question you are exploring</li>
              <li>A project you are building</li>
              <li>A perspective from your research or work</li>
              <li>Curiosity and willingness to collaborate</li>
            </ul>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Many of the most meaningful outcomes from gatherings like this come from relationships and shared exploration.
            </p>
          </div>
          <div className="space-y-3">
            <h2 className="text-[1.4rem] font-semibold tracking-[-0.02em] text-foreground">
              What Not to Expect
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              AOS Convergence is intentionally different from a traditional conference. The event is not built around:
            </p>
            <ul className="text-sm leading-relaxed text-muted-foreground list-disc list-inside space-y-1">
              <li>Keynote presentations</li>
              <li>Passive audiences</li>
              <li>Polished talks</li>
              <li>Marketing or promotion</li>
            </ul>
            <p className="text-sm leading-relaxed text-muted-foreground">
              It is designed as a working environment for collaboration and experimentation.
            </p>
          </div>
        </div>

        {/* Draft Event Flow */}
        <div className="space-y-4">
          <div>
            <span className="text-xs font-medium tracking-[0.16em] uppercase text-muted-foreground/60 mb-1 block">
              Draft
            </span>
            <h2 className="text-[1.4rem] font-semibold tracking-[-0.02em] text-foreground">
              Event Flow
            </h2>
          </div>

          <div className="space-y-3">
            <div className="bg-card rounded-[18px] p-5 border border-border shadow-sm">
              <h3 className="text-sm font-semibold text-foreground mb-1">Day 1 — Orientation and Open Space</h3>
              <ul className="text-sm leading-relaxed text-muted-foreground space-y-1 mt-2">
                <li>Arrival and informal connections</li>
                <li>Opening session introducing AOS and the goals of the convergence</li>
                <li>Creation of the Open Space agenda</li>
                <li>Multiple Open Space session blocks throughout the day</li>
                <li>Informal dinner and social time</li>
              </ul>
            </div>

            <div className="bg-card rounded-[18px] p-5 border border-border shadow-sm">
              <h3 className="text-sm font-semibold text-foreground mb-1">Day 2 — Hackathon Launch</h3>
              <ul className="text-sm leading-relaxed text-muted-foreground space-y-1 mt-2">
                <li>Full-group session launching the hackathon</li>
                <li>Introduction to the agentic tools</li>
                <li>Formation of teams</li>
                <li>Multiple hackathon work blocks throughout the day</li>
                <li>Optional evening hacking and informal collaboration</li>
              </ul>
            </div>

            <div className="bg-card rounded-[18px] p-5 border border-border shadow-sm">
              <h3 className="text-sm font-semibold text-foreground mb-1">Day 3 — Hackathon Completion and Closing</h3>
              <ul className="text-sm leading-relaxed text-muted-foreground space-y-1 mt-2">
                <li>Final hackathon work block</li>
                <li>Project demonstrations</li>
                <li>Closing full-group reflection session</li>
                <li>Farewell lunch before departure</li>
              </ul>
            </div>
          </div>

          <div className="pt-2">
            <Link
              to="/interest"
              className="inline-flex items-center px-6 py-3 rounded-full bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
            >
              Apply to Attend
            </Link>
          </div>
        </div>
      </article>
    </SiteLayout>
  );
};

export default Program;
