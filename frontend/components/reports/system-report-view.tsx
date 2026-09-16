'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { ErrorState } from '@/components/ui/error-state';
import { SemesterSelect } from '@/components/courses/semester-select';
import { useSystemReport } from '@/hooks/use-reports';
import type { SystemReportRoleRow } from '@/types/reports';

function formatRole(role: string) {
  return role
    .split('_')
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ');
}

export function SystemReportView() {
  const [semesterId, setSemesterId] = useState<string | undefined>();
  const { data, isLoading, isError, refetch } = useSystemReport(semesterId);
  const report = data?.data;

  if (isError) {
    return <ErrorState message={data?.message} onRetry={() => refetch()} />;
  }

  const roleColumns: DataTableColumn<SystemReportRoleRow>[] = [
    { key: 'role', header: 'Role', cell: (r) => formatRole(r.role) },
    { key: 'total', header: 'Total users', cell: (r) => r.totalUsers },
    { key: 'loggedIn', header: 'Ever logged in', cell: (r) => r.everLoggedIn },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total users</CardDescription>
            <CardTitle className="text-2xl">
              {report?.logins.totalUsers ?? '-'}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ever logged in</CardDescription>
            <CardTitle className="text-2xl">
              {report?.logins.usersEverLoggedIn ?? '-'}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Logged in, last 7 days</CardDescription>
            <CardTitle className="text-2xl">
              {report?.logins.usersLoggedInLast7Days ?? '-'}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Logged in, last 30 days</CardDescription>
            <CardTitle className="text-2xl">
              {report?.logins.usersLoggedInLast30Days ?? '-'}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users by role</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={roleColumns}
            rows={report?.logins.byRole ?? []}
            rowKey={(r) => r.role}
            isLoading={isLoading}
            emptyTitle="No roles found"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registration totals</CardTitle>
          <CardDescription>
            Optionally restrict to one semester, or leave blank for all.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="w-full sm:w-64">
            <SemesterSelect
              value={semesterId}
              onChange={setSemesterId}
              placeholder="All semesters"
            />
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <span>Draft: {report?.registrations.counts.draft ?? 0}</span>
            <span>
              Pending adviser: {report?.registrations.counts.pending_adviser ?? 0}
            </span>
            <span>Pending HOD: {report?.registrations.counts.pending_hod ?? 0}</span>
            <span>Approved: {report?.registrations.counts.approved ?? 0}</span>
            <span>Rejected: {report?.registrations.counts.rejected ?? 0}</span>
            <span>Finalised: {report?.registrations.counts.finalised ?? 0}</span>
            <span className="font-medium">
              Total: {report?.registrations.total ?? 0}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
