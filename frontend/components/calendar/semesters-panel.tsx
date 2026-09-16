'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { DangerConfirm } from '@/components/shared/danger-confirm';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SemesterFormDialog } from '@/components/calendar/semester-form-dialog';
import { SemesterWindowsDialog } from '@/components/calendar/semester-windows-dialog';
import { useSemesters, useSessions, useSetCurrentSemester } from '@/hooks/use-calendar';
import type { Semester } from '@/types/calendar';

const ALL = '__all__';

function formatDate(value?: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleString('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function SemestersPanel() {
  const [sessionId, setSessionId] = useState<string>(ALL);
  const filterId = sessionId === ALL ? undefined : sessionId;
  const { data, isLoading, isError, refetch } = useSemesters(filterId);
  const { data: sessionsData } = useSessions();
  const setCurrentSemester = useSetCurrentSemester();
  const [target, setTarget] = useState<Semester | null>(null);

  const semesters = data?.data ?? [];
  const sessions = sessionsData?.data ?? [];

  const handleSetCurrent = async () => {
    if (!target) return;
    const result = await setCurrentSemester.mutateAsync(target.id);
    if (!result.data) {
      toast.error(result.message || 'Failed to set the current semester.');
      return;
    }
    toast.success(
      `"${target.session?.name} ${target.name}" is now the current semester.`,
    );
    setTarget(null);
  };

  const columns: DataTableColumn<Semester>[] = [
    {
      key: 'session',
      header: 'Session',
      cell: (row) => row.session?.name ?? '-',
    },
    {
      key: 'name',
      header: 'Semester',
      cell: (row) => (row.name === 'first' ? 'First' : 'Second'),
    },
    {
      key: 'windows',
      header: 'Registration window',
      cell: (row) => (
        <span className="text-sm">
          {formatDate(row.registrationOpensAt)} &rarr;{' '}
          {formatDate(row.registrationClosesAt)}
        </span>
      ),
    },
    {
      key: 'addDrop',
      header: 'Add/drop closes',
      cell: (row) => (
        <span className="text-sm">{formatDate(row.addDropClosesAt)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => (
        <div className="flex flex-col gap-1">
          {row.isCurrent ? <Badge>Current</Badge> : null}
          {row.lockedAt ? <Badge variant="destructive">Locked</Badge> : null}
        </div>
      ),
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
          <SemesterWindowsDialog
            semester={row}
            trigger={
              <Button variant="outline" size="sm">
                Edit windows
              </Button>
            }
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="w-56">
          <Select value={sessionId} onValueChange={setSessionId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All sessions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All sessions</SelectItem>
              {sessions.map((session) => (
                <SelectItem key={session.id} value={session.id}>
                  {session.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <SemesterFormDialog
          defaultSessionId={filterId}
          trigger={<Button>New semester</Button>}
        />
      </div>
      <DataTable
        columns={columns}
        rows={semesters}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        isError={isError}
        errorMessage={data?.message}
        onRetry={() => refetch()}
        emptyTitle="No semesters yet"
        emptyDescription="Create a semester under a session to open its registration window."
      />
      <DangerConfirm
        open={!!target}
        onOpenChange={(open) => !open && setTarget(null)}
        title="Set this as the current semester?"
        consequence={
          target ? (
            <>
              &ldquo;{target.session?.name} {target.name}&rdquo; will become
              the current semester, system-wide.
            </>
          ) : (
            ''
          )
        }
        impact={
          <>
            Every other semester&rsquo;s current flag is cleared. This
            changes which semester the registration flow, dashboards and
            reports resolve as &ldquo;current&rdquo; for everyone.
          </>
        }
        confirmText="Set current semester"
        cancelText="Cancel"
        loading={setCurrentSemester.isPending}
        onConfirm={handleSetCurrent}
      />
    </div>
  );
}
