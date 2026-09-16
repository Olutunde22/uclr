import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { getQueryClient } from '@/app/get-query-client';
import { NoAccess } from '@/components/shared/no-access';
import { SystemReportView } from '@/components/reports/system-report-view';
import { calendarKeys, reportsKeys } from '@/hooks/keys';
import { canAccess } from '@/lib/page-access';
import { PERMISSIONS } from '@/lib/permissions';
import { getSession } from '@/lib/session';
import { getSemesters } from '@/services/calendar';
import { getSystemReport } from '@/services/reports';
import { PageHeader } from '@/components/shared/page-header';

export const metadata: Metadata = {
  title: 'System reports',
  description: 'Login totals and registration totals across ULCRS',
  robots: 'noindex, nofollow',
};

// reports:read gates the route, but ReportsService.systemReport explicitly
// rejects anyone but system_admin (backend/CLAUDE.md - the two reports share
// one permission key, split in the service). A HOD who also holds
// reports:read for /department/report would otherwise pass this page's
// guard and only find out via a 403 on the fetch - checked explicitly here
// instead so they see NoAccess up front.
export default async function AdminReportsPage() {
  if (!(await canAccess(PERMISSIONS.REPORTS_READ))) {
    return <NoAccess />;
  }
  const { data: user } = await getSession();
  if (!user?.roles.includes('system_admin')) {
    return <NoAccess />;
  }

  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: calendarKeys.semestersList(undefined),
      queryFn: () => getSemesters(),
    }),
    queryClient.prefetchQuery({
      queryKey: reportsKeys.system(undefined),
      queryFn: () => getSystemReport(undefined),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6">
        <PageHeader
          title="System reports"
          description="Login activity and registration totals across the whole system."
        />
        <SystemReportView />
      </div>
    </HydrationBoundary>
  );
}
