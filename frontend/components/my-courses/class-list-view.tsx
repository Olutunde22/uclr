'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { SemesterSelect } from '@/components/courses/semester-select';
import { useSemesters } from '@/hooks/use-calendar';
import { useClassList } from '@/hooks/use-courses';
import type { ClassListRow } from '@/types/courses';

interface ClassListViewProps {
  courseId: string;
}

// CSV export follows backend/CLAUDE.md's convention (`toCsv`, `@Res()
// res: Response` bypassing the JSON envelope): the export route is a plain
// authenticated GET, so a same-tab-opening anchor works exactly like a normal
// file download — the browser attaches the httpOnly session cookies itself
// (sameSite: 'lax' allows a top-level GET navigation to carry them, see
// lib/auth-cookies.ts) with no token ever touching JS. There is no earlier
// CSV export UI in this codebase to match (the other CSV-producing routes —
// records, department/system reports — are milestone 13's frontend, not
// built yet); this is that pattern's first frontend instance.
function exportHref(courseId: string, semesterId: string): string {
  const base = process.env.NEXT_PUBLIC_API_URL ?? '';
  return `${base}/courses/${courseId}/class-list/export?semesterId=${semesterId}`;
}

export function ClassListView({ courseId }: ClassListViewProps) {
  const { data: semestersResult } = useSemesters();
  const [semesterId, setSemesterId] = useState<string | undefined>();

  // Default to the current semester once it's loaded, without fighting a
  // manual pick made in the meantime.
  useEffect(() => {
    if (semesterId) return;
    const current = semestersResult?.data?.find((s) => s.isCurrent);
    if (current) setSemesterId(current.id);
  }, [semestersResult, semesterId]);

  const { data, isLoading, isError, refetch } = useClassList(courseId, semesterId);
  const rows = data?.data ?? [];

  const columns: DataTableColumn<ClassListRow>[] = [
    { key: 'matricNo', header: 'Matric no.', cell: (row) => row.matricNo },
    { key: 'name', header: 'Name', cell: (row) => row.name },
    { key: 'level', header: 'Level', cell: (row) => row.level },
    { key: 'programme', header: 'Programme', cell: (row) => row.programme },
    { key: 'department', header: 'Department', cell: (row) => row.department },
    {
      key: 'registrationStatus',
      header: 'Status',
      cell: (row) => row.registrationStatus,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="w-full sm:w-64">
          <SemesterSelect value={semesterId} onChange={setSemesterId} />
        </div>
        <Button asChild variant="outline" disabled={!semesterId}>
          <a
            href={semesterId ? exportHref(courseId, semesterId) : undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!semesterId}
          >
            Export CSV
          </a>
        </Button>
      </div>

      {!semesterId ? (
        <EmptyState
          title="Select a semester"
          description="Pick a semester to see who is registered for this course."
        />
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(row) => row.studentId}
          isLoading={isLoading}
          isError={isError}
          errorMessage={data?.message}
          onRetry={() => refetch()}
          emptyTitle="No students registered"
          emptyDescription="No approved or finalised registration includes this course for the selected semester."
        />
      )}
    </div>
  );
}
