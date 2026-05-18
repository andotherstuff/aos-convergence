import { useState, useCallback } from 'react';
import { nip19 } from 'nostr-tools';
import { PenSquare } from 'lucide-react';
import { DMConversationList } from '@/components/dm/DMConversationList';
import { DMChatArea } from '@/components/dm/DMChatArea';
import { DMStatusInfo } from '@/components/dm/DMStatusInfo';
import { useDMContext } from '@/hooks/useDMContext';
import { useIsMobile } from '@/hooks/useIsMobile';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

/** Accepts an npub or 64-char hex pubkey; returns hex or null. */
function toHexPubkey(input: string): string | null {
  const v = input.trim();
  if (/^[0-9a-f]{64}$/i.test(v)) return v.toLowerCase();
  try {
    const d = nip19.decode(v);
    if (d.type === 'npub') return d.data as string;
    if (d.type === 'nprofile') return (d.data as { pubkey: string }).pubkey;
  } catch {
    /* fall through */
  }
  return null;
}

interface DMMessagingInterfaceProps {
  className?: string;
  /** Hex pubkey to open a conversation with on mount (deep-link target). */
  initialPubkey?: string;
}

export const DMMessagingInterface = ({ className, initialPubkey }: DMMessagingInterfaceProps) => {
  const [selectedPubkey, setSelectedPubkey] = useState<string | null>(initialPubkey ?? null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [newRecipient, setNewRecipient] = useState('');
  const [newError, setNewError] = useState('');
  const isMobile = useIsMobile();
  const { clearCacheAndRefetch } = useDMContext();

  // On mobile, show only one panel at a time
  const showConversationList = !isMobile || !selectedPubkey;
  const showChatArea = !isMobile || selectedPubkey;

  const handleSelectConversation = useCallback((pubkey: string) => {
    setSelectedPubkey(pubkey);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedPubkey(null);
  }, []);

  const handleStartNew = useCallback(() => {
    const hex = toHexPubkey(newRecipient);
    if (!hex) {
      setNewError('Enter a valid npub (or nprofile / hex public key).');
      return;
    }
    setSelectedPubkey(hex);
    setNewOpen(false);
    setNewRecipient('');
    setNewError('');
  }, [newRecipient]);

  return (
    <>
      {/* Status Modal */}
      <Dialog open={statusModalOpen} onOpenChange={setStatusModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Messaging Status</DialogTitle>
            <DialogDescription>
              View loading status, cache info, and connection details
            </DialogDescription>
          </DialogHeader>
          <DMStatusInfo clearCacheAndRefetch={clearCacheAndRefetch} />
        </DialogContent>
      </Dialog>

      {/* New message */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New message</DialogTitle>
            <DialogDescription>
              Paste the npub of the person you want to message. You can find it
              on their Who's Attending card.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => { e.preventDefault(); handleStartNew(); }}
            className="space-y-3"
          >
            <Input
              autoFocus
              value={newRecipient}
              onChange={(e) => { setNewRecipient(e.target.value); setNewError(''); }}
              placeholder="npub1…"
              className="rounded-xl"
            />
            {newError && <p className="text-sm text-red-600">{newError}</p>}
            <DialogFooter>
              <Button type="submit" disabled={!newRecipient.trim()} className="rounded-full">
                Start conversation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className={cn("flex gap-4 overflow-hidden", className)}>
        {/* Conversation List - Left Sidebar */}
        <div className={cn(
          "md:w-80 md:flex-shrink-0",
          isMobile && !showConversationList && "hidden",
          isMobile && showConversationList && "w-full"
        )}>
          <div className="h-full flex flex-col gap-2">
            <Button
              type="button"
              onClick={() => { setNewError(''); setNewOpen(true); }}
              className="w-full justify-center gap-2 shrink-0 h-11 rounded-full bg-foreground text-background font-semibold shadow-sm hover:bg-foreground/90"
            >
              <PenSquare className="h-4 w-4" />
              New message
            </Button>
            <DMConversationList
              selectedPubkey={selectedPubkey}
              onSelectConversation={handleSelectConversation}
              className="flex-1 min-h-0"
              onStatusClick={() => setStatusModalOpen(true)}
            />
          </div>
        </div>

        {/* Chat Area - Right Panel */}
        <div className={cn(
          "flex-1 md:min-w-0",
          isMobile && !showChatArea && "hidden",
          isMobile && showChatArea && "w-full"
        )}>
          <DMChatArea
            pubkey={selectedPubkey}
            onBack={isMobile ? handleBack : undefined}
            className="h-full"
          />
        </div>
      </div>
    </>
  );
};

