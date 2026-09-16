'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { DangerConfirm } from '@/components/shared/danger-confirm';
import { SessionFormDialog } from '@/components/calendar/session-form-dialog';
import { useSessions, useSetCurrentSession } from '@/hooks/use-calendar';
import type { AcademicSession } from '@/types/calendar';

export function SessionsPanel() {
  const { data, isLoading, isError, refetch } = useSessions();
  const setCurrentSession = useSetCurrentSession();
  const [target, setTarget] = useState<AcademicSession | null>(null);

  const sessions = data?.data ?? [];

  const handleSetCurrent = async () => {
    if (!target) return;
    const result = await setCurrentSession.mutateAsync(target.id);
    if (!result.data) {
      toast.error(result.message || 'Failed to set the current session.');
      return;
    }
    toast.success(`"${target.name}" is now the current session.`);
    setTarget(null);
  };

  const columns: DataTableColumn<AcademicSession>[] = [
    { key: 'name', header: 'Session', cell: (row) => row.name },
    {
      key: 'status',
      header: 'Status',
      cell: (row) =>
        row.isCurrent ? <Badge>Current</Badge> : <span className="text-muted-foreground">-</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      cell: (row) => (
        <div className="flex justify-end gap-2">
          {!row.isCurrent ? (
            <Button variant="outline" size="sm" onClick={() => setTarget(row)}>
              Set current
            </Button>
          ) : null}
          <SessionFormDialog
            session={row}
            trigger={
              <Button variant="outline" size="sm">
                Edit
              </Button>
            }
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <SessionFormDialog trigger={<Button>New session</Button>} />
      </div>
      <DataTable
        columns={columns}
        rows={sessions}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        isError={isError}
        errorMessage={data?.message}
        onRetry={() => refetch()}
        emptyTitle="No academic sessions yet"
        emptyDescription="Create the first session to start scheduling semesters."
      />
      <DangerConfirm
        open={!!target}
        onOpenChange={(open) => !open && setTarget(null)}
        title="Set this as the current session?"
        consequence={
          target ? (
            <>
              &ldquo;{target.name}&rdquo; will become the current academic
              session, system-wide.
            </>
          ) : (
            ''
          )
        }
        impact={
          <>
            Every other session&rsquo;s current flag is cleared. This changes
            what dashboards, registration and reports resolve as
            &ldquo;current&rdquo; for everyone.
          </>
        }
        confirmText="Set current session"
        cancelText="Cancel"
        loading={setCurrentSession.isPending}
        onConfirm={handleSetCurrent}
      />
    </div>
  );
}
