'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { DangerConfirm } from '@/components/shared/danger-confirm';
import { SemesterSelect } from '@/components/courses/semester-select';
import { usePermissions } from '@/hooks/use-permissions';
import { useSemesters } from '@/hooks/use-calendar';
import { useFinaliseSemester, useRecords } from '@/hooks/use-records';
import { PERMISSIONS } from '@/lib/permissions';
import type { RecordListStatus, RecordRow } from '@/types/records';

// CSV export follows the pattern class-list-view.tsx established (a plain
// authenticated GET, cookies flow via a top-level <a> navigation — see
// backend/CLAUDE.md's toCsv/@Res() convention and that component's doc
// comment for why no fetch-and-blob is needed).
function exportHref(semesterId: string, status?: RecordListStatus) {
  const base = process.env.NEXT_PUBLIC_API_URL ?? '';
  const params = new URLSearchParams({ semesterId });
  if (status) params.set('status', status);
  return `${base}/records/export?${params.toString()}`;
}

export function RecordsView() {
  const { can } = usePermissions();
  const { data: semestersResult } = useSemesters();
  const [semesterId, setSemesterId] = useState<string | undefined>();
  const [status, setStatus] = useState<RecordListStatus | 'all'>('all');
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (semesterId) return;
    const current = semestersResult?.data?.find((s) => s.isCurrent);
    if (current) setSemesterId(current.id);
  }, [semestersResult, semesterId]);

  const filters = {
    semesterId: semesterId ?? '',
    status: status === 'all' ? undefined : status,
  };
  const { data, isLoading, isError, refetch } = useRecords(filters);
  const rows = data?.data ?? [];

  const finalise = useFinaliseSemester();

  const selectedSemester = semestersResult?.data?.find((s) => s.id === semesterId);
  const alreadyLocked = !!selectedSemester?.lockedAt;
  const semesterLabel = selectedSemester
    ? `${selectedSemester.session?.name ?? ''} ${selectedSemester.name}`.trim()
    : '';

  const handleFinalise = async () => {
    if (!semesterId) return;
    const result = await finalise.mutateAsync(semesterId);
    if (!result.data) {
      toast.error(result.message || 'Failed to finalise the semester.');
      return;
    }
    toast.success(
      `Finalised ${result.data.finalisedCount} registration(s). ${result.data.outstandingCount} left outstanding.`,
    );
    setConfirmOpen(false);
  };

  const columns: DataTableColumn<RecordRow>[] = [
    { key: 'matricNo', header: 'Matric no.', cell: (r) => r.matricNo },
    {
      key: 'name',
      header: 'Name',
      cell: (r) => (
        <Link
          href={`/records/transcripts/${r.studentId}`}
          className="underline underline-offset-2"
        >
          {r.studentName}
        </Link>
      ),
    },
    { key: 'department', header: 'Department', cell: (r) => r.department },
    { key: 'level', header: 'Level', cell: (r) => r.level },
    { key: 'programme', header: 'Programme', cell: (r) => r.programme },
    {
      key: 'courses',
      header: 'Courses',
      cell: (r) => r.courses.map((c) => c.code).join(', '),
    },
    { key: 'totalUnits', header: 'Units', cell: (r) => r.totalUnits },
    { key: 'status', header: 'Status', cell: (r) => r.status },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-full sm:w-64">
            <SemesterSelect value={semesterId} onChange={setSemesterId} />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as RecordListStatus | 'all')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Approved and finalised</SelectItem>
                <SelectItem value="approved">Approved only</SelectItem>
                <SelectItem value="finalised">Finalised only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="outline" disabled={!semesterId}>
            <a
              href={semesterId ? exportHref(semesterId, filters.status) : undefined}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!semesterId}
            >
              Export CSV
            </a>
          </Button>
          {can(PERMISSIONS.RECORDS_FINALISE) ? (
            <Button
              variant="destructive"
              disabled={!semesterId || alreadyLocked}
              onClick={() => setConfirmOpen(true)}
            >
              {alreadyLocked ? 'Already finalised' : 'Finalise semester'}
            </Button>
          ) : null}
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(r) => r.registrationId}
        isLoading={isLoading || !semesterId}
        isError={isError}
        errorMessage={data?.message}
        onRetry={() => refetch()}
        emptyTitle="No registrations found"
        emptyDescription="No approved or finalised registration exists for this semester and filter."
      />

      <DangerConfirm
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Finalise this semester?"
        consequence="Every approved registration becomes finalised and the semester is locked - no further submissions, decisions or add/drop changes will be possible."
        impact="This cannot be undone. Anything still in draft, pending or rejected is left outstanding, not finalised."
        confirmText="Finalise semester"
        confirmPhrase={semesterLabel}
        loading={finalise.isPending}
        onConfirm={handleFinalise}
      />
    </div>
  );
}
