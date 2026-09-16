import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { getQueryClient } from '@/app/get-query-client';
import { NoAccess } from '@/components/shared/no-access';
import { AdviseesView } from '@/components/approvals/advisees-view';
import { approvalsKeys } from '@/hooks/keys';
import { canAccess } from '@/lib/page-access';
import { PERMISSIONS } from '@/lib/permissions';
import { getSession } from '@/lib/session';
import { getAdvisees } from '@/services/approvals';
import { PageHeader } from '@/components/shared/page-header';

export const metadata: Metadata = {
  title: 'Advisees',
  description: 'Your advisees and their registration status',
  robots: 'noindex, nofollow',
};

export default async function AdviseesPage() {
  if (!(await canAccess(PERMISSIONS.APPROVALS_ADVISER))) {
    return <NoAccess />;
  }

  const { data: user } = await getSession();
  if (!user) return <NoAccess />;

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: approvalsKeys.advisees(user.id),
    queryFn: () => getAdvisees(user.id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6">
        <PageHeader
          title="Advisees"
          description="Your students and whether they have a registration waiting on your decision."
        />
        <AdviseesView adviserId={user.id} />
      </div>
    </HydrationBoundary>
  );
}
