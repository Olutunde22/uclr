'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { useAdvisees } from '@/hooks/use-approvals';
import type { AdviseeSummary } from '@/services/approvals';

interface AdviseesViewProps {
  adviserId: string;
}

// PLAN.md's `/advisees`: "students needing attention". As documented on
// services/approvals.ts's getAdvisees, only "pending your decision right
// now" is actually derivable from any endpoint an adviser can call - there is
// no way to see an advisee's draft/rejected/not-yet-submitted status outside
// the adviser-queue. This shows the full roster with that one honest signal,
// rather than guessing at "not submitted" or "rejected" from data that
// doesn't exist.
export function AdviseesView({ adviserId }: AdviseesViewProps) {
  const { data, isLoading, isError, refetch } = useAdvisees(adviserId);
  const rows = data?.data ?? [];

  const columns: DataTableColumn<AdviseeSummary>[] = [
    {
      key: 'name',
      header: 'Name',
      cell: (a) => `${a.firstName} ${a.lastName}`,
    },
    { key: 'matric', header: 'Matric no.', cell: (a) => a.matricNo },
    {
      key: 'department',
      header: 'Department',
      cell: (a) => a.department?.code ?? '-',
    },
    { key: 'level', header: 'Level', cell: (a) => a.level },
    {
      key: 'status',
      header: 'Status',
      cell: (a) =>
        a.pendingYourDecision ? (
          <Badge>Pending your decision</Badge>
        ) : (
          <span className="text-muted-foreground text-sm">No pending action</span>
        ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      cell: (a) =>
        a.pendingRegistrationId ? (
          <Button asChild size="sm" variant="outline">
            <Link href={`/approvals/${a.pendingRegistrationId}`}>Review</Link>
          </Button>
        ) : null,
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      rowKey={(a) => a.id}
      isLoading={isLoading}
      isError={isError}
      errorMessage={data?.message}
      onRetry={() => refetch()}
      emptyTitle="No advisees found"
      emptyDescription="No student has you assigned as their academic adviser yet."
    />
  );
}
