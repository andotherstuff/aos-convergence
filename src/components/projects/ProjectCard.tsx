import { useState } from 'react';
import { Github, Globe, ExternalLink, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { AttendeeProject, FoundryProject } from '@/hooks/useProjectDirectory';

type Item = AttendeeProject | FoundryProject;

function hostLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/** Deterministic, muted HSL background for monogram fallbacks. */
function monogramColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  return `hsl(${h} 32% 88%)`;
}

interface LinkChip {
  url: string;
  label: string;
  icon: 'site' | 'github' | 'ext';
}

function chips(item: Item): LinkChip[] {
  if (item.source === 'foundry') {
    return [
      ...(item.site ? [{ url: item.site, label: hostLabel(item.site), icon: 'site' as const }] : []),
      ...(item.repo ? [{ url: item.repo, label: 'Code', icon: 'github' as const }] : []),
    ];
  }
  return [
    ...item.website.map((url) => ({ url, label: hostLabel(url), icon: 'site' as const })),
    ...item.github.map((url) => ({ url, label: 'GitHub', icon: 'github' as const })),
    ...item.other.map((url) => ({ url, label: hostLabel(url), icon: 'ext' as const })),
  ];
}

function Monogram({ title }: { title: string }) {
  return (
    <div
      className="h-10 w-10 rounded-[10px] border border-border shrink-0 flex items-center justify-center text-base font-semibold text-foreground/70"
      style={{ background: monogramColor(title) }}
      aria-hidden="true"
    >
      {title.charAt(0).toUpperCase()}
    </div>
  );
}

function Avatar({ item }: { item: Item }) {
  const [failed, setFailed] = useState(false);
  const cls = 'h-10 w-10 rounded-[10px] border border-border shrink-0';

  if (item.source === 'foundry') {
    if (item.logo.startsWith('/') && !failed) {
      return (
        <img
          src={`https://andotherstuff.org${item.logo}`}
          alt=""
          className={`${cls} object-contain p-0.5`}
          style={{ background: item.logoBg || '#ffffff' }}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      );
    }
    if (!item.logo.startsWith('/') && item.logo) {
      return (
        <div
          className={`${cls} flex items-center justify-center text-lg leading-none`}
          style={{ background: item.logoBg || '#ffffff' }}
          aria-hidden="true"
        >
          {item.logo}
        </div>
      );
    }
    return <Monogram title={item.title} />;
  }

  if (item.icon && !failed) {
    return (
      <img
        src={item.icon}
        alt=""
        className={`${cls} object-cover`}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    );
  }
  return <Monogram title={item.title} />;
}

export function ProjectCard({ item }: { item: Item }) {
  const isFoundry = item.source === 'foundry';
  const description = item.description;

  return (
    <div className="bg-card rounded-[18px] p-4 sm:p-5 border border-border shadow-sm flex flex-col gap-3 min-w-0 overflow-hidden">
      <div className="flex items-start gap-3 min-w-0">
        <Avatar item={item} />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-foreground leading-tight line-clamp-2 break-words">
            {item.title}
          </h3>
        </div>
        <Badge variant={isFoundry ? 'default' : 'secondary'} className="shrink-0 font-normal">
          {isFoundry ? 'Foundry' : 'Attendee'}
        </Badge>
      </div>

      {description && (
        <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3 break-words [overflow-wrap:anywhere]">
          {description}
        </p>
      )}

      {isFoundry && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {item.tags.map((t) => (
            <span key={t} className="text-xs text-muted-foreground/80">
              #{t.replace(/\s+/g, '')}
            </span>
          ))}
        </div>
      )}

      {!isFoundry && item.suspectedDuplicateOf && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 flex items-start gap-1.5 min-w-0 break-words">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span className="min-w-0">Possible duplicate of Foundry project “{item.duplicateOfTitle}” — review.</span>
        </p>
      )}

      <div className="flex flex-wrap gap-2 mt-auto pt-1">
        {chips(item).map(({ url, label, icon }) => (
          <a
            key={url}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-foreground/15 text-xs font-medium text-foreground hover:bg-foreground/[0.04] transition-colors"
          >
            {icon === 'github' ? (
              <Github className="h-3.5 w-3.5" />
            ) : icon === 'site' ? (
              <Globe className="h-3.5 w-3.5" />
            ) : (
              <ExternalLink className="h-3.5 w-3.5" />
            )}
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}
