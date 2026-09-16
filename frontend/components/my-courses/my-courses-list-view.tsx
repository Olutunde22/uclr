'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { CapacityFormDialog } from '@/components/my-courses/capacity-form-dialog';
import { PrerequisitesDialog } from '@/components/my-courses/prerequisites-dialog';
import { useMyCourses } from '@/hooks/use-courses';
import type { Course } from '@/types/courses';

// GET /courses/mine, permission-less and self-scoped to `course.lecturerId
// === user.id` (backend/CLAUDE.md) — no filters needed, a lecturer's own
// course list is always small.
export function MyCoursesListView() {
  const { data, isLoading, isError, refetch } = useMyCourses();
  const courses = data?.data ?? [];

  const columns: DataTableColumn<Course>[] = [
    { key: 'code', header: 'Code', cell: (row) => row.code },
    { key: 'title', header: 'Title', cell: (row) => row.title },
    {
      key: 'department',
      header: 'Department',
      cell: (row) => row.department?.code ?? '—',
    },
    { key: 'level', header: 'Level', cell: (row) => row.level },
    {
      key: 'semester',
      header: 'Semester',
      cell: (row) => (row.semester === 'first' ? 'First' : 'Second'),
    },
    { key: 'capacity', header: 'Capacity', cell: (row) => row.capacity },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => (
        <Badge variant={row.isActive ? 'secondary' : 'destructive'}>
          {row.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      cell: (row) => (
        <div className="flex flex-wrap justify-end gap-2">
          <CapacityFormDialog
            course={row}
            trigger={
              <Button variant="outline" size="sm">
                Capacity
              </Button>
            }
          />
          <PrerequisitesDialog
            course={row}
            trigger={
              <Button variant="outline" size="sm">
                Prerequisites
              </Button>
            }
          />
          <Button asChild size="sm">
            <Link href={`/my-courses/${row.id}/class-list`}>Class list</Link>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={courses}
      rowKey={(row) => row.id}
      isLoading={isLoading}
      isError={isError}
      errorMessage={data?.message}
      onRetry={() => refetch()}
      emptyTitle="No courses assigned"
      emptyDescription="Ask your department's HOD to assign you as the lecturer on a course."
    />
  );
}
