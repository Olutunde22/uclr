import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { getQueryClient } from '@/app/get-query-client';
import { MyCoursesListView } from '@/components/my-courses/my-courses-list-view';
import { coursesKeys } from '@/hooks/keys';
import { requireSession } from '@/lib/route-access';
import { getMyCourses } from '@/services/courses';
import { PageHeader } from '@/components/shared/page-header';

export const metadata: Metadata = {
  title: 'My courses',
  description: 'Edit capacity and prerequisites of your assigned courses',
  robots: 'noindex, nofollow',
};

// Permission-less, matching the backend's "own courses" convention
// (backend/CLAUDE.md: GET /courses/mine has no @RequirePermissions, only
// self-scoping via CurrentUser) — this page just needs someone logged in,
// like the dashboard stub.
export default async function MyCoursesPage() {
  await requireSession();

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: coursesKeys.mine(),
    queryFn: () => getMyCourses(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6">
        <PageHeader
          title="My courses"
          description="Edit capacity and prerequisites, and view each course's class list."
        />
        <MyCoursesListView />
      </div>
    </HydrationBoundary>
  );
}
