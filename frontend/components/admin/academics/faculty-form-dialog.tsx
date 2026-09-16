'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
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
import { facultySchema, type FacultyFormData } from '@/lib/schemas/academics';
import { useCreateFaculty, useUpdateFaculty } from '@/hooks/use-academics';
import type { Faculty } from '@/types/academics';

interface FacultyFormDialogProps {
  faculty?: Faculty;
  trigger: React.ReactNode;
}

// Faculties/departments don't need their own guard+prefetch route the way
// users do (no nested profile fetch, no eligible-adviser lookup) - a dialog
// reused for create and edit is simpler and just as consistent here. See
// PROGRESS.md's Decisions for why users went the other way.
export function FacultyFormDialog({ faculty, trigger }: FacultyFormDialogProps) {
  const [open, setOpen] = useState(false);
  const createFaculty = useCreateFaculty();
  const updateFaculty = useUpdateFaculty();
  const isEdit = !!faculty;

  const form = useForm<FacultyFormData>({
    resolver: zodResolver(facultySchema),
    defaultValues: { code: faculty?.code ?? '', name: faculty?.name ?? '' },
  });

  useEffect(() => {
    if (open) {
      form.reset({ code: faculty?.code ?? '', name: faculty?.name ?? '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, faculty]);

  const onSubmit = async (values: FacultyFormData) => {
    const result = isEdit
      ? await updateFaculty.mutateAsync({ id: faculty.id, dto: values })
      : await createFaculty.mutateAsync(values);
    if (!result.data) {
      toast.error(
        result.message ||
          `Failed to ${isEdit ? 'update' : 'create'} faculty.`,
      );
      return;
    }
    toast.success(isEdit ? 'Faculty updated.' : 'Faculty created.');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit faculty' : 'New faculty'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input placeholder="SCI" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Faculty of Science" {...field} />
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
                    ? 'Save changes'
                    : 'Create faculty'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
