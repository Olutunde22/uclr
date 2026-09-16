import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { getQueryClient } from '@/app/get-query-client';
import { NoAccess } from '@/components/shared/no-access';
import { AcademicsView } from '@/components/admin/academics/academics-view';
import { departmentsKeys, facultiesKeys } from '@/hooks/keys';
import { canAccess } from '@/lib/page-access';
import { PERMISSIONS } from '@/lib/permissions';
import { getDepartments, getFaculties } from '@/services/academics';

export const metadata: Metadata = {
  title: 'Academics',
  description: 'Manage faculties, departments and HOD assignment',
  robots: 'noindex, nofollow',
};

export default async function AdminAcademicsPage() {
  if (!(await canAccess(PERMISSIONS.ACADEMICS_MANAGE))) {
    return <NoAccess />;
  }

  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: facultiesKeys.list(),
      queryFn: () => getFaculties(),
    }),
    queryClient.prefetchQuery({
      queryKey: departmentsKeys.list(undefined),
      queryFn: () => getDepartments(),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Academics</h1>
          <p className="text-muted-foreground text-sm">
            Faculties, departments and HOD assignment.
          </p>
        </div>
        <AcademicsView />
      </div>
    </HydrationBoundary>
  );
}
