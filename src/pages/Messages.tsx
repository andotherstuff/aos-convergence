import { useSeoMeta } from '@unhead/react';
import { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import { SiteLayout } from '@/components/SiteLayout';
import { DMProvider } from '@/components/DMProvider';
import { DMMessagingInterface } from '@/components/dm/DMMessagingInterface';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { PROTOCOL_MODE } from '@/lib/dmConstants';

const Messages = () => {
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useSeoMeta({
    title: 'Messages — AOS Convergence',
    description: 'Private encrypted Nostr messaging for AOS Convergence attendees.',
  });

  useEffect(() => {
    if (!user) navigate('/');
  }, [user, navigate]);

  // Deep-link target: /messages?to=<npub> opens that conversation on mount.
  const initialPubkey = useMemo(() => {
    const to = params.get('to');
    if (!to) return undefined;
    try {
      const d = nip19.decode(to);
      return d.type === 'npub' ? (d.data as string) : undefined;
    } catch {
      return undefined;
    }
  }, [params]);

  if (!user) return null;

  return (
    <SiteLayout>
      <div className="max-w-[1120px] mx-auto px-6 py-8 w-full">
        <h1 className="text-[1.4rem] font-semibold tracking-[-0.02em] text-foreground mb-3">
          Messages
        </h1>
        <div className="bg-amber-50 border border-amber-200 rounded-[14px] p-3.5 mb-4 text-xs leading-relaxed text-amber-900">
          Messages use <strong>NIP-04</strong> so they're readable in major Nostr
          clients (Primal, Damus, Amethyst, etc.). The message{' '}
          <strong>content is encrypted</strong>, but on Nostr it is public that
          you messaged this person and when. For anything time-sensitive or
          sensitive, you probably want to use <strong>Signal</strong> instead.
        </div>
        <DMProvider config={{ enabled: true, protocolMode: PROTOCOL_MODE.NIP04_ONLY }}>
          <div className="h-[70vh] min-h-[480px]">
            <DMMessagingInterface className="h-full" initialPubkey={initialPubkey} />
          </div>
        </DMProvider>
      </div>
    </SiteLayout>
  );
};

export default Messages;
