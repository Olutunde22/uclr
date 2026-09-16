import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { getQueryClient } from '@/app/get-query-client';
import { NoAccess } from '@/components/shared/no-access';
import { RegistrationView } from '@/components/registration/registration-view';
import { calendarKeys, coursesKeys, registrationsKeys } from '@/hooks/keys';
import { canAccess } from '@/lib/page-access';
import { PERMISSIONS } from '@/lib/permissions';
import { getSemesters } from '@/services/calendar';
import { getCourses } from '@/services/courses';
import { getOwnRegistration } from '@/services/registrations';

export const metadata: Metadata = {
  title: 'Registration',
  description: 'Pick your courses, check the rules, and submit for approval',
  robots: 'noindex, nofollow',
};

export default async function RegistrationPage() {
  if (!(await canAccess(PERMISSIONS.REGISTRATIONS_SUBMIT))) {
    return <NoAccess />;
  }

  const queryClient = getQueryClient();

  const semesters = await queryClient.fetchQuery({
    queryKey: calendarKeys.semesters(),
    queryFn: () => getSemesters(),
  });
  const currentSemester = (semesters.data ?? []).find((s) => s.isCurrent);

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: registrationsKeys.own(currentSemester?.id),
      queryFn: () => getOwnRegistration(currentSemester?.id),
    }),
    queryClient.prefetchQuery({
      queryKey: coursesKeys.list(
        currentSemester ? { semester: currentSemester.name, isActive: true } : {},
      ),
      queryFn: () =>
        getCourses(
          currentSemester ? { semester: currentSemester.name, isActive: true } : {},
        ),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Registration</h1>
          <p className="text-muted-foreground text-sm">
            Pick your courses for the current semester. Every rule violation is shown
            as you go, so you can fix everything before you submit.
          </p>
        </div>
        <RegistrationView />
      </div>
    </HydrationBoundary>
  );
}
