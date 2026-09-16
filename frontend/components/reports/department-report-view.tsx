'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { DepartmentSelect } from '@/components/admin/users/department-select';
import { SemesterSelect } from '@/components/courses/semester-select';
import { useOwnDepartment } from '@/hooks/use-academics';
import { useSemesters } from '@/hooks/use-calendar';
import { useDepartmentReport } from '@/hooks/use-reports';
import type { DepartmentReportCourseRow } from '@/types/reports';

interface DepartmentReportViewProps {
  isAdmin: boolean;
}

function exportHref(semesterId: string, departmentId: string) {
  const base = process.env.NEXT_PUBLIC_API_URL ?? '';
  const params = new URLSearchParams({ semesterId, departmentId });
  return `${base}/department/report/export?${params.toString()}`;
}

export function DepartmentReportView({ isAdmin }: DepartmentReportViewProps) {
  const { data: semestersResult } = useSemesters();
  const { data: ownDepartmentResult } = useOwnDepartment();
  const [semesterId, setSemesterId] = useState<string | undefined>();
  const [departmentId, setDepartmentId] = useState<string | undefined>();

  useEffect(() => {
    if (semesterId) return;
    const current = semestersResult?.data?.find((s) => s.isCurrent);
    if (current) setSemesterId(current.id);
  }, [semestersResult, semesterId]);

  useEffect(() => {
    if (isAdmin || departmentId) return;
    if (ownDepartmentResult?.data) setDepartmentId(ownDepartmentResult.data.id);
  }, [isAdmin, departmentId, ownDepartmentResult]);

  const { data, isLoading, isError, refetch } = useDepartmentReport(
    semesterId,
    isAdmin ? departmentId : undefined,
  );
  const report = data?.data;

  if (!isAdmin && ownDepartmentResult && !ownDepartmentResult.data) {
    return (
      <EmptyState
        title="You are not the HOD of any department"
        description="Ask the ICT admin to check your department's HOD assignment."
      />
    );
  }

  const columns: DataTableColumn<DepartmentReportCourseRow>[] = [
    { key: 'code', header: 'Course', cell: (r) => r.code },
    { key: 'title', header: 'Title', cell: (r) => r.title },
    { key: 'level', header: 'Level', cell: (r) => r.level },
    { key: 'draft', header: 'Draft', cell: (r) => r.counts.draft },
    {
      key: 'pending_adviser',
      header: 'Pending adviser',
      cell: (r) => r.counts.pending_adviser,
    },
    { key: 'pending_hod', header: 'Pending HOD', cell: (r) => r.counts.pending_hod },
    { key: 'approved', header: 'Approved', cell: (r) => r.counts.approved },
    { key: 'rejected', header: 'Rejected', cell: (r) => r.counts.rejected },
    { key: 'finalised', header: 'Finalised', cell: (r) => r.counts.finalised },
    { key: 'total', header: 'Total', cell: (r) => r.total },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-full sm:w-64">
            <SemesterSelect value={semesterId} onChange={setSemesterId} />
          </div>
          {isAdmin ? (
            <div className="w-full sm:w-64">
              <DepartmentSelect value={departmentId} onChange={setDepartmentId} />
            </div>
          ) : null}
        </div>
        <Button
          asChild
          variant="outline"
          disabled={!semesterId || !(isAdmin ? departmentId : report?.departmentId)}
        >
          <a
            href={
              semesterId && (isAdmin ? departmentId : report?.departmentId)
                ? exportHref(
                    semesterId,
                    (isAdmin ? departmentId : report?.departmentId) as string,
                  )
                : undefined
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            Export CSV
          </a>
        </Button>
      </div>

      {report ? (
        <Card>
          <CardHeader>
            <CardTitle>{report.departmentName}</CardTitle>
            <CardDescription>
              Totals across every course this semester
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge variant="secondary">{report.totals.total} total</Badge>
            <Badge variant="outline">{report.totals.draft} draft</Badge>
            <Badge variant="outline">
              {report.totals.pending_adviser} pending adviser
            </Badge>
            <Badge variant="outline">{report.totals.pending_hod} pending HOD</Badge>
            <Badge variant="outline">{report.totals.approved} approved</Badge>
            <Badge variant="outline">{report.totals.rejected} rejected</Badge>
            <Badge variant="outline">{report.totals.finalised} finalised</Badge>
          </CardContent>
        </Card>
      ) : null}

      {!semesterId || (isAdmin && !departmentId) ? (
        <EmptyState
          title={!semesterId ? 'Select a semester' : 'Select a department'}
          description="Pick a semester (and department) to see the report."
        />
      ) : isError ? (
        <ErrorState message={data?.message} onRetry={() => refetch()} />
      ) : (
        <DataTable
          columns={columns}
          rows={report?.courses ?? []}
          rowKey={(r) => r.courseId}
          isLoading={isLoading}
          emptyTitle="No registrations found"
          emptyDescription="No registration includes a course in this department for the selected semester."
        />
      )}
    </div>
  );
}
