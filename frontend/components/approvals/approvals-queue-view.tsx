'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { useAdviserQueue, useHodQueue } from '@/hooks/use-approvals';
import type { Registration } from '@/types/registrations';

interface ApprovalsQueueViewProps {
  role: 'adviser' | 'hod';
}

function formatDate(value?: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleString();
}

// Shared between the adviser and HOD queues (milestone 12 brief: "reuse a
// shared component with a role-driven data source" rather than duplicating a
// whole page) — the two queues have the identical Registration[] shape, just
// sourced from different endpoints and scoped differently server-side.
export function ApprovalsQueueView({ role }: ApprovalsQueueViewProps) {
  const adviserQuery = useAdviserQueue();
  const hodQuery = useHodQueue();
  const { data, isLoading, isError, refetch } =
    role === 'adviser' ? adviserQuery : hodQuery;

  const rows = data?.data ?? [];

  const columns: DataTableColumn<Registration>[] = [
    {
      key: 'student',
      header: 'Student',
      cell: (r) =>
        r.student ? `${r.student.firstName} ${r.student.lastName}` : '-',
    },
    {
      key: 'email',
      header: 'Email',
      cell: (r) => r.student?.email ?? '-',
    },
    {
      key: 'courses',
      header: 'Courses',
      cell: (r) => r.courses.length,
    },
    {
      key: 'units',
      header: 'Units',
      cell: (r) => r.totalUnits,
    },
    {
      key: 'submitted',
      header: 'Submitted',
      cell: (r) => formatDate(r.submittedAt),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      cell: (r) => (
        <Button asChild size="sm" variant="outline">
          <Link href={`/approvals/${r.id}`}>Review</Link>
        </Button>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      rowKey={(r) => r.id}
      isLoading={isLoading}
      isError={isError}
      errorMessage={data?.message}
      onRetry={() => refetch()}
      emptyTitle="Nothing pending"
      emptyDescription={
        role === 'adviser'
          ? "None of your advisees have a registration waiting on your decision."
          : 'No registration in your department is waiting on your decision.'
      }
    />
  );
}
