import { useEffect, useMemo, useState } from 'react';
import type { Continent } from './attendeeOrigins';
import { computeOriginStats } from './attendeeOrigins';

const CONTINENT_COLOR: Record<Continent, string> = {
  Europe: '#c2613f', // terracotta
  'North America': '#3f7a6b', // pine
  'South America': '#d99a2b', // amber
  Asia: '#7a5fc2', // violet
  Africa: '#b8483f', // clay red
  Oceania: '#2f7d9e', // ocean teal
  Nostrverse: '#8a8782', // warm grey
};

/**
 * Hover infographic for the Who's Attending page: a quick, playful read on
 * how far people are traveling to converge on Oslo. Bars animate in on mount
 * (i.e. each time the hover card opens) for a little life.
 */
export function AttendeeOriginsGraphic() {
  const stats = useMemo(() => computeOriginStats(), []);
  const [grown, setGrown] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const rankedCountries = stats.countries.filter(
    (c) => c.continent !== 'Nostrverse',
  );
  const maxCount = rankedCountries[0]?.count ?? 1;
  const nostrverse = stats.countries.find((c) => c.continent === 'Nostrverse');

  return (
    <div className="w-[380px] sm:w-[440px]">
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold tracking-[-0.03em] text-foreground tabular-nums">
          {stats.total}
        </span>
        <span className="text-sm text-muted-foreground leading-tight">
          souls converging on{' '}
          <span className="font-medium text-foreground">Oslo 🇳🇴</span> from{' '}
          <span className="font-medium text-foreground">
            {stats.countryCount} countries
          </span>{' '}
          across {stats.continentCount} continents
        </span>
      </div>

      {/* Stacked continent bar */}
      <div className="mt-4">
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-secondary">
          {stats.byContinent.map((c) => (
            <div
              key={c.continent}
              className="h-full transition-[width] duration-700 ease-out"
              style={{
                width: grown ? `${(c.count / stats.total) * 100}%` : '0%',
                backgroundColor: CONTINENT_COLOR[c.continent],
              }}
              title={`${c.continent}: ${c.count}`}
            />
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
          {stats.byContinent.map((c) => (
            <span
              key={c.continent}
              className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: CONTINENT_COLOR[c.continent] }}
              />
              {c.continent}
              <span className="font-medium text-foreground tabular-nums">
                {c.count}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* All countries */}
      <div className="mt-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
          Where they're flying from
          <span className="ml-1.5 normal-case tracking-normal text-muted-foreground/50">
            · all {rankedCountries.length} countries
          </span>
        </p>
        <div className="mt-1.5 max-h-[208px] space-y-1.5 overflow-y-auto pr-1.5">
          {rankedCountries.map((c, i) => (
            <div key={c.name} className="flex items-center gap-2.5">
              <span className="w-4 text-base leading-none">{c.flag}</span>
              <span className="w-[88px] shrink-0 truncate text-xs text-foreground">
                {c.name}
              </span>
              <div className="relative h-4 flex-1 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full transition-[width] duration-700 ease-out"
                  style={{
                    width: grown ? `${(c.count / maxCount) * 100}%` : '0%',
                    transitionDelay: `${Math.min(i, 12) * 45}ms`,
                    backgroundColor: CONTINENT_COLOR[c.continent],
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

      {/* Whimsical footer */}
      {nostrverse && (
        <p className="mt-4 border-t border-border pt-3 text-[11px] leading-relaxed text-muted-foreground">
          …plus <span className="font-medium text-foreground">{nostrverse.count}</span>{' '}
          beaming in from{' '}
          <span className="text-foreground">the Nostrverse 🛰️</span>,{' '}
          Cyberspace 💾, stateless 🏴, Artanis 👽, and wherever the heart is ❤️
        </p>
      )}
    </div>
  );
}
