import { Fragment, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { WelcomeGuideData } from '@/hooks/useWelcomeGuide';

// Parse `[text](url)` markdown-style links into safe React nodes.
// Worker controls the input — we still never pass through raw HTML.
function renderInline(text: string): ReactNode {
  const parts: ReactNode[] = [];
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const linkText = match[1];
    const href = match[2];
    const isInternal = href.startsWith('/');

    if (isInternal) {
      parts.push(
        <Link
          key={key++}
          to={href}
          className="underline decoration-foreground/30 underline-offset-2 hover:decoration-foreground transition-colors"
        >
          {linkText}
        </Link>,
      );
    } else {
      parts.push(
        <a
          key={key++}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-foreground/30 underline-offset-2 hover:decoration-foreground transition-colors"
        >
          {linkText}
        </a>,
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.map((part, i) => <Fragment key={i}>{part}</Fragment>);
}

export function WelcomeGuideContent({ data }: { data: WelcomeGuideData }) {
  return (
    <>
      <section
        className="pt-14 pb-8 md:pt-20 md:pb-10"
        style={{ background: 'radial-gradient(circle at top, #f7f6f4, #fbfaf8 55%)' }}
      >
        <div className="max-w-[720px] mx-auto px-6 text-center">
          <span className="text-xs font-medium tracking-[0.16em] uppercase text-muted-foreground/60 mb-3 block">
            May 29–31, 2026 · Oslo, Norway
          </span>
          <h1 className="text-[clamp(1.9rem,3.1vw+1.2rem,3rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-foreground mb-4">
            {data.title}
          </h1>
          <div className="space-y-3 text-base leading-relaxed text-muted-foreground mb-5">
            {data.intro.map((p, i) => (
              <p key={i}>{renderInline(p)}</p>
            ))}
          </div>
          <a
            href={data.signalGroupLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 rounded-full bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
          >
            Join the Signal Group
          </a>
          <p className="text-xs text-muted-foreground mt-2">All event coordination happens in Signal</p>
        </div>
      </section>

      <div className="max-w-[720px] mx-auto px-6 py-10 md:py-12">
        <div className="space-y-7">
          {data.sections.map((section) => (
            <article
              key={section.heading}
              className="bg-card rounded-[18px] p-6 border border-border shadow-sm"
            >
              <h2 className="text-[1.2rem] md:text-[1.3rem] font-semibold tracking-[-0.01em] text-foreground mb-3">
                {section.heading}
              </h2>
              <div className="space-y-2.5 text-[0.98rem] leading-[1.65] text-[#3f3e3a]">
                {section.body.map((para, i) => (
                  <p key={i}>{renderInline(para)}</p>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center text-center">
          <a
            href={data.signalGroupLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 rounded-full bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
          >
            Join the Signal Group
          </a>
          <p className="text-xs text-muted-foreground mt-2">All event coordination happens in Signal</p>
        </div>
      </div>
    </>
  );
}
