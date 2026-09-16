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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  departmentSchema,
  type DepartmentFormData,
} from '@/lib/schemas/academics';
import { useCreateDepartment, useUpdateDepartment, useFaculties } from '@/hooks/use-academics';
import type { Department } from '@/types/academics';

interface DepartmentFormDialogProps {
  department?: Department;
  trigger: React.ReactNode;
}

export function DepartmentFormDialog({
  department,
  trigger,
}: DepartmentFormDialogProps) {
  const [open, setOpen] = useState(false);
  const { data: facultiesData } = useFaculties();
  const createDepartment = useCreateDepartment();
  const updateDepartment = useUpdateDepartment();
  const isEdit = !!department;

  const form = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      facultyId: department?.facultyId ?? '',
      code: department?.code ?? '',
      name: department?.name ?? '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        facultyId: department?.facultyId ?? '',
        code: department?.code ?? '',
        name: department?.name ?? '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, department]);

  const onSubmit = async (values: DepartmentFormData) => {
    const result = isEdit
      ? await updateDepartment.mutateAsync({ id: department.id, dto: values })
      : await createDepartment.mutateAsync(values);
    if (!result.data) {
      toast.error(
        result.message ||
          `Failed to ${isEdit ? 'update' : 'create'} department.`,
      );
      return;
    }
    toast.success(isEdit ? 'Department updated.' : 'Department created.');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit department' : 'New department'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="facultyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Faculty</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a faculty" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(facultiesData?.data ?? []).map((faculty) => (
                        <SelectItem key={faculty.id} value={faculty.id}>
                          {faculty.code} - {faculty.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input placeholder="CSC" {...field} />
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
                    <Input placeholder="Computer Science" {...field} />
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
                    : 'Create department'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
