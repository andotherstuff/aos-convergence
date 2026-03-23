import { useSeoMeta } from '@unhead/react';
import { Link } from 'react-router-dom';
import { SiteLayout } from '@/components/SiteLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAdminApprovals } from '@/hooks/useAdminApprovals';
import { useLoginActions } from '@/hooks/useLoginActions';
import { ApplicationsTab } from '@/components/admin/ApplicationsTab';
import { ApprovedAttendeesTab } from '@/components/admin/ApprovedAttendeesTab';

const AdminApprovals = () => {
  const { user, approvalsQuery } = useAdminApprovals();
  const login = useLoginActions();

  useSeoMeta({
    title: 'Admin — AOS Convergence',
    description: 'Admin-only management for applications and approved attendees.',
  });

  const isForbidden = approvalsQuery.error?.message === 'NOT_ADMIN';

  if (!user) {
    return (
      <SiteLayout>
        <section className="max-w-[720px] mx-auto px-6 max-[720px]:px-4 py-20 max-[720px]:py-12">
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-foreground mb-3">Admin</h1>
          <p className="text-sm text-muted-foreground mb-6">Log in with an admin Nostr key to manage applications and attendees.</p>
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
      <section className="max-w-[1100px] mx-auto px-6 max-[720px]:px-4 py-16 max-[720px]:py-10">
        <span className="text-xs font-medium tracking-[0.16em] uppercase text-muted-foreground/70 mb-2 block">
          AOS Convergence Admin
        </span>
        <h1 className="text-[clamp(1.5rem,2.1vw+1rem,2.25rem)] font-semibold tracking-[-0.03em] text-foreground mb-3">
          Event Management
        </h1>

        {isForbidden && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 mb-5">
            <p className="text-sm text-red-700">Your logged-in key is not in the admin allowlist.</p>
          </div>
        )}

        <Tabs defaultValue="applications" className="mt-6">
          <TabsList className="rounded-xl">
            <TabsTrigger value="applications" className="rounded-lg">Applications</TabsTrigger>
            <TabsTrigger value="attendees" className="rounded-lg">Approved Attendees</TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="mt-6">
            <ApplicationsTab isForbidden={isForbidden} />
          </TabsContent>

          <TabsContent value="attendees" className="mt-6">
            <p className="text-sm text-muted-foreground mb-6">
              Add attendees with `npub`, `name/nym`, and `email`. Edit details inline and export the full list to CSV.
            </p>
            <ApprovedAttendeesTab isForbidden={isForbidden} />
          </TabsContent>
        </Tabs>
      </section>
    </SiteLayout>
  );
};

export default AdminApprovals;
