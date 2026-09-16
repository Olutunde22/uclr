import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { getQueryClient } from '@/app/get-query-client';
import { NoAccess } from '@/components/shared/no-access';
import { RecordsView } from '@/components/records/records-view';
import { calendarKeys } from '@/hooks/keys';
import { canAccess } from '@/lib/page-access';
import { PERMISSIONS } from '@/lib/permissions';
import { getSemesters } from '@/services/calendar';

export const metadata: Metadata = {
  title: 'Records',
  description: 'Final registered list, finalise a semester, transcripts',
  robots: 'noindex, nofollow',
};

// records:read gates the list/transcript reads, records:finalise gates the
// finalise action itself (checked again client-side by the mutation, but the
// page only needs to know a caller can see SOMETHING here — the same
// "either capability opens the page" shape as /approvals).
export default async function RecordsPage() {
  if (
    !(await canAccess(PERMISSIONS.RECORDS_READ, PERMISSIONS.RECORDS_FINALISE))
  ) {
    return <NoAccess />;
  }

  const queryClient = getQueryClient();
  // GET /calendar/semesters is permission-less reference data (backend/
  // CLAUDE.md) — prefetched so the semester select has real data immediately.
  await queryClient.prefetchQuery({
    queryKey: calendarKeys.semestersList(undefined),
    queryFn: () => getSemesters(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Records</h1>
          <p className="text-muted-foreground text-sm">
            The final registered list for a semester. Finalising locks the
            semester and cannot be undone.
          </p>
        </div>
        <RecordsView />
      </div>
    </HydrationBoundary>
  );
}
