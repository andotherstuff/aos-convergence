import { useEffect, useMemo, useState } from 'react';
import type { Stage } from './projectStages';
import { STAGE_SHORT, computeStageStats } from './projectStages';

const STAGE_COLOR: Record<Stage, string> = {
  'Idea stage': '#d9a13b', // amber — earliest
  'Prototype / MVP': '#c2613f', // terracotta — building
  'Active product with users': '#3f7a6b', // pine — live
  'Research project': '#7a5fc2', // violet
  'Funding / ecosystem support': '#2f7d9e', // ocean teal
  'Community organizing': '#b8483f', // clay red
  Other: '#8a8782', // warm grey
};

/**
 * Hover infographic for the Projects page. The twist vs. the attendee map:
 * projects are multi-stage, so instead of a geographic spread we show a
 * maturity ladder (how far along projects are) plus the cross-cutting work
 * and a "wears many hats" footer.
 */
export function ProjectStagesGraphic() {
  const stats = useMemo(() => computeStageStats(), []);
  const [grown, setGrown] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const shippingPct = Math.round((stats.shippingCount / stats.total) * 100);
  const pipelineMax = Math.max(...stats.pipeline.map((p) => p.count));
  const crossMax = Math.max(...stats.crosscutting.map((p) => p.count));

  return (
    <div className="w-[380px] sm:w-[440px]">
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold tracking-[-0.03em] text-foreground tabular-nums">
          {stats.total}
        </span>
        <span className="text-sm text-muted-foreground leading-tight">
          projects converging on{' '}
          <span className="font-medium text-foreground">Oslo 🇳🇴</span> —{' '}
          <span className="font-medium text-foreground">
            {shippingPct}% already shipping
          </span>{' '}
          to real users
        </span>
      </div>

      {/* Maturity ladder — the twist: how far along, not where from */}
      <div className="mt-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
          The journey · idea → shipped
        </p>
        <div className="mt-2 space-y-1.5">
          {stats.pipeline.map((p, i) => {
            const pct = Math.round((p.count / stats.total) * 100);
            return (
              <div key={p.stage} className="flex items-center gap-2.5">
                <span className="w-[150px] shrink-0 whitespace-nowrap text-xs text-foreground">
                  {STAGE_SHORT[p.stage]}
                </span>
                <div className="relative h-5 flex-1 overflow-hidden rounded-md bg-secondary">
                  <div
                    className="flex h-full items-center justify-end rounded-md px-2 transition-[width] duration-700 ease-out"
                    style={{
                      width: grown ? `${(p.count / pipelineMax) * 100}%` : '0%',
                      transitionDelay: `${i * 90}ms`,
                      backgroundColor: STAGE_COLOR[p.stage],
                    }}
                  >
                    <span className="text-[10px] font-semibold text-white/90 tabular-nums">
                      {pct}%
                    </span>
                  </div>
                </div>
                <span className="w-5 shrink-0 text-right text-xs font-semibold tabular-nums text-foreground">
                  {p.count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cross-cutting work */}
      <div className="mt-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
          Also in the mix
        </p>
        <div className="mt-2 space-y-1.5">
          {stats.crosscutting.map((c, i) => (
            <div key={c.stage} className="flex items-center gap-2.5">
              <span className="w-[150px] shrink-0 whitespace-nowrap text-xs text-foreground">
                {STAGE_SHORT[c.stage]}
              </span>
              <div className="relative h-4 flex-1 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full transition-[width] duration-700 ease-out"
                  style={{
                    width: grown ? `${(c.count / crossMax) * 100}%` : '0%',
                    transitionDelay: `${i * 60}ms`,
                    backgroundColor: STAGE_COLOR[c.stage],
                  }}
                />
              </div>
              <span className="w-5 shrink-0 text-right text-xs font-semibold tabular-nums text-foreground">
                {c.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Multi-hat footer twist */}
      <p className="mt-4 border-t border-border pt-3 text-[11px] leading-relaxed text-muted-foreground">
        Most wear several hats —{' '}
        <span className="font-medium text-foreground">{stats.multiHatCount}</span>{' '}
        projects span 3+ stages, the busiest juggles{' '}
        <span className="font-medium text-foreground">{stats.maxStages}</span>, and
        teams average{' '}
        <span className="font-medium text-foreground">
          {stats.avgStages.toFixed(1)}
        </span>{' '}
        stages each. 🎩
      </p>
    </div>
  );
}
