import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useSeoMeta } from '@unhead/react';
import { Link } from 'react-router-dom';
import { SiteLayout } from '@/components/SiteLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ApprovalRecord, useAdminApprovals } from '@/hooks/useAdminApprovals';
import { useLoginActions } from '@/hooks/useLoginActions';

type EditState = Record<string, { name: string; email: string }>;

function escapeCsv(value: string): string {
  const escaped = value.replaceAll('"', '""');
  return `"${escaped}"`;
}

function downloadApprovalsCsv(list: ApprovalRecord[]) {
  const header = ['npub', 'name', 'email', 'addedAt', 'addedBy', 'updatedAt', 'updatedBy'];
  const rows = list.map((item) => [
    item.npub,
    item.name,
    item.email,
    item.addedAt,
    item.addedBy,
    item.updatedAt,
    item.updatedBy,
  ]);

  const csv = [header, ...rows].map((row) => row.map((v) => escapeCsv(v ?? '')).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const date = new Date().toISOString().slice(0, 10);
  const a = document.createElement('a');
  a.href = url;
  a.download = `aos-approved-attendees-${date}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const AdminApprovals = () => {
  const [npub, setNpub] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [edits, setEdits] = useState<EditState>({});
  const { user, approvalsQuery, addMutation, updateMutation, removeMutation } = useAdminApprovals();
  const login = useLoginActions();

  useSeoMeta({
    title: 'Admin Approvals — AOS Convergence',
    description: 'Admin-only management for approved attendee npubs.',
  });

  const list = approvalsQuery.data?.items ?? [];
  const loading = approvalsQuery.isLoading;
  const isForbidden = approvalsQuery.error?.message === 'NOT_ADMIN';

  useEffect(() => {
    const next: EditState = {};
    for (const item of list) {
      next[item.npub] = { name: item.name ?? '', email: item.email ?? '' };
    }
    setEdits(next);
  }, [list]);

  const busy = addMutation.isPending || updateMutation.isPending || removeMutation.isPending;

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');

    const trimmed = npub.trim();
    if (!trimmed) {
      setMessage('Enter an npub.');
      return;
    }

    try {
      await addMutation.mutateAsync({
        npub: trimmed,
        name: name.trim(),
        email: email.trim(),
      });
      setNpub('');
      setName('');
      setEmail('');
      setMessage('Attendee added.');
    } catch (error) {
      setMessage((error as Error).message || 'Failed to add attendee.');
    }
  };

  const handleRemove = async (value: string) => {
    setMessage('');
    try {
      await removeMutation.mutateAsync(value);
      setMessage('Attendee removed.');
    } catch (error) {
      setMessage((error as Error).message || 'Failed to remove attendee.');
    }
  };

  const handleSave = async (item: ApprovalRecord) => {
    setMessage('');
    const edit = edits[item.npub] ?? { name: '', email: '' };

    try {
      await updateMutation.mutateAsync({
        npub: item.npub,
        name: edit.name,
        email: edit.email,
      });
      setMessage(`Saved updates for ${item.npub}.`);
    } catch (error) {
      setMessage((error as Error).message || 'Failed to save attendee details.');
    }
  };

  const hasRows = list.length > 0;
  const sortedList = useMemo(() => [...list].sort((a, b) => a.npub.localeCompare(b.npub)), [list]);

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
      <section className="max-w-[1100px] mx-auto px-6 py-16">
        <span className="text-xs font-medium tracking-[0.16em] uppercase text-muted-foreground/70 mb-2 block">
          AOS Convergence Admin
        </span>
        <h1 className="text-[clamp(1.5rem,2.1vw+1rem,2.25rem)] font-semibold tracking-[-0.03em] text-foreground mb-3">
          Approved attendee list
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Add attendees with `npub`, `name/nym`, and `email`. Edit details inline and export the full list to CSV.
        </p>

        {isForbidden && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 mb-5">
            <p className="text-sm text-red-700">Your logged-in key is not in the admin allowlist.</p>
          </div>
        )}

        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr_auto] gap-3 mb-4">
          <Input
            value={npub}
            onChange={(e) => { setNpub(e.target.value); }}
            placeholder="npub1..."
            className="h-11 rounded-xl"
            disabled={isForbidden || addMutation.isPending}
          />
          <Input
            value={name}
            onChange={(e) => { setName(e.target.value); }}
            placeholder="Name / nym"
            className="h-11 rounded-xl"
            disabled={isForbidden || addMutation.isPending}
          />
          <Input
            value={email}
            onChange={(e) => { setEmail(e.target.value); }}
            placeholder="email@example.com"
            type="email"
            className="h-11 rounded-xl"
            disabled={isForbidden || addMutation.isPending}
          />
          <Button
            type="submit"
            className="h-11 rounded-xl"
            disabled={isForbidden || addMutation.isPending}
          >
            {addMutation.isPending ? 'Adding...' : 'Add'}
          </Button>
        </form>

        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-muted-foreground">Total attendees: {list.length}</p>
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg"
            onClick={() => { downloadApprovalsCsv(sortedList); }}
            disabled={!hasRows}
          >
            Export CSV
          </Button>
        </div>

        {message && (
          <p className="text-sm text-muted-foreground mb-4">{message}</p>
        )}

        <div className="rounded-2xl border border-border overflow-x-auto">
          <div className="min-w-[980px]">
            <div className="grid grid-cols-[2fr_1fr_1fr_0.9fr_1fr] gap-3 px-4 py-3 bg-card border-b border-border">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">npub</p>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Name / nym</p>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Email</p>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Updated</p>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Actions</p>
            </div>

            {loading ? (
              <div className="px-4 py-6 text-sm text-muted-foreground">Loading approvals...</div>
            ) : !hasRows ? (
              <div className="px-4 py-6 text-sm text-muted-foreground">No approved npubs yet.</div>
            ) : (
              <div>
                {sortedList.map((item) => {
                  const edit = edits[item.npub] ?? { name: '', email: '' };
                  return (
                    <div key={item.npub} className="grid grid-cols-[2fr_1fr_1fr_0.9fr_1fr] gap-3 px-4 py-3 border-b border-border last:border-b-0 items-center">
                      <code className="text-xs break-all">{item.npub}</code>
                      <Input
                        value={edit.name}
                        onChange={(e) => {
                          setEdits((prev) => ({ ...prev, [item.npub]: { ...edit, name: e.target.value } }));
                        }}
                        placeholder="Name / nym"
                        className="h-9 rounded-lg"
                        disabled={isForbidden || busy}
                      />
                      <Input
                        value={edit.email}
                        onChange={(e) => {
                          setEdits((prev) => ({ ...prev, [item.npub]: { ...edit, email: e.target.value } }));
                        }}
                        placeholder="email@example.com"
                        type="email"
                        className="h-9 rounded-lg"
                        disabled={isForbidden || busy}
                      />
                      <p className="text-xs text-muted-foreground break-all">{item.updatedAt || item.addedAt || '-'}</p>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="rounded-lg"
                          onClick={() => { void handleSave(item); }}
                          disabled={isForbidden || busy}
                        >
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg"
                          onClick={() => { void handleRemove(item.npub); }}
                          disabled={isForbidden || busy}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default AdminApprovals;
