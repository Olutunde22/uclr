'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { useAuditLogs } from '@/hooks/use-audit';
import type { AuditLog } from '@/types/audit';

const PAGE_SIZE = 25;

function outcomeVariant(outcome: string): 'secondary' | 'destructive' | 'outline' {
  if (outcome === 'success') return 'secondary';
  if (outcome === 'denied' || outcome === 'error') return 'destructive';
  return 'outline';
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

// Read-only (audit:read has no mutations) - filterable by action/resourceType
// since that is all GET /audit's controller accepts as query params.
export function AuditLogView() {
  const [action, setAction] = useState('');
  const [resourceType, setResourceType] = useState('');
  const [page, setPage] = useState(1);

  const filters = {
    action: action || undefined,
    resourceType: resourceType || undefined,
    page,
    pageSize: PAGE_SIZE,
  };

  const { data, isLoading, isError, refetch } = useAuditLogs(filters);
  const paginated = data?.data;
  const rows = paginated?.items ?? [];
  const total = paginated?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const columns: DataTableColumn<AuditLog>[] = [
    {
      key: 'createdAt',
      header: 'When',
      cell: (row) => formatDate(row.createdAt),
    },
    {
      key: 'actor',
      header: 'Actor',
      cell: (row) => row.actorEmail ?? '-',
    },
    { key: 'action', header: 'Action', cell: (row) => row.action },
    {
      key: 'resource',
      header: 'Resource',
      cell: (row) =>
        row.resourceType
          ? `${row.resourceType}${row.resourceId ? ` (${row.resourceId.slice(0, 8)})` : ''}`
          : '-',
    },
    {
      key: 'outcome',
      header: 'Outcome',
      cell: (row) => (
        <Badge variant={outcomeVariant(row.outcome)}>{row.outcome}</Badge>
      ),
    },
    {
      key: 'summary',
      header: 'Summary',
      cell: (row) => row.summary ?? '-',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Filter by action, e.g. users.create"
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            setPage(1);
          }}
          className="w-64"
        />
        <Input
          placeholder="Filter by resource type, e.g. user"
          value={resourceType}
          onChange={(e) => {
            setResourceType(e.target.value);
            setPage(1);
          }}
          className="w-64"
        />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        isError={isError}
        errorMessage={data?.message}
        onRetry={() => refetch()}
        emptyTitle="No audit entries found"
        emptyDescription="Try clearing the filters above."
      />

      {totalPages > 1 ? (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-muted-foreground text-sm">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}
