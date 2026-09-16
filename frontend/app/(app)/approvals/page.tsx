import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { getQueryClient } from '@/app/get-query-client';
import { NoAccess } from '@/components/shared/no-access';
import { ApprovalsQueueView } from '@/components/approvals/approvals-queue-view';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { approvalsKeys } from '@/hooks/keys';
import { canAccess } from '@/lib/page-access';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { getSession } from '@/lib/session';
import { getAdviserQueue, getHodQueue } from '@/services/approvals';

export const metadata: Metadata = {
  title: 'Approvals',
  description: 'Registrations waiting on your decision',
  robots: 'noindex, nofollow',
};

export default async function ApprovalsPage() {
  if (!(await canAccess(PERMISSIONS.APPROVALS_ADVISER, PERMISSIONS.APPROVALS_HOD))) {
    return <NoAccess />;
  }

  const { data: user } = await getSession();
  const isAdviser = hasPermission(user?.permissions, PERMISSIONS.APPROVALS_ADVISER);
  const isHod = hasPermission(user?.permissions, PERMISSIONS.APPROVALS_HOD);

  const queryClient = getQueryClient();
  if (isAdviser) {
    await queryClient.prefetchQuery({
      queryKey: approvalsKeys.adviserQueue(),
      queryFn: () => getAdviserQueue(),
    });
  }
  if (isHod) {
    await queryClient.prefetchQuery({
      queryKey: approvalsKeys.hodQueue(),
      queryFn: () => getHodQueue(),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Approvals</h1>
          <p className="text-muted-foreground text-sm">
            Registrations waiting on your decision.
          </p>
        </div>
        {isAdviser && isHod ? (
          <Tabs defaultValue="adviser">
            <TabsList>
              <TabsTrigger value="adviser">Advisees</TabsTrigger>
              <TabsTrigger value="hod">Department</TabsTrigger>
            </TabsList>
            <TabsContent value="adviser" className="pt-4">
              <ApprovalsQueueView role="adviser" />
            </TabsContent>
            <TabsContent value="hod" className="pt-4">
              <ApprovalsQueueView role="hod" />
            </TabsContent>
          </Tabs>
        ) : isHod ? (
          <ApprovalsQueueView role="hod" />
        ) : (
          <ApprovalsQueueView role="adviser" />
        )}
      </div>
    </HydrationBoundary>
  );
}
