import { useState, useEffect } from 'react';
import { useSeoMeta } from '@unhead/react';
import { useNavigate } from 'react-router-dom';
import { SiteLayout } from '@/components/SiteLayout';
import { useLoggedInAccounts } from '@/hooks/useLoggedInAccounts';
import { useLoginActions } from '@/hooks/useLoginActions';
import { useEventDetails } from '@/hooks/useEventDetails';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatExtensionLoginError, hasNostrExtension } from '@/lib/nostrExtension';

const Landing = () => {
  const { currentUser } = useLoggedInAccounts();
  const login = useLoginActions();
  const navigate = useNavigate();
  const { data: eventData, error: eventError, isLoading: eventLoading } = useEventDetails();
  const [nsec, setNsec] = useState('');
  const [bunkerUri, setBunkerUri] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const signerDetected = hasNostrExtension();

  const isNotApproved = currentUser && !eventLoading && eventError?.message === 'NOT_APPROVED';

  // After login, if approved, go to event page
  useEffect(() => {
    if (currentUser && eventData) {
      navigate('/event');
    }
  }, [currentUser, eventData, navigate]);

  useSeoMeta({
    title: 'AOS Convergence — Oslo, May 2026',
    description: 'A curated three-day convergence in Oslo for builders, researchers, and leaders working on decentralized systems, freedom tech, Bitcoin, Nostr, and AI.',
  });

  const handleExtensionLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await login.extension();
      navigate('/event');
    } catch (e) {
      setError(formatExtensionLoginError(e));
    } finally {
      setLoading(false);
    }
  };

  const handleNsecLogin = () => {
    setError('');
    const trimmed = nsec.trim();
    if (!trimmed) {
      setError('Please enter your secret key');
      return;
    }
    if (!trimmed.startsWith('nsec1')) {
      setError('Invalid key format. Must start with nsec1.');
      return;
    }
    setLoading(true);
    try {
      login.nsec(trimmed);
      navigate('/event');
    } catch {
      setError('Invalid secret key.');
      setLoading(false);
    }
  };

  const handleBunkerLogin = async () => {
    setError('');
    const trimmed = bunkerUri.trim();
    if (!trimmed) {
      setError('Please paste your bunker:// connection string');
      return;
    }
    if (!trimmed.startsWith('bunker://')) {
      setError('Invalid format. A NIP-46 connection string starts with bunker://');
      return;
    }
    setLoading(true);
    try {
      await login.bunker(trimmed);
      navigate('/event');
    } catch (e) {
      setError((e as Error).message || 'Remote signer login failed');
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden" style={{ background: 'radial-gradient(circle at top, #f7f6f4, #fbfaf8 55%)' }}>
      <div className="max-w-[1120px] mx-auto px-6 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <span className="inline-block text-xs font-medium tracking-[0.16em] uppercase text-muted-foreground mb-4">
              May 29–31, 2026 · Oslo, Norway
            </span>
            <h1 className="text-[clamp(1.9rem,3.1vw+1.2rem,3rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-foreground mb-6">
              AOS Convergence
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground mb-8 max-w-lg">
              A curated three-day gathering for builders, researchers, funders, and community leaders
              actively working to expand human agency through open systems.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="/about"
                className="inline-flex items-center px-6 py-3 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>

          <div id="login" className="bg-card rounded-[28px] p-8 shadow-[0_18px_45px_rgba(0,0,0,0.08)] border border-border">
            {isNotApproved ? (
              <>
                <h2 className="text-lg font-semibold tracking-[-0.02em] text-foreground mb-4">
                  You're not on the approved list yet
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground mb-6">
                  Your Nostr identity was not found on our attendee list. If you believe this is an error or need help, contact the organizers.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    onClick={() => { login.logout(); }}
                    className="rounded-full px-6 py-3 h-auto"
                  >
                    Try a different key
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold tracking-[-0.02em] text-foreground mb-6">
                  Already approved? Log in with Nostr
                </h2>

                <div className="space-y-4">
                  <Button
                    onClick={handleExtensionLogin}
                    disabled={loading}
                    className="w-full h-12 rounded-xl bg-foreground text-background hover:bg-foreground/90"
                  >
                    {loading ? 'Connecting...' : 'Log in with Signer / Extension'}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center leading-relaxed">
                    {signerDetected
                      ? 'Signer detected in this browser.'
                      : 'Use this for NIP-07 signers such as Soapbox Signer. Amber on Android should use the remote signer flow below.'}
                  </p>

                  <div className="relative flex items-center gap-4">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground">or use a secret key</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); handleNsecLogin(); }} className="space-y-3">
                    <Input
                      type="password"
                      value={nsec}
                      onChange={(e) => { setNsec(e.target.value); setError(''); }}
                      placeholder="nsec1..."
                      className="h-12 rounded-xl"
                      autoComplete="off"
                    />
                    <Button
                      type="submit"
                      variant="outline"
                      disabled={loading || !nsec.trim()}
                      className="w-full h-12 rounded-xl"
                    >
                      Log in
                    </Button>
                  </form>

                  <div className="relative flex items-center gap-4">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground">or use a remote signer</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); handleBunkerLogin(); }} className="space-y-3">
                    <Input
                      type="password"
                      value={bunkerUri}
                      onChange={(e) => { setBunkerUri(e.target.value); setError(''); }}
                      placeholder="bunker://..."
                      className="h-12 rounded-xl"
                      autoComplete="off"
                    />
                    <Button
                      type="submit"
                      variant="outline"
                      disabled={loading || !bunkerUri.trim()}
                      className="w-full h-12 rounded-xl"
                    >
                      {loading ? 'Connecting…' : 'Connect remote signer (NIP-46)'}
                    </Button>
                  </form>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Amber users: in Amber, start a Nostr Connect or bunker session and paste the resulting <code>bunker://</code> URI here.
                  </p>

                  {error && (
                    <p className="text-sm text-red-600">{error}</p>
                  )}

                  {currentUser && eventLoading && (
                    <p className="text-sm text-muted-foreground text-center">Verifying your attendance...</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const LandingPage = () => (
  <SiteLayout>
    <Landing />
  </SiteLayout>
);

export default LandingPage;
