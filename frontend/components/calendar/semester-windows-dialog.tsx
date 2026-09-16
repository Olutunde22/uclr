'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  semesterWindowsSchema,
  type SemesterWindowsFormData,
} from '@/lib/schemas/calendar';
import { useUpdateSemesterWindows } from '@/hooks/use-calendar';
import type { Semester } from '@/types/calendar';

interface SemesterWindowsDialogProps {
  semester: Semester;
  trigger: React.ReactNode;
}

// <input type="datetime-local"> works in local time with no timezone suffix
// ("2025-09-16T09:00"); the backend's UpdateSemesterWindowsDto wants ISO 8601
// (@IsISO8601). These two helpers are the only place that conversion happens.
function toInputValue(iso?: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toIso(value?: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export function SemesterWindowsDialog({
  semester,
  trigger,
}: SemesterWindowsDialogProps) {
  const [open, setOpen] = useState(false);
  const updateWindows = useUpdateSemesterWindows();

  const defaults = {
    registrationOpensAt: toInputValue(semester.registrationOpensAt),
    registrationClosesAt: toInputValue(semester.registrationClosesAt),
    addDropClosesAt: toInputValue(semester.addDropClosesAt),
  };

  const form = useForm<SemesterWindowsFormData>({
    resolver: zodResolver(semesterWindowsSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    if (open) form.reset(defaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, semester]);

  const onSubmit = async (values: SemesterWindowsFormData) => {
    const result = await updateWindows.mutateAsync({
      id: semester.id,
      dto: {
        registrationOpensAt: toIso(values.registrationOpensAt),
        registrationClosesAt: toIso(values.registrationClosesAt),
        addDropClosesAt: toIso(values.addDropClosesAt),
      },
    });
    if (!result.data) {
      toast.error(result.message || "Failed to update the semester's windows.");
      return;
    }
    toast.success('Windows updated.');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Edit windows &mdash; {semester.session?.name} {semester.name}
          </DialogTitle>
          <DialogDescription>
            The registration and add/drop windows this semester&rsquo;s
            registration flow checks against.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="registrationOpensAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registration opens</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="registrationClosesAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registration closes</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="addDropClosesAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Add/drop closes</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving…' : 'Save windows'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
