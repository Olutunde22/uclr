import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { getQueryClient } from '@/app/get-query-client';
import { NoAccess } from '@/components/shared/no-access';
import { CalendarView } from '@/components/calendar/calendar-view';
import { calendarKeys } from '@/hooks/keys';
import { canAccess } from '@/lib/page-access';
import { PERMISSIONS } from '@/lib/permissions';
import { getSemesters, getSessions } from '@/services/calendar';
import { PageHeader } from '@/components/shared/page-header';

export const metadata: Metadata = {
  title: 'Calendar',
  description: 'Manage academic sessions, semesters and registration windows',
  robots: 'noindex, nofollow',
};

export default async function CalendarPage() {
  if (!(await canAccess(PERMISSIONS.CALENDAR_MANAGE))) {
    return <NoAccess />;
  }

  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: calendarKeys.sessions(),
      queryFn: () => getSessions(),
    }),
    queryClient.prefetchQuery({
      queryKey: calendarKeys.semestersList(undefined),
      queryFn: () => getSemesters(),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6">
        <PageHeader
          title="Calendar"
          description="Academic sessions, semesters and their registration and add/drop windows."
        />
        <CalendarView />
      </div>
    </HydrationBoundary>
  );
}
