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
import { sessionSchema, type SessionFormData } from '@/lib/schemas/calendar';
import { useCreateSession, useUpdateSession } from '@/hooks/use-calendar';
import type { AcademicSession } from '@/types/calendar';

interface SessionFormDialogProps {
  session?: AcademicSession;
  trigger: React.ReactNode;
}

export function SessionFormDialog({ session, trigger }: SessionFormDialogProps) {
  const [open, setOpen] = useState(false);
  const createSession = useCreateSession();
  const updateSession = useUpdateSession();
  const isEdit = !!session;

  const form = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: { name: session?.name ?? '' },
  });

  useEffect(() => {
    if (open) {
      form.reset({ name: session?.name ?? '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, session]);

  const onSubmit = async (values: SessionFormData) => {
    const result = isEdit
      ? await updateSession.mutateAsync({ id: session.id, dto: values })
      : await createSession.mutateAsync(values);
    if (!result.data) {
      toast.error(
        result.message || `Failed to ${isEdit ? 'update' : 'create'} session.`,
      );
      return;
    }
    toast.success(isEdit ? 'Session updated.' : 'Session created.');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit session' : 'New academic session'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="2025/2026" {...field} />
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
                    : 'Create session'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
