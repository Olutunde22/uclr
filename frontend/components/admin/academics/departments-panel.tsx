'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { DangerConfirm } from '@/components/shared/danger-confirm';
import { DepartmentFormDialog } from '@/components/admin/academics/department-form-dialog';
import { HodSelect } from '@/components/admin/academics/hod-select';
import {
  useAssignHod,
  useClearHod,
  useDeleteDepartment,
  useDepartments,
} from '@/hooks/use-academics';
import type { Department } from '@/types/academics';

export function DepartmentsPanel() {
  const { data, isLoading, isError, refetch } = useDepartments();
  const deleteDepartment = useDeleteDepartment();
  const assignHod = useAssignHod();
  const clearHod = useClearHod();
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);
  const [clearTarget, setClearTarget] = useState<Department | null>(null);

  const departments = data?.data ?? [];

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await deleteDepartment.mutateAsync(deleteTarget.id);
    if (!result.ok) {
      toast.error(result.message || 'Failed to delete department.');
      return;
    }
    toast.success('Department deleted.');
    setDeleteTarget(null);
  };

  const handleClearHod = async () => {
    if (!clearTarget) return;
    const result = await clearHod.mutateAsync(clearTarget.id);
    if (!result.data) {
      toast.error(result.message || "Failed to clear the department's HOD.");
      return;
    }
    toast.success('HOD cleared.');
    setClearTarget(null);
  };

  const columns: DataTableColumn<Department>[] = [
    { key: 'code', header: 'Code', cell: (row) => row.code },
    { key: 'name', header: 'Name', cell: (row) => row.name },
    {
      key: 'faculty',
      header: 'Faculty',
      cell: (row) => row.faculty?.code ?? '-',
    },
    {
      key: 'hod',
      header: 'HOD',
      cell: (row) =>
        row.hod ? (
          <div className="flex items-center gap-2">
            <span>
              {row.hod.firstName} {row.hod.lastName}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setClearTarget(row)}
            >
              Clear
            </Button>
          </div>
        ) : (
          <HodSelect
            onChange={(userId) =>
              assignHod.mutate(
                { departmentId: row.id, userId },
                {
                  onSuccess: (result) => {
                    if (!result.data) {
                      toast.error(result.message || 'Failed to assign HOD.');
                      return;
                    }
                    toast.success('HOD assigned.');
                  },
                },
              )
            }
          />
        ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      cell: (row) => (
        <div className="flex justify-end gap-2">
          <DepartmentFormDialog
            department={row}
            trigger={
              <Button variant="outline" size="sm">
                Edit
              </Button>
            }
          />
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteTarget(row)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <DepartmentFormDialog trigger={<Button>New department</Button>} />
      </div>
      <DataTable
        columns={columns}
        rows={departments}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        isError={isError}
        errorMessage={data?.message}
        onRetry={() => refetch()}
        emptyTitle="No departments yet"
        emptyDescription="Create a faculty first, then add its departments here."
      />
      <DangerConfirm
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this department?"
        consequence={
          deleteTarget ? (
            <>&ldquo;{deleteTarget.name}&rdquo; will be permanently removed.</>
          ) : (
            ''
          )
        }
        impact="A department with students still assigned to it cannot be deleted."
        confirmText="Delete department"
        cancelText="Keep department"
        loading={deleteDepartment.isPending}
        onConfirm={handleDelete}
      />
      <DangerConfirm
        open={!!clearTarget}
        onOpenChange={(open) => !open && setClearTarget(null)}
        title="Clear this department's HOD?"
        consequence={
          clearTarget ? (
            <>
              {clearTarget.hod?.firstName} {clearTarget.hod?.lastName} will
              lose HOD access and approval duties for &ldquo;
              {clearTarget.name}&rdquo;.
            </>
          ) : (
            ''
          )
        }
        impact="Registrations pending HOD approval in this department will have no HOD to decide them until a new one is assigned."
        confirmText="Clear HOD"
        cancelText="Keep HOD"
        loading={clearHod.isPending}
        onConfirm={handleClearHod}
      />
    </div>
  );
}
