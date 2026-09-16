'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { DangerConfirm } from '@/components/shared/danger-confirm';
import { TimetableSlotFormDialog } from '@/components/department-courses/timetable-slot-form-dialog';
import { useRemoveTimetableSlot } from '@/hooks/use-courses';
import { WEEKDAY_OPTIONS, type TimetableSlot } from '@/types/courses';

interface TimetableSlotsPanelProps {
  courseId: string;
  slots: TimetableSlot[];
}

function dayLabel(day: TimetableSlot['day']) {
  return WEEKDAY_OPTIONS.find((d) => d.value === day)?.label ?? day;
}

export function TimetableSlotsPanel({ courseId, slots }: TimetableSlotsPanelProps) {
  const removeSlot = useRemoveTimetableSlot();
  const [target, setTarget] = useState<TimetableSlot | null>(null);

  const handleRemove = async () => {
    if (!target) return;
    const result = await removeSlot.mutateAsync({ id: courseId, slotId: target.id });
    if (!result.data) {
      toast.error(result.message || 'Failed to remove timetable slot.');
      return;
    }
    toast.success('Timetable slot removed.');
    setTarget(null);
  };

  const columns: DataTableColumn<TimetableSlot>[] = [
    { key: 'day', header: 'Day', cell: (row) => dayLabel(row.day) },
    {
      key: 'time',
      header: 'Time',
      cell: (row) => `${row.startTime.slice(0, 5)} – ${row.endTime.slice(0, 5)}`,
    },
    { key: 'venue', header: 'Venue', cell: (row) => row.venue },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      cell: (row) => (
        <div className="flex justify-end gap-2">
          <TimetableSlotFormDialog
            courseId={courseId}
            slot={row}
            trigger={
              <Button variant="outline" size="sm">
                Edit
              </Button>
            }
          />
          <Button variant="destructive" size="sm" onClick={() => setTarget(row)}>
            Remove
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between">
        <div>
          <CardTitle>Timetable slots</CardTitle>
          <CardDescription>
            When and where this course meets. Used to detect clashes with a
            student&apos;s other selected courses at registration.
          </CardDescription>
        </div>
        <TimetableSlotFormDialog
          courseId={courseId}
          trigger={<Button size="sm">New slot</Button>}
        />
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          rows={slots}
          rowKey={(row) => row.id}
          emptyTitle="No timetable slots yet"
          emptyDescription="Add one so registration can detect clashes with other courses."
        />
      </CardContent>

      <DangerConfirm
        open={!!target}
        onOpenChange={(open) => !open && setTarget(null)}
        title="Remove this timetable slot?"
        consequence={
          target ? (
            <>
              {dayLabel(target.day)} {target.startTime.slice(0, 5)}–
              {target.endTime.slice(0, 5)} at &ldquo;{target.venue}&rdquo; will
              be removed.
            </>
          ) : (
            ''
          )
        }
        impact="Registration clash checks will no longer see this meeting time."
        confirmText="Remove slot"
        cancelText="Keep slot"
        loading={removeSlot.isPending}
        onConfirm={handleRemove}
      />
    </Card>
  );
}
