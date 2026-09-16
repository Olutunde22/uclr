'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  timetableSlotSchema,
  type TimetableSlotFormData,
} from '@/lib/schemas/courses';
import { useAddTimetableSlot, useUpdateTimetableSlot } from '@/hooks/use-courses';
import { WEEKDAY_OPTIONS, type TimetableSlot } from '@/types/courses';

interface TimetableSlotFormDialogProps {
  courseId: string;
  trigger: React.ReactNode;
  /** Present to edit an existing slot, omitted to add a new one. */
  slot?: TimetableSlot;
}

export function TimetableSlotFormDialog({
  courseId,
  trigger,
  slot,
}: TimetableSlotFormDialogProps) {
  const [open, setOpen] = useState(false);
  const addSlot = useAddTimetableSlot();
  const updateSlot = useUpdateTimetableSlot();
  const isEdit = !!slot;

  const defaults: TimetableSlotFormData = {
    day: slot?.day ?? 'monday',
    startTime: slot?.startTime?.slice(0, 5) ?? '09:00',
    endTime: slot?.endTime?.slice(0, 5) ?? '11:00',
    venue: slot?.venue ?? '',
  };

  const form = useForm<TimetableSlotFormData>({
    resolver: zodResolver(timetableSlotSchema),
    defaultValues: defaults,
  });

  const onSubmit = async (values: TimetableSlotFormData) => {
    const result = isEdit
      ? await updateSlot.mutateAsync({ id: courseId, slotId: slot.id, dto: values })
      : await addSlot.mutateAsync({ id: courseId, dto: values });
    if (!result.data) {
      toast.error(result.message || 'Failed to save timetable slot.');
      return;
    }
    toast.success(isEdit ? 'Timetable slot updated.' : 'Timetable slot added.');
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) form.reset(defaults);
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit timetable slot' : 'New timetable slot'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="day"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Day</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a day" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {WEEKDAY_OPTIONS.map((d) => (
                        <SelectItem key={d.value} value={d.value}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="venue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue</FormLabel>
                  <FormControl>
                    <Input placeholder="LT1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? 'Saving…'
                  : isEdit
                    ? 'Save slot'
                    : 'Add slot'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
