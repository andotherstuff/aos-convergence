import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogFooter } from '@/components/ui/dialog';
import { FormspreeSubmission, useAdminApplications } from '@/hooks/useAdminApplications';
import { ApplicationDetailDialog } from './ApplicationDetailDialog';
import { Mail } from 'lucide-react';

type StatusFilter = 'all' | 'pending' | 'accepted' | 'rejected';

function statusOf(sub: FormspreeSubmission): 'pending' | 'accepted' | 'rejected' {
  if (sub._decision?.status) return sub._decision.status;
  // If the npub is already in the approved list (e.g. added directly),
  // reflect that instead of showing a stale "pending" status.
  if (sub._is_approved) return 'accepted';
  return 'pending';
}

function StatusBadge({ status }: { status: 'pending' | 'accepted' | 'rejected' }) {
  const styles = {
    pending: 'bg-muted text-muted-foreground',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {status === 'rejected' ? 'declined' : status}
    </span>
  );
}

function buildMailtoLink(email: string, name: string, accepted: boolean) {
  const subject = encodeURIComponent('AOS Convergence — Application Update');
  const body = accepted
    ? encodeURIComponent(
        `Hi ${name},\n\nGreat news! Your application to AOS Convergence has been accepted.\n\nWe'll be in touch with event details and next steps soon. In the meantime, make sure you can log in at https://convergence.andotherstuff.org with the Nostr key you provided in your application.\n\nLooking forward to seeing you in Oslo!\n\nBest,\nAOS Convergence Team`,
      )
    : encodeURIComponent(
        `Hi ${name},\n\nThank you for your interest in AOS Convergence. After careful review, we're unable to offer a spot at this time.\n\nWe appreciate your application and hope to connect in the future.\n\nBest,\nAOS Convergence Team`,
      );
  return `mailto:${email}?subject=${subject}&body=${body}`;
}

interface Props {
  isForbidden: boolean;
}

export function ApplicationsTab({ isForbidden }: Props) {
  const { applicationsQuery, decideMutation, page, setPage } = useAdminApplications();
  const [filter, setFilter] = useState<StatusFilter>('pending');
  const [selected, setSelected] = useState<FormspreeSubmission | null>(null);
  const [message, setMessage] = useState('');
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [bulkProcessing, setBulkProcessing] = useState(false);

  const submissions = applicationsQuery.data?.submissions ?? [];
  const totalPages = applicationsQuery.data?.pages ?? 1;
  const loading = applicationsQuery.isLoading;

  const filtered = filter === 'all' ? submissions : submissions.filter((s) => statusOf(s) === filter);
  const pendingFiltered = filtered.filter((s) => statusOf(s) === 'pending' && s.nostr_npub);
  const checkedPending = pendingFiltered.filter((s) => checked.has(s._submission_id));

  const toggleCheck = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (checkedPending.length === pendingFiltered.length) {
      // Uncheck all pending
      setChecked((prev) => {
        const next = new Set(prev);
        for (const s of pendingFiltered) next.delete(s._submission_id);
        return next;
      });
    } else {
      // Check all pending
      setChecked((prev) => {
        const next = new Set(prev);
        for (const s of pendingFiltered) next.add(s._submission_id);
        return next;
      });
    }
  };

  const handleDecide = async (sub: FormspreeSubmission, status: 'accepted' | 'rejected') => {
    setMessage('');
    try {
      await decideMutation.mutateAsync({
        submissionId: sub._submission_id,
        status,
        npub: sub.nostr_npub || undefined,
        name: sub.full_name || undefined,
        email: sub.email || undefined,
      });
      setSelected(null);
      setMessage(`Application ${status === 'rejected' ? 'declined' : status}.`);
    } catch (error) {
      setMessage((error as Error).message || `Failed to ${status} application.`);
    }
  };

  const handleBulkAccept = async () => {
    const toAccept = submissions.filter(
      (s) => checked.has(s._submission_id) && statusOf(s) === 'pending' && s.nostr_npub,
    );
    if (toAccept.length === 0) return;

    setBulkProcessing(true);
    setMessage('');
    let accepted = 0;
    let failed = 0;
    const errors: string[] = [];

    for (let i = 0; i < toAccept.length; i += 5) {
      const batch = toAccept.slice(i, i + 5);
      const results = await Promise.allSettled(
        batch.map((sub) =>
          decideMutation.mutateAsync({
            submissionId: sub._submission_id,
            status: 'accepted',
            npub: sub.nostr_npub || undefined,
            name: sub.full_name || undefined,
            email: sub.email || undefined,
          }),
        ),
      );
      for (let j = 0; j < results.length; j++) {
        if (results[j].status === 'fulfilled') {
          accepted++;
        } else {
          failed++;
          const reason = (results[j] as PromiseRejectedResult).reason;
          errors.push(`${batch[j].full_name || batch[j].nostr_npub}: ${reason instanceof Error ? reason.message : 'Unknown error'}`);
        }
      }
    }

    setChecked(new Set());
    setBulkProcessing(false);
    if (failed === 0) {
      setMessage(`${accepted} application${accepted !== 1 ? 's' : ''} accepted.`);
    } else {
      setMessage(`${accepted} accepted, ${failed} failed: ${errors.join('; ')}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {loading ? 'Loading...' : `${submissions.length} submissions on page ${page}`}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {checkedPending.length > 0 && (
            <Button
              size="sm"
              className="rounded-lg bg-green-600 hover:bg-green-700 text-white"
              disabled={isForbidden || bulkProcessing}
              onClick={() => void handleBulkAccept()}
            >
              {bulkProcessing ? 'Processing...' : `Accept ${checkedPending.length} selected`}
            </Button>
          )}
          <Select value={filter} onValueChange={(v) => setFilter(v as StatusFilter)}>
            <SelectTrigger className="w-[140px] h-9 rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Declined</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {message && <p className="text-sm text-muted-foreground">{message}</p>}

      {loading ? (
        <div className="py-8 text-sm text-muted-foreground text-center">Loading applications...</div>
      ) : filtered.length === 0 ? (
        <div className="py-8 text-sm text-muted-foreground text-center">No applications found.</div>
      ) : (
        <div className="space-y-3">
          {/* Select all toggle */}
          {pendingFiltered.length > 0 && (
            <label className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground pl-1">
              <input
                type="checkbox"
                checked={checkedPending.length === pendingFiltered.length && pendingFiltered.length > 0}
                onChange={toggleAll}
                className="w-4 h-4 rounded border-border text-foreground focus:ring-foreground"
                disabled={bulkProcessing}
              />
              Select all pending ({pendingFiltered.length})
            </label>
          )}

          {filtered.map((sub) => {
            const status = statusOf(sub);
            const canCheck = status === 'pending' && !!sub.nostr_npub;
            return (
              <div
                key={sub._submission_id}
                className="rounded-xl border border-border p-4 flex items-center gap-4"
              >
                {canCheck ? (
                  <input
                    type="checkbox"
                    checked={checked.has(sub._submission_id)}
                    onChange={() => toggleCheck(sub._submission_id)}
                    className="w-4 h-4 rounded border-border text-foreground focus:ring-foreground shrink-0"
                    disabled={bulkProcessing}
                  />
                ) : (
                  <div className="w-4 shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-foreground truncate">{sub.full_name || 'No name'}</p>
                    <StatusBadge status={status} />
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {sub.email} {sub.nostr_npub ? `\u00b7 ${sub.nostr_npub.slice(0, 20)}...` : ''}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {sub.location ? `${sub.location} \u00b7 ` : ''}
                    {new Date(sub._date).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg shrink-0"
                  onClick={() => setSelected(sub)}
                >
                  View
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}

      <ApplicationDetailDialog
        submission={selected}
        onOpenChange={(open) => { if (!open) setSelected(null); }}
        footer={selected && (
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {statusOf(selected) === 'pending' ? (
              <>
                <Button
                  className="rounded-lg bg-green-600 hover:bg-green-700 text-white"
                  disabled={isForbidden || decideMutation.isPending || !selected.nostr_npub}
                  onClick={() => void handleDecide(selected, 'accepted')}
                >
                  {decideMutation.isPending ? 'Processing...' : 'Accept'}
                </Button>
                <Button
                  variant="outline"
                  className="rounded-lg border-red-300 text-red-700 hover:bg-red-50"
                  disabled={isForbidden || decideMutation.isPending}
                  onClick={() => void handleDecide(selected, 'rejected')}
                >
                  {decideMutation.isPending ? 'Processing...' : 'Decline'}
                </Button>
                {!selected.nostr_npub && (
                  <p className="text-xs text-red-600">No npub provided — cannot accept without an npub.</p>
                )}
              </>
            ) : (
              <a
                href={buildMailtoLink(selected.email, selected.full_name, statusOf(selected) === 'accepted')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-secondary transition-colors"
              >
                <Mail className="h-4 w-4" />
                Send notification email
              </a>
            )}
          </DialogFooter>
        )}
      />
    </div>
  );
}
