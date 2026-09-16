'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
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
import { FeeSessionSelect } from '@/components/fees/students/fee-session-select';
import { paymentSchema, type PaymentFormData } from '@/lib/schemas/fees';
import { useRecordPayment } from '@/hooks/use-fees';
import type { User } from '@/types/users';

interface RecordPaymentDialogProps {
  student: User;
  trigger: React.ReactNode;
}

// studentId comes from the selected search result (`student.id`), never a
// typed field on this form — the FK-select rule applies to every relational
// field in this slice, including implicit ones.
export function RecordPaymentDialog({
  student,
  trigger,
}: RecordPaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const recordPayment = useRecordPayment();

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      sessionId: '',
      amount: '',
      receiptNo: '',
      paymentDate: new Date().toISOString().slice(0, 10),
    },
  });

  const onSubmit = async (values: PaymentFormData) => {
    const result = await recordPayment.mutateAsync({
      studentId: student.id,
      ...values,
    });
    if (!result.data) {
      toast.error(result.message || 'Failed to record payment.');
      return;
    }
    toast.success('Payment recorded.');
    form.reset({
      sessionId: '',
      amount: '',
      receiptNo: '',
      paymentDate: new Date().toISOString().slice(0, 10),
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record a payment</DialogTitle>
          <DialogDescription>
            {student.firstName} {student.lastName}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="sessionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session</FormLabel>
                  <FormControl>
                    <FeeSessionSelect value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input placeholder="50000.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="receiptNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Receipt no.</FormLabel>
                  <FormControl>
                    <Input placeholder="RCPT-2025-00042" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="paymentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Recording…' : 'Record payment'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
