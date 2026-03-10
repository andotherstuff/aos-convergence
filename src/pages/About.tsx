import { useSeoMeta } from '@unhead/react';
import { Link } from 'react-router-dom';
import { SiteLayout } from '@/components/SiteLayout';

const About = () => {
  useSeoMeta({
    title: 'About — AOS Convergence Oslo 2026',
    description: 'Learn about AOS Convergence, a small invitation-based gathering of builders and researchers working on decentralized systems and freedom technology.',
  });

  return (
    <SiteLayout>
      <article className="max-w-[720px] mx-auto px-6 py-16 md:py-24 space-y-8">
        {/* Hero */}
        <header>
          <span className="text-xs font-medium tracking-[0.16em] uppercase text-muted-foreground/60 mb-2 block">
            About
          </span>
          <h1 className="text-[clamp(1.9rem,3.1vw+1.2rem,3rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-foreground mb-4">
            The Gathering
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            AOS Convergence is a small, invitation-based gathering of builders, researchers, designers, and community leaders working on decentralized systems and freedom technology.
          </p>
        </header>

        {/* About the Gathering */}
        <div className="space-y-3">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Rather than a traditional conference, the event is designed as a collaborative working environment. Participants come together to explore ideas, share projects, experiment with new tools, and advance work that expands human agency through open systems.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The convergence combines three complementary formats:
          </p>
          <ul className="text-sm leading-relaxed text-muted-foreground list-disc list-inside space-y-1">
            <li>A small number of full-group sessions that frame the work</li>
            <li>A collaborative hackathon using agentic tools developed by and with the AOS core team</li>
            <li>Open Space sessions where participants create the agenda together</li>
          </ul>
          <p className="text-sm leading-relaxed text-muted-foreground">
            This structure allows the gathering to balance shared direction with participant-driven exploration.
          </p>
        </div>

        {/* Why Now */}
        <div className="space-y-3">
          <h2 className="text-[1.4rem] font-semibold tracking-[-0.02em] text-foreground">
            Why Now
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            We are living through a profound transition in how digital systems are built, governed, and experienced.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Over the past two decades, much of the internet has consolidated around large centralized platforms that mediate communication, identity, and economic activity. These systems have enabled enormous growth, but they have also concentrated power and introduced structural vulnerabilities for individuals and communities around the world.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            At the same time, a new generation of technologies is emerging.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Decentralized protocols such as Nostr and Bitcoin are creating new models for communication and financial infrastructure. Advances in artificial intelligence are reshaping how software is developed and how people interact with digital systems. New coordination tools are enabling communities to organize and build together in ways that were previously difficult or impossible.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            These developments create both opportunity and risk.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Without careful attention to values, design, and governance, new technologies can easily reproduce the same centralization and power imbalances that already exist. But when they are built intentionally, open systems can expand human agency and enable new forms of collaboration, expression, and economic participation.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            AOS Convergence exists to explore this moment.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            By bringing together people who are actively building, researching, and experimenting with decentralized systems, the gathering creates space to examine the challenges and possibilities of this transition.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The goal is not only to discuss ideas, but to advance real work: new tools, new collaborations, and new approaches that help shape the next generation of open systems.
          </p>
        </div>

        {/* Why Oslo */}
        <div className="space-y-3">
          <h2 className="text-[1.4rem] font-semibold tracking-[-0.02em] text-foreground">
            Why Oslo
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            AOS Convergence takes place in Oslo immediately prior to the{' '}
            <a href="https://hrf.org/latest/the-oslo-freedom-forum-returns-june-1-3-2026" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">Oslo Freedom Forum</a>,
            one of the world's leading gatherings focused on human rights, freedom, and the future of open societies.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The Oslo Freedom Forum, hosted by the{' '}
            <a href="https://hrf.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">Human Rights Foundation</a>,
            brings together activists, technologists, policymakers, and researchers working to advance human dignity and individual freedom around the world. Over the past decade, the forum has become an important meeting place for people exploring how technology can support human rights, financial freedom, and resilient civil society.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            AOS shares many of these same concerns.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Much of the work emerging from the AOS ecosystem focuses on building open systems that protect freedom of speech, freedom of assembly, and freedom of transaction in digital environments. Technologies such as Nostr, Bitcoin, and decentralized infrastructure play an increasingly important role in enabling individuals and communities to communicate, coordinate, and build outside centralized control.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            By gathering immediately before the Oslo Freedom Forum, AOS Convergence creates space for builders and researchers to collaborate, experiment, and exchange ideas in a working environment before the broader conversations of the forum begin.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Many participants will continue on to the Oslo Freedom Forum, carrying forward the relationships, projects, and insights that begin during the convergence.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            In this way, the gathering serves as both a laboratory and a launch point for ideas that contribute to the broader global conversation about freedom and technology.
          </p>
        </div>

        {/* About AOS */}
        <div className="space-y-3">
          <h2 className="text-[1.4rem] font-semibold tracking-[-0.02em] text-foreground">
            About AOS
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            AOS (<a href="https://andotherstuff.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">And Other Stuff</a>) is a collaborative initiative focused on building open systems that expand human agency.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The internet has increasingly come to rely on centralized platforms that mediate communication, identity, and economic activity. While these systems have enabled enormous growth, they also introduce structural vulnerabilities: concentration of power, restrictions on participation, and limited user control.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            AOS explores an alternative path.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The project brings together builders, researchers, and designers working on technologies that support freedom of speech, freedom of assembly, and freedom of transaction in digital environments.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Much of this work builds on emerging protocols and ecosystems such as Nostr, Bitcoin, and other decentralized infrastructure.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Technology alone, however, is not enough. AOS also focuses on creating tools and experiences that help these systems become genuinely useful in everyday life.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            AOS Convergence is part of this broader effort: bringing together people who are experimenting with new approaches to technology, governance, and collaboration in order to accelerate the development of open systems.
          </p>
        </div>

        {/* Who Should Apply */}
        <div className="space-y-3">
          <h2 className="text-[1.4rem] font-semibold tracking-[-0.02em] text-foreground">
            Who Should Apply
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            AOS Convergence is intentionally small. Participation is limited in order to create an environment where meaningful collaboration can take place.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            We are especially interested in people actively working in areas such as:
          </p>
          <ul className="text-sm leading-relaxed text-muted-foreground list-disc list-inside space-y-1">
            <li>Decentralized protocols and infrastructure</li>
            <li>Freedom technology and open internet systems</li>
            <li>Bitcoin and alternative financial architectures</li>
            <li>Nostr and emerging social protocol ecosystems</li>
            <li>Collaborative governance and digital coordination</li>
            <li>AI systems that expand human agency</li>
            <li>Research exploring the social implications of emerging technologies</li>
          </ul>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Participants may include:
          </p>
          <ul className="text-sm leading-relaxed text-muted-foreground list-disc list-inside space-y-1">
            <li>Software developers and protocol designers</li>
            <li>Founders building new tools or platforms</li>
            <li>Researchers and academics</li>
            <li>Designers and product thinkers</li>
            <li>Community organizers</li>
            <li>Funders and ecosystem builders</li>
          </ul>
          <p className="text-sm leading-relaxed text-muted-foreground">
            What matters most is active engagement with meaningful problems and a willingness to collaborate with others.
          </p>
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

export default About;
