import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { getQueryClient } from '@/app/get-query-client';
import { NoAccess } from '@/components/shared/no-access';
import { DepartmentReportView } from '@/components/reports/department-report-view';
import { calendarKeys, departmentsKeys } from '@/hooks/keys';
import { canAccess } from '@/lib/page-access';
import { PERMISSIONS } from '@/lib/permissions';
import { getSession } from '@/lib/session';
import { getSemesters } from '@/services/calendar';
import { getOwnDepartment } from '@/services/academics';

export const metadata: Metadata = {
  title: 'Department report',
  description: 'Registration counts by course, level and status',
  robots: 'noindex, nofollow',
};

// reports:read (shared with the admin's system report, split in the backend
// service, not the guard - backend/CLAUDE.md). Only `hod` and `system_admin`
// hold this key.
export default async function DepartmentReportPage() {
  if (!(await canAccess(PERMISSIONS.REPORTS_READ))) {
    return <NoAccess />;
  }

  const { data: user } = await getSession();
  const isAdmin = !!user?.roles.includes('system_admin');

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: calendarKeys.semestersList(undefined),
    queryFn: () => getSemesters(),
  });
  if (!isAdmin) {
    // Permission-less "my department" self-read (see services/academics.ts) -
    // an HOD needs no extra permission just to learn their own department id.
    await queryClient.prefetchQuery({
      queryKey: departmentsKeys.mine(),
      queryFn: () => getOwnDepartment(),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Department report</h1>
          <p className="text-muted-foreground text-sm">
            Registration counts by course, level and status for a semester.
          </p>
        </div>
        <DepartmentReportView isAdmin={isAdmin} />
      </div>
    </HydrationBoundary>
  );
}
