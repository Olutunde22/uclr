import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { getQueryClient } from '@/app/get-query-client';
import { NoAccess } from '@/components/shared/no-access';
import { EmptyState } from '@/components/ui/empty-state';
import { CoursesListView } from '@/components/department-courses/courses-list-view';
import { coursesKeys } from '@/hooks/keys';
import { canAccess } from '@/lib/page-access';
import { PERMISSIONS } from '@/lib/permissions';
import { getSession } from '@/lib/session';
import { getCourses } from '@/services/courses';

export const metadata: Metadata = {
  title: 'Department courses',
  description: 'Manage your department’s courses, prerequisites and timetable',
  robots: 'noindex, nofollow',
};

export default async function DepartmentCoursesPage() {
  if (!(await canAccess(PERMISSIONS.COURSES_MANAGE))) {
    return <NoAccess />;
  }

  const { data: user } = await getSession();
  const isAdmin = !!user?.roles.includes('system_admin');

  const queryClient = getQueryClient();

  if (isAdmin) {
    await queryClient.prefetchQuery({
      queryKey: coursesKeys.list({}),
      queryFn: () => getCourses({}),
    });

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <div className="space-y-6">
          <Header />
          <CoursesListView isAdmin />
        </div>
      </HydrationBoundary>
    );
  }

  // A pure HOD has no endpoint that returns "my department" directly (see
  // frontend/CLAUDE.md's "HOD department resolution" note) — GET
  // /academics/departments needs academics:manage, which the `hod` role
  // isn't seeded with. Instead, derive it from the one endpoint an HOD *can*
  // call unfiltered (GET /courses, courses:manage) by matching
  // department.hodId to the caller. Real seed data guarantees at least one
  // course in the HOD's department; a brand-new department with zero courses
  // can't be discovered this way (documented limitation, not fixed here).
  const all = await getCourses({});
  const mine = (all.data ?? []).find((c) => c.department?.hodId === user?.id);
  const hodDepartment = mine?.department ?? null;

  if (!hodDepartment) {
    return (
      <div className="space-y-6">
        <Header />
        <EmptyState
          title="Couldn't determine your department"
          description="No course in your department was found to identify it from. Ask the ICT admin to check your department's HOD assignment."
        />
      </div>
    );
  }

  await queryClient.prefetchQuery({
    queryKey: coursesKeys.list({ departmentId: hodDepartment.id }),
    queryFn: () => getCourses({ departmentId: hodDepartment.id }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6">
        <Header />
        <CoursesListView hodDepartment={hodDepartment} />
      </div>
    </HydrationBoundary>
  );
}

function Header() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Department courses</h1>
      <p className="text-muted-foreground text-sm">
        Create and manage courses, prerequisites, timetable slots and
        lecturer assignment.
      </p>
    </div>
  );
}
