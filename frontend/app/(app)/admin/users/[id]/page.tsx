import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { getQueryClient } from '@/app/get-query-client';
import { NoAccess } from '@/components/shared/no-access';
import { EditUserView } from '@/components/admin/users/edit-user-view';
import { departmentsKeys, usersKeys } from '@/hooks/keys';
import { canAccess } from '@/lib/page-access';
import { PERMISSIONS } from '@/lib/permissions';
import { getDepartments } from '@/services/academics';
import { getUser, getUsers } from '@/services/users';
import { PageHeader } from '@/components/shared/page-header';

interface EditUserPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Edit user',
  description: 'Edit a ULCRS account',
  robots: 'noindex, nofollow',
};

const ADVISER_FILTERS = { role: 'academic_adviser', isActive: true, pageSize: 200 };

export default async function EditUserPage({ params }: EditUserPageProps) {
  const { id } = await params;

  if (!(await canAccess(PERMISSIONS.USERS_MANAGE))) {
    return <NoAccess />;
  }

  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: usersKeys.detail(id),
      queryFn: () => getUser(id),
    }),
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
          title="Edit user"
          description="Update details, roles and profile."
        />
        <EditUserView userId={id} />
      </div>
    </HydrationBoundary>
  );
}
