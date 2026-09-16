'use client';

import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { DangerConfirm } from '@/components/shared/danger-confirm';
import { DepartmentSelect } from '@/components/admin/users/department-select';
import { CourseFormDialog } from '@/components/department-courses/course-form-dialog';
import { useCourses, useUpdateCourse } from '@/hooks/use-courses';
import { COURSE_LEVELS, type Course } from '@/types/courses';
import type { Department } from '@/types/academics';

const ALL = '__all__';

interface CoursesListViewProps {
  isAdmin?: boolean;
  hodDepartment?: Department | null;
}

export function CoursesListView({ isAdmin, hodDepartment }: CoursesListViewProps) {
  const [departmentId, setDepartmentId] = useState<string>(ALL);
  const [level, setLevel] = useState<string>(ALL);
  const [semester, setSemester] = useState<string>(ALL);
  const [isActive, setIsActive] = useState<string>(ALL);
  const [target, setTarget] = useState<Course | null>(null);

  const effectiveDepartmentId = isAdmin
    ? departmentId === ALL
      ? undefined
      : departmentId
    : hodDepartment?.id;

  const filters = {
    departmentId: effectiveDepartmentId,
    level: level === ALL ? undefined : (Number(level) as (typeof COURSE_LEVELS)[number]),
    semester: semester === ALL ? undefined : (semester as 'first' | 'second'),
    isActive: isActive === ALL ? undefined : isActive === 'active',
  };

  const { data, isLoading, isError, refetch } = useCourses(filters);
  const updateCourse = useUpdateCourse();

  const courses = data?.data ?? [];

  const handleToggleActive = async () => {
    if (!target) return;
    const result = await updateCourse.mutateAsync({
      id: target.id,
      dto: { isActive: !target.isActive },
    });
    if (!result.data) {
      toast.error(result.message || 'Failed to update course status.');
      return;
    }
    toast.success(target.isActive ? 'Course deactivated.' : 'Course activated.');
    setTarget(null);
  };

  const columns: DataTableColumn<Course>[] = [
    {
      key: 'code',
      header: 'Code',
      cell: (row) => (
        <Link
          href={`/department/courses/${row.id}`}
          className="font-medium hover:underline"
        >
          {row.code}
        </Link>
      ),
    },
    { key: 'title', header: 'Title', cell: (row) => row.title },
    ...(isAdmin
      ? ([
          {
            key: 'department',
            header: 'Department',
            cell: (row: Course) => row.department?.code ?? '—',
          },
        ] as DataTableColumn<Course>[])
      : []),
    { key: 'level', header: 'Level', cell: (row) => row.level },
    {
      key: 'semester',
      header: 'Semester',
      cell: (row) => (row.semester === 'first' ? 'First' : 'Second'),
    },
    { key: 'capacity', header: 'Capacity', cell: (row) => row.capacity },
    {
      key: 'lecturer',
      header: 'Lecturer',
      cell: (row) =>
        row.lecturer ? `${row.lecturer.firstName} ${row.lecturer.lastName}` : (
          <span className="text-muted-foreground">Unassigned</span>
        ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => (
        <StatusBadge tone={row.isActive ? 'success' : 'destructive'}>
          {row.isActive ? 'Active' : 'Inactive'}
        </StatusBadge>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      cell: (row) => (
        <div className="flex justify-end gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/department/courses/${row.id}`}>Manage</Link>
          </Button>
          <Button
            variant={row.isActive ? 'destructive' : 'outline'}
            size="sm"
            onClick={() =>
              row.isActive
                ? setTarget(row)
                : updateCourse.mutate(
                    { id: row.id, dto: { isActive: true } },
                    {
                      onSuccess: (result) => {
                        if (!result.data) {
                          toast.error(result.message || 'Failed to activate course.');
                          return;
                        }
                        toast.success('Course activated.');
                      },
                    },
                  )
            }
          >
            {row.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {isAdmin ? (
            <div className="w-52">
              <DepartmentSelect
                value={departmentId === ALL ? undefined : departmentId}
                onChange={setDepartmentId}
                placeholder="All departments"
              />
            </div>
          ) : (
            <Badge variant="outline" className="h-9 px-3 text-sm">
              {hodDepartment?.code} - {hodDepartment?.name}
            </Badge>
          )}
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder="All levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All levels</SelectItem>
              {COURSE_LEVELS.map((l) => (
                <SelectItem key={l} value={String(l)}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={semester} onValueChange={setSemester}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All semesters" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All semesters</SelectItem>
              <SelectItem value="first">First</SelectItem>
              <SelectItem value="second">Second</SelectItem>
            </SelectContent>
          </Select>
          <Select value={isActive} onValueChange={setIsActive}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <CourseFormDialog
          trigger={<Button>New course</Button>}
          isAdmin={!!isAdmin}
          fixedDepartmentId={hodDepartment?.id}
          fixedDepartmentLabel={
            hodDepartment ? `${hodDepartment.code} - ${hodDepartment.name}` : undefined
          }
        />
      </div>

      <DataTable
        columns={columns}
        rows={courses}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        isError={isError}
        errorMessage={data?.message}
        onRetry={() => refetch()}
        emptyTitle="No courses found"
        emptyDescription="Try a different filter or create a new course."
      />

      <DangerConfirm
        open={!!target}
        onOpenChange={(open) => !open && setTarget(null)}
        title="Deactivate this course?"
        consequence={
          target ? (
            <>&ldquo;{target.code} - {target.title}&rdquo; will no longer accept new registrations.</>
          ) : (
            ''
          )
        }
        impact="Existing approved registrations are unaffected. It can be reactivated later."
        confirmText="Deactivate course"
        cancelText="Keep active"
        loading={updateCourse.isPending}
        onConfirm={handleToggleActive}
      />
    </div>
  );
}
