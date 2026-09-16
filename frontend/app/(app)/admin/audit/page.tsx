import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { getQueryClient } from '@/app/get-query-client';
import { NoAccess } from '@/components/shared/no-access';
import { AuditLogView } from '@/components/admin/audit/audit-log-view';
import { auditKeys } from '@/hooks/keys';
import { canAccess } from '@/lib/page-access';
import { PERMISSIONS } from '@/lib/permissions';
import { getAuditLogs } from '@/services/audit';

export const metadata: Metadata = {
  title: 'Audit log',
  description: 'ULCRS audit trail',
  robots: 'noindex, nofollow',
};

const DEFAULT_FILTERS = { page: 1, pageSize: 25 };

export default async function AdminAuditPage() {
  if (!(await canAccess(PERMISSIONS.AUDIT_READ))) {
    return <NoAccess />;
  }

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: auditKeys.list(DEFAULT_FILTERS),
    queryFn: () => getAuditLogs(DEFAULT_FILTERS),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Audit log</h1>
          <p className="text-muted-foreground text-sm">
            Every mutation and permission denial, most recent first.
          </p>
        </div>
        <AuditLogView />
      </div>
    </HydrationBoundary>
  );
}
