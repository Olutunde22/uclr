import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { getQueryClient } from '@/app/get-query-client';
import { ClassListView } from '@/components/my-courses/class-list-view';
import { calendarKeys } from '@/hooks/keys';
import { requireSession } from '@/lib/route-access';
import { getSemesters } from '@/services/calendar';
import { PageHeader } from '@/components/shared/page-header';

interface ClassListPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Class list',
  description: "Roster for one of your own courses",
  robots: 'noindex, nofollow',
};

// Permission-less, like /my-courses (backend/CLAUDE.md: GET
// /courses/:id/class-list has no @RequirePermissions, only own-course/HOD-
// of-department/system_admin scoping inside CoursesService.assertCanView
// ClassList). The real guard is the backend 403 a non-owning lecturer gets;
// this page just needs someone logged in.
export default async function ClassListPage({ params }: ClassListPageProps) {
  const { id } = await params;
  await requireSession();

  const queryClient = getQueryClient();
  // GET /calendar/semesters is permission-less reference data (backend/
  // CLAUDE.md's calendar module notes) — prefetched so the semester select
  // has real data immediately rather than a loading flash.
  await queryClient.prefetchQuery({
    queryKey: calendarKeys.semestersList(undefined),
    queryFn: () => getSemesters(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6">
        <PageHeader
          title="Class list"
          description="Students with an approved or finalised registration for this course in the selected semester."
        />
        <ClassListView courseId={id} />
      </div>
    </HydrationBoundary>
  );
}
