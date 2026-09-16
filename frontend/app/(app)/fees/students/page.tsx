import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { getQueryClient } from '@/app/get-query-client';
import { NoAccess } from '@/components/shared/no-access';
import { FeesStudentsView } from '@/components/fees/students/fees-students-view';
import { calendarKeys, feesKeys } from '@/hooks/keys';
import { canAccess } from '@/lib/page-access';
import { PERMISSIONS } from '@/lib/permissions';
import { getSessions } from '@/services/calendar';
import { listPayments } from '@/services/fees';

export const metadata: Metadata = {
  title: 'Student fees',
  description: 'Search a student, record payments and manage clearance',
  robots: 'noindex, nofollow',
};

export default async function FeesStudentsPage() {
  if (!(await canAccess(PERMISSIONS.FEES_MANAGE))) {
    return <NoAccess />;
  }

  const queryClient = getQueryClient();
  await Promise.all([
    // Both prefetches back useFeeSessionOptions' primary/fallback session
    // source (hooks/use-fees.ts's doc comment) — calendarKeys.sessions()
    // 403s for a pure bursary_officer account (no calendar:manage) and
    // resolves with data: null rather than throwing, which the fallback
    // below reads around.
    queryClient.prefetchQuery({
      queryKey: calendarKeys.sessions(),
      queryFn: () => getSessions(),
    }),
    queryClient.prefetchQuery({
      queryKey: feesKeys.paymentsList({}),
      queryFn: () => listPayments({}),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Student fees</h1>
          <p className="text-muted-foreground text-sm">
            Search a student by matric no. to record a payment or manage
            their fee clearance.
          </p>
        </div>
        <FeesStudentsView />
      </div>
    </HydrationBoundary>
  );
}
