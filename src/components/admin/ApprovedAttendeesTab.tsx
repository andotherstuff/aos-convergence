import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ApprovalRecord, useAdminApprovals } from '@/hooks/useAdminApprovals';
import { FormspreeSubmission, useAdminApplications } from '@/hooks/useAdminApplications';
import { BulkUploadDialog } from './BulkUploadDialog';
import { ApplicationDetailDialog } from './ApplicationDetailDialog';

type EditState = Record<string, {
  name: string;
  email: string;
  tshirt_size: string;
  dietary_restrictions: string;
  mobility_concerns: string;
}>;

function escapeCsv(value: string): string {
  const escaped = value.replaceAll('"', '""');
  return `"${escaped}"`;
}

function downloadApprovalsCsv(list: ApprovalRecord[]) {
  const header = [
    'npub', 'name', 'email', 'tshirt_size', 'dietary_restrictions', 'mobility_concerns',
    'addedAt', 'addedBy', 'updatedAt', 'updatedBy',
  ];
  const rows = list.map((item) => [
    item.npub, item.name, item.email,
    item.tshirt_size, item.dietary_restrictions, item.mobility_concerns,
    item.addedAt, item.addedBy, item.updatedAt, item.updatedBy,
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

const TSHIRT_SIZES = ['', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];

interface Props {
  isForbidden: boolean;
}

export function ApprovedAttendeesTab({ isForbidden }: Props) {
  const { approvalsQuery, addMutation, updateMutation, removeMutation } = useAdminApprovals();
  const { applicationsQuery } = useAdminApplications();

  const [npub, setNpub] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [edits, setEdits] = useState<EditState>({});
  const [bulkOpen, setBulkOpen] = useState(false);
  const [viewingApplication, setViewingApplication] = useState<FormspreeSubmission | null>(null);

  const list = approvalsQuery.data?.items ?? [];
  const loading = approvalsQuery.isLoading;

  // Build npub → submission lookup from loaded applications
  const submissionsByNpub = useMemo(() => {
    const map = new Map<string, FormspreeSubmission>();
    for (const sub of applicationsQuery.data?.submissions ?? []) {
      if (sub.nostr_npub) map.set(sub.nostr_npub, sub);
    }
    return map;
  }, [applicationsQuery.data]);

  useEffect(() => {
    const next: EditState = {};
    for (const item of list) {
      next[item.npub] = {
        name: item.name ?? '',
        email: item.email ?? '',
        tshirt_size: item.tshirt_size ?? '',
        dietary_restrictions: item.dietary_restrictions ?? '',
        mobility_concerns: item.mobility_concerns ?? '',
      };
    }
    setEdits(next);
  }, [list]);

  const busy = addMutation.isPending || updateMutation.isPending || removeMutation.isPending;
  const hasRows = list.length > 0;
  const sortedList = useMemo(() => [...list].sort((a, b) => a.npub.localeCompare(b.npub)), [list]);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    const trimmed = npub.trim();
    if (!trimmed) { setMessage('Enter an npub.'); return; }
    try {
      await addMutation.mutateAsync({ npub: trimmed, name: name.trim(), email: email.trim() });
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
    const edit = edits[item.npub];
    if (!edit) return;
    try {
      await updateMutation.mutateAsync({
        npub: item.npub,
        name: edit.name,
        email: edit.email,
        tshirt_size: edit.tshirt_size,
        dietary_restrictions: edit.dietary_restrictions,
        mobility_concerns: edit.mobility_concerns,
      });
      setMessage(`Saved updates for ${item.npub}.`);
    } catch (error) {
      setMessage((error as Error).message || 'Failed to save attendee details.');
    }
  };

  const updateEdit = (npubKey: string, field: string, value: string) => {
    setEdits((prev) => ({
      ...prev,
      [npubKey]: { ...prev[npubKey], [field]: value },
    }));
  };

  return (
    <div>
      <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr_auto] gap-3 mb-4">
        <Input
          value={npub}
          onChange={(e) => setNpub(e.target.value)}
          placeholder="npub1..."
          className="h-11 rounded-xl"
          disabled={isForbidden || addMutation.isPending}
        />
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name / nym"
          className="h-11 rounded-xl"
          disabled={isForbidden || addMutation.isPending}
        />
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
          type="email"
          className="h-11 rounded-xl"
          disabled={isForbidden || addMutation.isPending}
        />
        <Button type="submit" className="h-11 rounded-xl" disabled={isForbidden || addMutation.isPending}>
          {addMutation.isPending ? 'Adding...' : 'Add'}
        </Button>
      </form>

      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-muted-foreground">Total attendees: {list.length}</p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg"
            onClick={() => setBulkOpen(true)}
            disabled={isForbidden}
          >
            Bulk Upload CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg"
            onClick={() => downloadApprovalsCsv(sortedList)}
            disabled={!hasRows}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {message && <p className="text-sm text-muted-foreground mb-4">{message}</p>}

      <div className="rounded-2xl border border-border overflow-x-auto">
        <div className="min-w-[1280px]">
          <div className="grid grid-cols-[1.8fr_0.8fr_1fr_0.5fr_0.8fr_0.8fr_0.7fr_0.8fr] gap-3 px-4 py-3 bg-card border-b border-border">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">npub</p>
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Name / nym</p>
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Email</p>
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">T-shirt</p>
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Dietary</p>
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Mobility</p>
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
                const edit = edits[item.npub] ?? {
                  name: '', email: '', tshirt_size: '', dietary_restrictions: '', mobility_concerns: '',
                };
                return (
                  <div
                    key={item.npub}
                    className="grid grid-cols-[1.8fr_0.8fr_1fr_0.5fr_0.8fr_0.8fr_0.7fr_0.8fr] gap-3 px-4 py-3 border-b border-border last:border-b-0 items-center"
                  >
                    <code className="text-xs break-all">{item.npub}</code>
                    <Input
                      value={edit.name}
                      onChange={(e) => updateEdit(item.npub, 'name', e.target.value)}
                      placeholder="Name / nym"
                      className="h-9 rounded-lg"
                      disabled={isForbidden || busy}
                    />
                    <Input
                      value={edit.email}
                      onChange={(e) => updateEdit(item.npub, 'email', e.target.value)}
                      placeholder="email@example.com"
                      type="email"
                      className="h-9 rounded-lg"
                      disabled={isForbidden || busy}
                    />
                    <Select
                      value={edit.tshirt_size || '_none'}
                      onValueChange={(v) => updateEdit(item.npub, 'tshirt_size', v === '_none' ? '' : v)}
                      disabled={isForbidden || busy}
                    >
                      <SelectTrigger className="h-9 rounded-lg">
                        <SelectValue placeholder="-" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_none">-</SelectItem>
                        {TSHIRT_SIZES.filter(Boolean).map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={edit.dietary_restrictions}
                      onChange={(e) => updateEdit(item.npub, 'dietary_restrictions', e.target.value)}
                      placeholder="None"
                      className="h-9 rounded-lg"
                      disabled={isForbidden || busy}
                    />
                    <Input
                      value={edit.mobility_concerns}
                      onChange={(e) => updateEdit(item.npub, 'mobility_concerns', e.target.value)}
                      placeholder="None"
                      className="h-9 rounded-lg"
                      disabled={isForbidden || busy}
                    />
                    <p className="text-xs text-muted-foreground break-all">{item.updatedAt || item.addedAt || '-'}</p>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="rounded-lg"
                        onClick={() => void handleSave(item)}
                        disabled={isForbidden || busy}
                      >
                        Save
                      </Button>
                      {submissionsByNpub.has(item.npub) && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg"
                          onClick={() => setViewingApplication(submissionsByNpub.get(item.npub)!)}
                        >
                          Application
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        onClick={() => void handleRemove(item.npub)}
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

      <BulkUploadDialog open={bulkOpen} onOpenChange={setBulkOpen} isForbidden={isForbidden} />

      <ApplicationDetailDialog
        submission={viewingApplication}
        onOpenChange={(open) => { if (!open) setViewingApplication(null); }}
      />
    </div>
  );
}
