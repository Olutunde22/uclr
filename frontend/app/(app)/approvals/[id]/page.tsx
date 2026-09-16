import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { getQueryClient } from '@/app/get-query-client';
import { NoAccess } from '@/components/shared/no-access';
import { RegistrationDetailView } from '@/components/approvals/registration-detail-view';
import { approvalsKeys } from '@/hooks/keys';
import { canAccess } from '@/lib/page-access';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { getSession } from '@/lib/session';
import { getAdviserQueue, getHodQueue } from '@/services/approvals';

export const metadata: Metadata = {
  title: 'Review registration',
  description: 'Review a registration and record your decision',
  robots: 'noindex, nofollow',
};

interface ApprovalDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ApprovalDetailPage({
  params,
}: ApprovalDetailPageProps) {
  if (!(await canAccess(PERMISSIONS.APPROVALS_ADVISER, PERMISSIONS.APPROVALS_HOD))) {
    return <NoAccess />;
  }
  const { id } = await params;

  const { data: user } = await getSession();
  const isAdviser = hasPermission(user?.permissions, PERMISSIONS.APPROVALS_ADVISER);
  const isHod = hasPermission(user?.permissions, PERMISSIONS.APPROVALS_HOD);

  const queryClient = getQueryClient();

  // Figure out which queue actually contains this id (a caller who holds
  // both permissions, e.g. system_admin, could have it in either) so the
  // detail view calls the matching decision endpoint.
  let role: 'adviser' | 'hod' | null = null;
  if (isAdviser) {
    const adviserQueue = await queryClient.fetchQuery({
      queryKey: approvalsKeys.adviserQueue(),
      queryFn: () => getAdviserQueue(),
    });
    if ((adviserQueue.data ?? []).some((r) => r.id === id)) role = 'adviser';
  }
  if (!role && isHod) {
    const hodQueue = await queryClient.fetchQuery({
      queryKey: approvalsKeys.hodQueue(),
      queryFn: () => getHodQueue(),
    });
    if ((hodQueue.data ?? []).some((r) => r.id === id)) role = 'hod';
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Review registration</h1>
          <p className="text-muted-foreground text-sm">
            Check the submitted courses and record your decision.
          </p>
        </div>
        <RegistrationDetailView id={id} role={role ?? (isHod ? 'hod' : 'adviser')} />
      </div>
    </HydrationBoundary>
  );
}
