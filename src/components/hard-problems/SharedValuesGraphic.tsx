import { useEffect, useMemo, useState } from 'react';
import { Quote } from 'lucide-react';
import type { Value } from './sharedValues';
import { computeValueStats } from './sharedValues';

const VALUE_COLOR: Record<Value, string> = {
  'Community & collaboration': '#3f7a6b', // pine
  'Freedom tech': '#c2613f', // terracotta
  "Beyond Twitter — Nostr's 'other stuff'": '#d9a13b', // amber
  'Decentralization & open protocols': '#2f7d9e', // ocean teal
  'Real-world impact & human thriving': '#7a8a3f', // olive
  'Self-sovereignty & agency': '#7a5fc2', // violet
  'Privacy & censorship-resistance': '#b8483f', // clay red
  'Bitcoin & sound money': '#e0871f', // bitcoin orange
};

/**
 * Hover infographic for the Hard Problems page. The twist vs. the geographic
 * map and the maturity ladder: the source is qualitative prose ("why do you
 * feel aligned with AOS?"). We abstract each answer into shared value themes,
 * rank what we keep saying, and rotate real verbatim lines so the aggregate
 * keeps its human voice.
 */
export function SharedValuesGraphic() {
  const stats = useMemo(() => computeValueStats(), []);
  const [grown, setGrown] = useState(false);
  const [quoteIdx, setQuoteIdx] = useState(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const id = setInterval(
      () => setQuoteIdx((i) => (i + 1) % stats.quotes.length),
      4200,
    );
    return () => clearInterval(id);
  }, [stats.quotes.length]);

  const maxCount = stats.values[0]?.count ?? 1;

  return (
    <div className="w-[380px] sm:w-[440px]">
      <div>
        <h3 className="text-lg font-semibold tracking-[-0.02em] text-foreground">
          What brings us together
        </h3>
        <p className="mt-1 text-sm leading-snug text-muted-foreground">
          Across the answers people gave for why they feel aligned with{' '}
          <span className="font-medium text-foreground">And Other Stuff</span>,
          this is what keeps surfacing.
        </p>
      </div>

      {/* Ranked shared values */}
      <div className="mt-4">
        <div className="space-y-2">
          {stats.values.map((v, i) => (
            <div key={v.value}>
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="flex items-center gap-1.5 text-foreground">
                  <span className="text-sm leading-none">{v.emoji}</span>
                  {v.value}
                </span>
                <span className="shrink-0 font-semibold tabular-nums text-foreground">
                  {v.count}
                </span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full transition-[width] duration-700 ease-out"
                  style={{
                    width: grown ? `${(v.count / maxCount) * 100}%` : '0%',
                    transitionDelay: `${i * 70}ms`,
                    backgroundColor: VALUE_COLOR[v.value],
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rotating verbatim line — the ethos in their own words */}
      <div className="mt-4 flex items-start gap-2 border-t border-border pt-3">
        <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
        <p
          key={quoteIdx}
          className="animate-in fade-in-0 text-[12px] italic leading-relaxed text-muted-foreground"
        >
          {stats.quotes[quoteIdx]}
        </p>
      </div>
    </div>
  );
}
