import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { FormspreeSubmission } from '@/hooks/useAdminApplications';

function statusOf(sub: FormspreeSubmission): 'pending' | 'accepted' | 'rejected' {
  return sub._decision?.status ?? 'pending';
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

function ApplicationDetail({ label, value }: { label: string; value: string | undefined }) {
  if (!value) return null;
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-sm text-foreground whitespace-pre-wrap">{value}</p>
    </div>
  );
}

interface Props {
  submission: FormspreeSubmission | null;
  onOpenChange: (open: boolean) => void;
  footer?: React.ReactNode;
}

export function ApplicationDetailDialog({ submission, onOpenChange, footer }: Props) {
  return (
    <Dialog open={!!submission} onOpenChange={onOpenChange}>
      {submission && (
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{submission.full_name || 'Application'}</DialogTitle>
            <DialogDescription>
              Submitted {new Date(submission._date).toLocaleDateString()} &middot;{' '}
              <StatusBadge status={statusOf(submission)} />
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <ApplicationDetail label="Email" value={submission.email} />
              <ApplicationDetail label="Location" value={submission.location} />
              <ApplicationDetail label="Nostr npub" value={submission.nostr_npub} />
              <ApplicationDetail label="HRF Opt-in" value={submission.hrf_opt_in === 'yes' ? 'Yes' : 'No'} />
            </div>

            <hr className="border-border" />

            <ApplicationDetail label="What are you building?" value={submission.what_building} />
            <ApplicationDetail label="Why AOS?" value={submission.why_aos} />
            <ApplicationDetail label="Contribution" value={submission.contribution} />
            <ApplicationDetail label="Alignment" value={submission.alignment} />
            <ApplicationDetail label="Skin in the game" value={submission.skin_in_game} />
            <ApplicationDetail label="Hard problem" value={submission.hard_problem} />
            <ApplicationDetail label="Current stage" value={submission.current_stage} />

            {(submission.link_website || submission.link_github || submission.link_nostr || submission.link_twitter || submission.link_other) && (
              <>
                <hr className="border-border" />
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Links</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Website', url: submission.link_website },
                      { label: 'GitHub', url: submission.link_github },
                      { label: 'Nostr', url: submission.link_nostr },
                      { label: 'Twitter', url: submission.link_twitter },
                      { label: 'Other', url: submission.link_other },
                    ]
                      .filter((l) => l.url)
                      .map((l) => (
                        <a
                          key={l.label}
                          href={l.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs underline text-foreground hover:text-foreground/80"
                        >
                          {l.label}
                        </a>
                      ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {footer}
        </DialogContent>
      )}
    </Dialog>
  );
}
