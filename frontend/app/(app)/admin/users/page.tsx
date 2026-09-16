import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { getQueryClient } from '@/app/get-query-client';
import { NoAccess } from '@/components/shared/no-access';
import { UsersListView } from '@/components/admin/users/users-list-view';
import { departmentsKeys, usersKeys } from '@/hooks/keys';
import { canAccess } from '@/lib/page-access';
import { PERMISSIONS } from '@/lib/permissions';
import { getUsers } from '@/services/users';
import { getDepartments } from '@/services/academics';
import { PageHeader } from '@/components/shared/page-header';

export const metadata: Metadata = {
  title: 'Users',
  description: 'Create, edit and disable ULCRS accounts',
  robots: 'noindex, nofollow',
};

const DEFAULT_FILTERS = { page: 1, pageSize: 20 };

export default async function AdminUsersPage() {
  if (!(await canAccess(PERMISSIONS.USERS_MANAGE))) {
    return <NoAccess />;
  }

  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: usersKeys.list(DEFAULT_FILTERS),
      queryFn: () => getUsers(DEFAULT_FILTERS),
    }),
    queryClient.prefetchQuery({
      queryKey: departmentsKeys.list(undefined),
      queryFn: () => getDepartments(),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6">
        <PageHeader
          title="Users"
          description="Create and manage student, staff and admin accounts."
        />
        <UsersListView />
      </div>
    </HydrationBoundary>
  );
}
