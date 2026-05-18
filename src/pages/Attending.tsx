import { useSeoMeta } from '@unhead/react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { nip19 } from 'nostr-tools';
import { Star, Sparkles, Info } from 'lucide-react';
import { SiteLayout } from '@/components/SiteLayout';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useLoginActions } from '@/hooks/useLoginActions';
import { useAttendees } from '@/hooks/useAttendees';
import { useFollowPack } from '@/hooks/useFollowPack';
import { useProfileSearchIndex } from '@/hooks/useProfileSearchIndex';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { AttendeeCard } from '@/components/attending/AttendeeCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Attending = () => {
  const { user } = useCurrentUser();
  const { logout } = useLoginActions();
  const navigate = useNavigate();
  const { data: attendees, isLoading, error } = useAttendees();
  const followPack = useFollowPack();

  const [query, setQuery] = useState('');
  const [savedOnly, setSavedOnly] = useState(false);
  const [saved, setSaved] = useLocalStorage<string[]>('aos:starred-npubs', []);

  useSeoMeta({
    title: "Who's Attending — AOS Convergence Oslo",
    description: 'Attendees of AOS Convergence Oslo 2026 (approved attendees only).',
  });

  useEffect(() => {
    if (!user) navigate('/');
  }, [user, navigate]);

  const npubs = useMemo(() => (attendees ?? []).map((a) => a.npub), [attendees]);
  const searchIndex = useProfileSearchIndex(npubs);

  const savedSet = useMemo(() => new Set(saved), [saved]);
  const toggleSave = (npub: string) =>
    setSaved((prev) =>
      prev.includes(npub) ? prev.filter((x) => x !== npub) : [...prev, npub],
    );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (attendees ?? []).filter((a) => {
      if (savedOnly && !savedSet.has(a.npub)) return false;
      if (q) {
        const blob = searchIndex.get(a.npub) ?? '';
        if (!a.npub.toLowerCase().includes(q) && !blob.includes(q)) return false;
      }
      return true;
    });
  }, [attendees, query, savedOnly, savedSet, searchIndex]);

  if (!user) return null;
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
              <p className="text-sm text-[#716f6a]">
                The npub{' '}
                <code className="text-xs bg-[#f2f1f0] px-1.5 py-0.5 rounded break-all">
                  {npub}
                </code>{' '}
                is not on our approved attendee list.
              </p>
            ) : (
              <p className="text-sm text-[#716f6a]">{error.message}</p>
            )}
          </div>
          <Button
            variant="outline"
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="rounded-xl"
          >
            Log out and try a different key
          </Button>
        </div>
      </SiteLayout>
    );
  }

  if (!attendees) return null;

  return (
    <SiteLayout>
      <section
        className="pt-14 pb-8 md:pt-20 md:pb-10"
        style={{ background: 'radial-gradient(circle at top, #f7f6f4, #fbfaf8 55%)' }}
      >
        <div className="max-w-[720px] mx-auto px-6 text-center">
          <span className="text-xs font-medium tracking-[0.16em] uppercase text-muted-foreground/60 mb-3 block">
            For approved attendees
          </span>
          <h1 className="text-[clamp(1.9rem,3.1vw+1.2rem,3rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-foreground mb-3">
            Who's Attending
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            Follow them on Nostr, star the ones you want to meet, and message
            them directly.
          </p>
        </div>
      </section>

      <div className="max-w-[1120px] mx-auto px-6 py-10 space-y-6">
        <div className="bg-card border border-border rounded-[18px] p-4">
          <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
            <Info className="h-4 w-4" /> New to Nostr? Don't see yourself?
          </p>
          <p className="text-xs text-muted-foreground mt-1.5">
            Everyone who registered has a Nostr ID, but you'll only appear here
            once you've set up a Nostr <em>profile</em> (a name and photo). If your
            card is missing or shows a random name:
          </p>
          <ol className="text-xs text-muted-foreground mt-2 space-y-1 list-decimal list-inside">
            <li>
              Open{' '}
              <a
                href="https://ditto.pub"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open Ditto to set up your Nostr profile (opens in a new tab or the Ditto app)"
                className="font-medium text-foreground underline underline-offset-2"
              >
                ditto.pub
              </a>{' '}
              and log in with the Nostr account you created when you registered
              (a browser extension like{' '}
              <a
                href="https://chromewebstore.google.com/detail/ditto-extension/fbiegkepanmjielbemkhieckmlckiagi"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Install the Ditto Extension browser extension (opens in a new tab)"
                className="font-medium text-foreground underline underline-offset-2"
              >
                Ditto Extension
              </a>
              , or your secret key).
            </li>
            <li>Go to your profile where you can add your name, a profile picture, or whatever else you'd like, then click save.</li>
            <li>
              Come back here and refresh — your card will populate within a few
              minutes once your profile reaches the relays.
            </li>
          </ol>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, handle, bio, or npub…"
            className="rounded-full"
            aria-label="Search attendees"
          />
          <Button
            type="button"
            variant={savedOnly ? 'default' : 'outline'}
            onClick={() => setSavedOnly((v) => !v)}
            className="rounded-full shrink-0"
          >
            <Star className={`h-4 w-4 mr-1.5 ${savedOnly ? 'fill-current' : ''}`} />
            My list ({saved.length})
          </Button>
        </div>

        <div className="bg-card border border-border rounded-[18px] p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" /> Publish a follow pack
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Publishes a <em>public</em> Nostr follow pack (kind 39089) of your{' '}
              {saved.length} starred {saved.length === 1 ? 'person' : 'people'} — only the
              people you picked, shareable in any Nostr client.
            </p>
          </div>
          <Button
            type="button"
            disabled={saved.length === 0 || followPack.isPending}
            onClick={() => followPack.mutate(saved)}
            className="rounded-full shrink-0"
          >
            {followPack.isPending
              ? 'Publishing…'
              : followPack.isSuccess
                ? 'Published ✓'
                : 'Publish my pack'}
          </Button>
        </div>
        {followPack.isError && (
          <p className="text-sm text-red-600">
            {(followPack.error as Error).message}
          </p>
        )}

        <p className="text-xs text-muted-foreground">
          Showing {filtered.length} of {attendees.length}
        </p>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-sm text-muted-foreground">
            {savedOnly && saved.length === 0
              ? 'Your list is empty — star people you want to meet.'
              : 'No attendees match your search.'}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((a) => (
              <AttendeeCard
                key={a.npub}
                npub={a.npub}
                saved={savedSet.has(a.npub)}
                onToggleSave={() => toggleSave(a.npub)}
              />
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
};

export default Attending;
