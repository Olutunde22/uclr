import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { getQueryClient } from '@/app/get-query-client';
import { NoAccess } from '@/components/shared/no-access';
import { StatusView } from '@/components/registration/status-view';
import { calendarKeys, registrationsKeys } from '@/hooks/keys';
import { canAccess } from '@/lib/page-access';
import { PERMISSIONS } from '@/lib/permissions';
import { getSemesters } from '@/services/calendar';
import { getOwnRegistration } from '@/services/registrations';
import { PageHeader } from '@/components/shared/page-header';

export const metadata: Metadata = {
  title: 'Registration status',
  description: 'Your registration status and approval trail',
  robots: 'noindex, nofollow',
};

export default async function RegistrationStatusPage() {
  if (!(await canAccess(PERMISSIONS.REGISTRATIONS_SUBMIT))) {
    return <NoAccess />;
  }

  const queryClient = getQueryClient();

  const semesters = await queryClient.fetchQuery({
    queryKey: calendarKeys.semesters(),
    queryFn: () => getSemesters(),
  });
  const currentSemester = (semesters.data ?? []).find((s) => s.isCurrent);

  await queryClient.prefetchQuery({
    queryKey: registrationsKeys.own(currentSemester?.id),
    queryFn: () => getOwnRegistration(currentSemester?.id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6">
        <PageHeader
          title="Registration status"
          description="Your current status and the adviser/HOD approval trail."
        />
        <StatusView />
      </div>
    </HydrationBoundary>
  );
}
