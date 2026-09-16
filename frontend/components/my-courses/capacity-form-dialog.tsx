'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
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
import { capacitySchema, type CapacityFormData } from '@/lib/schemas/courses';
import { useUpdateOwnCapacity } from '@/hooks/use-courses';
import type { Course } from '@/types/courses';

type CapacityFormInput = z.input<typeof capacitySchema>;

interface CapacityFormDialogProps {
  course: Course;
  trigger: React.ReactNode;
}

// Lecturer's own-course editing is capacity + prerequisites only (PLAN.md's
// actor table: "edit capacity and prerequisites of own courses") — no other
// course field, unlike the HOD's full course-detail form.
export function CapacityFormDialog({ course, trigger }: CapacityFormDialogProps) {
  const [open, setOpen] = useState(false);
  const updateCapacity = useUpdateOwnCapacity();

  const defaults: CapacityFormInput = { capacity: course.capacity };

  const form = useForm<CapacityFormInput, undefined, CapacityFormData>({
    resolver: zodResolver(capacitySchema),
    defaultValues: defaults,
  });

  const onSubmit = async (values: CapacityFormData) => {
    const result = await updateCapacity.mutateAsync({
      id: course.id,
      capacity: values.capacity,
    });
    if (!result.data) {
      toast.error(result.message || 'Failed to update capacity.');
      return;
    }
    toast.success('Capacity updated.');
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
          <DialogTitle>Edit capacity — {course.code}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      value={(field.value as number | string | undefined) ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving…' : 'Save capacity'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
