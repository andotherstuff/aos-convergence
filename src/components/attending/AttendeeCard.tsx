import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import { Star, UserPlus, Check, MessageCircle } from 'lucide-react';
import { useAuthor } from '@/hooks/useAuthor';
import { useFollow } from '@/hooks/useFollow';
import { genUserName } from '@/lib/genUserName';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AttendeeCardProps {
  npub: string;
  saved: boolean;
  onToggleSave: () => void;
}

function npubToHex(npub: string): string | undefined {
  try {
    const d = nip19.decode(npub);
    return d.type === 'npub' ? (d.data as string) : undefined;
  } catch {
    return undefined;
  }
}

export function AttendeeCard({ npub, saved, onToggleSave }: AttendeeCardProps) {
  const pubkey = useMemo(() => npubToHex(npub), [npub]);
  const author = useAuthor(pubkey);
  const { isFollowing, follow } = useFollow();
  const [followBusy, setFollowBusy] = useState(false);
  const [followError, setFollowError] = useState(false);

  const metadata = author.data?.metadata;
  const displayName =
    metadata?.display_name || metadata?.name || genUserName(pubkey ?? npub);
  const nip05 = metadata?.nip05;
  const about = metadata?.about;
  const followed = pubkey ? isFollowing(pubkey) : false;
  // Canonical Ditto profile URL. On devices with the native Ditto app, OS
  // universal/app links hand this https URL off to the app automatically.
  const dittoProfileUrl = `https://ditto.pub/${npub}`;

  const handleFollow = async () => {
    if (!pubkey || followed) return;
    setFollowBusy(true);
    setFollowError(false);
    try {
      await follow(pubkey);
    } catch {
      setFollowError(true);
    } finally {
      setFollowBusy(false);
    }
  };

  return (
    <div className="bg-card rounded-[18px] p-4 sm:p-5 border border-border shadow-sm flex flex-col gap-4 min-w-0 overflow-hidden">
      <div className="flex items-start gap-3 min-w-0">
        <a
          href={dittoProfileUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`View ${displayName} on Ditto (opens in a new tab or the Ditto app)`}
        >
          <Avatar className="h-11 w-11 border border-border">
            <AvatarImage src={metadata?.picture} alt="" />
            <AvatarFallback className="text-sm">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </a>
        <div className="min-w-0 flex-1">
          <a
            href={dittoProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block font-semibold text-foreground leading-tight truncate hover:underline"
          >
            {displayName}
          </a>
          {nip05 && <p className="text-xs text-muted-foreground truncate">{nip05}</p>}
        </div>
        <button
          type="button"
          onClick={onToggleSave}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${displayName} from my list` : `Star ${displayName}`}
          className="shrink-0 p-1.5 -m-1.5 rounded-full hover:bg-foreground/[0.06] transition-colors"
          title={saved ? 'Remove from my list' : 'Save to my list'}
        >
          <Star
            className={
              saved ? 'h-5 w-5 fill-amber-400 text-amber-500' : 'h-5 w-5 text-muted-foreground'
            }
          />
        </button>
      </div>

      {about && (
        <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3 break-words [overflow-wrap:anywhere]">
          {about}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mt-auto pt-1">
        <button
          type="button"
          onClick={handleFollow}
          disabled={!pubkey || followed || followBusy}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            followed
              ? 'border border-foreground/15 text-muted-foreground cursor-default'
              : 'bg-foreground text-background hover:bg-foreground/90 disabled:opacity-60'
          }`}
        >
          {followed ? (
            <>
              <Check className="h-3.5 w-3.5" /> Following
            </>
          ) : (
            <>
              <UserPlus className="h-3.5 w-3.5" />
              {followBusy ? 'Following…' : followError ? 'Retry follow' : 'Follow'}
            </>
          )}
        </button>
        <Link
          to={`/messages?to=${npub}`}
          title="Sends a NIP-04 Nostr DM — content encrypted, but metadata is public. Use Signal for anything sensitive or time-sensitive."
          aria-label={`Message ${displayName} via Nostr DM (NIP-04; encrypted content, public metadata)`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-foreground/15 text-xs font-medium text-foreground hover:bg-foreground/[0.04] transition-colors"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          Message
        </Link>
      </div>
    </div>
  );
}
