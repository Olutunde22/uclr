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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DepartmentSelect } from '@/components/admin/users/department-select';
import { courseSchema, type CourseFormData } from '@/lib/schemas/courses';
import { useCreateCourse } from '@/hooks/use-courses';
import { COURSE_LEVELS } from '@/types/courses';

type CourseFormInput = z.input<typeof courseSchema>;

interface CourseFormDialogProps {
  trigger: React.ReactNode;
  /** system_admin picks any department via a select; an HOD's department is
   * fixed (inferred server-side, see the courses page) and shown read-only —
   * not free text, just not user-editable, since an HOD only ever has one
   * valid choice. */
  isAdmin: boolean;
  fixedDepartmentId?: string;
  fixedDepartmentLabel?: string;
}

export function CourseFormDialog({
  trigger,
  isAdmin,
  fixedDepartmentId,
  fixedDepartmentLabel,
}: CourseFormDialogProps) {
  const [open, setOpen] = useState(false);
  const createCourse = useCreateCourse();

  const defaults: CourseFormInput = {
    departmentId: fixedDepartmentId ?? '',
    code: '',
    title: '',
    creditUnits: 3,
    level: 100,
    semester: 'first',
    capacity: 60,
  };

  const form = useForm<CourseFormInput, undefined, CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: defaults,
  });

  const onSubmit = async (values: CourseFormData) => {
    const result = await createCourse.mutateAsync(values);
    if (!result.data) {
      toast.error(result.message || 'Failed to create course.');
      return;
    }
    toast.success(`"${result.data.code}" created.`);
    form.reset(defaults);
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
          <DialogTitle>New course</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {isAdmin ? (
              <FormField
                control={form.control}
                name="departmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <DepartmentSelect
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <div>
                <FormLabel className="mb-1.5 block">Department</FormLabel>
                <p className="text-muted-foreground text-sm">
                  {fixedDepartmentLabel ?? '—'}
                </p>
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course code</FormLabel>
                    <FormControl>
                      <Input placeholder="CSC301" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="creditUnits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credit units</FormLabel>
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
            </div>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Data Structures and Algorithms" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level</FormLabel>
                    <Select
                      value={String(field.value)}
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COURSE_LEVELS.map((level) => (
                          <SelectItem key={level} value={String(level)}>
                            {level}
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
                name="semester"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Semester</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Semester" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="first">First</SelectItem>
                        <SelectItem value="second">Second</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
            </div>
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Creating…' : 'Create course'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
