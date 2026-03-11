import { FormEvent, useState } from 'react';
import { useSeoMeta } from '@unhead/react';
import { Link } from 'react-router-dom';
import { SiteLayout } from '@/components/SiteLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdminApprovals } from '@/hooks/useAdminApprovals';
import { useLoginActions } from '@/hooks/useLoginActions';

const AdminApprovals = () => {
  const [npub, setNpub] = useState('');
  const [message, setMessage] = useState('');
  const { user, approvalsQuery, addMutation, removeMutation } = useAdminApprovals();
  const login = useLoginActions();

  useSeoMeta({
    title: 'Admin Approvals — AOS Convergence',
    description: 'Admin-only management for approved attendee npubs.',
  });

  const list = approvalsQuery.data?.items ?? [];
  const loading = approvalsQuery.isLoading;
  const isForbidden = approvalsQuery.error?.message === 'NOT_ADMIN';

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');

    const trimmed = npub.trim();
    if (!trimmed) {
      setMessage('Enter an npub.');
      return;
    }

    try {
      await addMutation.mutateAsync(trimmed);
      setNpub('');
      setMessage('npub added.');
    } catch (error) {
      setMessage((error as Error).message || 'Failed to add npub.');
    }
  };

  const handleRemove = async (value: string) => {
    setMessage('');
    try {
      await removeMutation.mutateAsync(value);
      setMessage('npub removed.');
    } catch (error) {
      setMessage((error as Error).message || 'Failed to remove npub.');
    }
  };

  if (!user) {
    return (
      <SiteLayout>
        <section className="max-w-[720px] mx-auto px-6 py-20">
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-foreground mb-3">Admin approvals</h1>
          <p className="text-sm text-muted-foreground mb-6">Log in with an admin Nostr key to manage approved attendees.</p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => login.extension()} className="rounded-xl">Log in with Extension</Button>
            <Link to="/" className="inline-flex items-center px-4 py-2 rounded-xl border border-border text-sm text-foreground">
              Back to home
            </Link>
          </div>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="max-w-[860px] mx-auto px-6 py-16">
        <span className="text-xs font-medium tracking-[0.16em] uppercase text-muted-foreground/70 mb-2 block">
          AOS Convergence Admin
        </span>
        <h1 className="text-[clamp(1.5rem,2.1vw+1rem,2.25rem)] font-semibold tracking-[-0.03em] text-foreground mb-3">
          Approved attendee list
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Add or remove `npub`s. Changes are applied immediately to gated content access.
        </p>

        {isForbidden && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 mb-5">
            <p className="text-sm text-red-700">Your logged-in key is not in the admin allowlist.</p>
          </div>
        )}

        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3 mb-6">
          <Input
            value={npub}
            onChange={(e) => { setNpub(e.target.value); }}
            placeholder="npub1..."
            className="h-11 rounded-xl"
            disabled={isForbidden || addMutation.isPending}
          />
          <Button
            type="submit"
            className="h-11 rounded-xl"
            disabled={isForbidden || addMutation.isPending}
          >
            {addMutation.isPending ? 'Adding...' : 'Add npub'}
          </Button>
        </form>

        {message && (
          <p className="text-sm text-muted-foreground mb-4">{message}</p>
        )}

        <div className="rounded-2xl border border-border overflow-hidden">
          <div className="grid grid-cols-[1fr_auto] gap-3 px-4 py-3 bg-card border-b border-border">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">npub</p>
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Action</p>
          </div>

          {loading ? (
            <div className="px-4 py-6 text-sm text-muted-foreground">Loading approvals...</div>
          ) : list.length === 0 ? (
            <div className="px-4 py-6 text-sm text-muted-foreground">No approved npubs yet.</div>
          ) : (
            <div>
              {list.map((item) => (
                <div key={item.npub} className="grid grid-cols-[1fr_auto] gap-3 px-4 py-3 border-b border-border last:border-b-0 items-center">
                  <code className="text-xs sm:text-sm break-all">{item.npub}</code>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                    onClick={() => { void handleRemove(item.npub); }}
                    disabled={isForbidden || removeMutation.isPending}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
};

export default AdminApprovals;
