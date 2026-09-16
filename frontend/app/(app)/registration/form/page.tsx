import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { getQueryClient } from '@/app/get-query-client';
import { NoAccess } from '@/components/shared/no-access';
import { CourseFormView } from '@/components/registration/course-form-view';
import { authKeys, calendarKeys, registrationsKeys } from '@/hooks/keys';
import { canAccess } from '@/lib/page-access';
import { PERMISSIONS } from '@/lib/permissions';
import { getMe } from '@/services/auth';
import { getSemesters } from '@/services/calendar';
import { getOwnRegistration } from '@/services/registrations';

export const metadata: Metadata = {
  title: 'Course form',
  description: 'Printable course registration form',
  robots: 'noindex, nofollow',
};

export default async function RegistrationFormPage() {
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
      queryKey: authKeys.session(),
      queryFn: () => getMe(),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6">
        <div className="no-print">
          <h1 className="text-2xl font-semibold">Course form</h1>
          <p className="text-muted-foreground text-sm">
            A printable copy of your approved course registration.
          </p>
        </div>
        <CourseFormView />
      </div>
    </HydrationBoundary>
  );
}
