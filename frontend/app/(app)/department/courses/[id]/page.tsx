import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { getQueryClient } from '@/app/get-query-client';
import { NoAccess } from '@/components/shared/no-access';
import { CourseDetailView } from '@/components/department-courses/course-detail-view';
import { coursesKeys } from '@/hooks/keys';
import { canAccess } from '@/lib/page-access';
import { PERMISSIONS } from '@/lib/permissions';
import { getCourse } from '@/services/courses';
import { PageHeader } from '@/components/shared/page-header';

interface CourseDetailPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Course',
  description: 'Edit a course, its prerequisites, timetable and lecturer',
  robots: 'noindex, nofollow',
};

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { id } = await params;

  if (!(await canAccess(PERMISSIONS.COURSES_MANAGE))) {
    return <NoAccess />;
  }

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: coursesKeys.detail(id),
    queryFn: () => getCourse(id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="max-w-3xl space-y-6">
        <PageHeader
          title="Course"
          description="Details, prerequisites, timetable slots and lecturer assignment."
        />
        <CourseDetailView courseId={id} />
      </div>
    </HydrationBoundary>
  );
}
