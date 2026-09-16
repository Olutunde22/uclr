import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { getQueryClient } from '@/app/get-query-client';
import { NoAccess } from '@/components/shared/no-access';
import { CreateUserForm } from '@/components/admin/users/create-user-form';
import { departmentsKeys, usersKeys } from '@/hooks/keys';
import { canAccess } from '@/lib/page-access';
import { PERMISSIONS } from '@/lib/permissions';
import { getDepartments } from '@/services/academics';
import { getUsers } from '@/services/users';
import { PageHeader } from '@/components/shared/page-header';

export const metadata: Metadata = {
  title: 'Create user',
  description: 'Create a ULCRS account',
  robots: 'noindex, nofollow',
};

const ADVISER_FILTERS = { role: 'academic_adviser', isActive: true, pageSize: 200 };

export default async function NewUserPage() {
  if (!(await canAccess(PERMISSIONS.USERS_MANAGE))) {
    return <NoAccess />;
  }

  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: departmentsKeys.list(undefined),
      queryFn: () => getDepartments(),
    }),
    queryClient.prefetchQuery({
      queryKey: usersKeys.list(ADVISER_FILTERS),
      queryFn: () => getUsers(ADVISER_FILTERS),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="max-w-2xl space-y-6">
        <PageHeader
          title="Create user"
          description="Assign roles first - the profile fields you need appear below."
        />
        <CreateUserForm />
      </div>
    </HydrationBoundary>
  );
}
