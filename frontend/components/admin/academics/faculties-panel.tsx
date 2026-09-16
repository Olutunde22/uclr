'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { DangerConfirm } from '@/components/shared/danger-confirm';
import { FacultyFormDialog } from '@/components/admin/academics/faculty-form-dialog';
import { useDeleteFaculty, useFaculties } from '@/hooks/use-academics';
import type { Faculty } from '@/types/academics';

export function FacultiesPanel() {
  const { data, isLoading, isError, refetch } = useFaculties();
  const deleteFaculty = useDeleteFaculty();
  const [target, setTarget] = useState<Faculty | null>(null);

  const faculties = data?.data ?? [];

  const handleDelete = async () => {
    if (!target) return;
    const result = await deleteFaculty.mutateAsync(target.id);
    if (!result.ok) {
      toast.error(result.message || 'Failed to delete faculty.');
      return;
    }
    toast.success('Faculty deleted.');
    setTarget(null);
  };

  const columns: DataTableColumn<Faculty>[] = [
    { key: 'code', header: 'Code', cell: (row) => row.code },
    { key: 'name', header: 'Name', cell: (row) => row.name },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      cell: (row) => (
        <div className="flex justify-end gap-2">
          <FacultyFormDialog
            faculty={row}
            trigger={
              <Button variant="outline" size="sm">
                Edit
              </Button>
            }
          />
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setTarget(row)}
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
        <FacultyFormDialog
          trigger={<Button>New faculty</Button>}
        />
      </div>
      <DataTable
        columns={columns}
        rows={faculties}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        isError={isError}
        errorMessage={data?.message}
        onRetry={() => refetch()}
        emptyTitle="No faculties yet"
        emptyDescription="Create the first faculty to start building the academic structure."
      />
      <DangerConfirm
        open={!!target}
        onOpenChange={(open) => !open && setTarget(null)}
        title="Delete this faculty?"
        consequence={
          target ? <>&ldquo;{target.name}&rdquo; will be permanently removed.</> : ''
        }
        impact="A faculty with departments still assigned to it cannot be deleted."
        confirmText="Delete faculty"
        cancelText="Keep faculty"
        loading={deleteFaculty.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
