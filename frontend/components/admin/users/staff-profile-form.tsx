'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { DepartmentSelect } from '@/components/admin/users/department-select';
import {
  staffProfileSchema,
  type StaffProfileFormData,
} from '@/lib/schemas/users';
import { useUpsertStaffProfile } from '@/hooks/use-users';
import type { StaffProfile } from '@/types/users';

interface StaffProfileFormProps {
  userId: string;
  profile?: StaffProfile;
}

export function StaffProfileForm({ userId, profile }: StaffProfileFormProps) {
  const upsertStaffProfile = useUpsertStaffProfile();

  const form = useForm<StaffProfileFormData>({
    resolver: zodResolver(staffProfileSchema),
    defaultValues: {
      staffId: profile?.staffId ?? '',
      departmentId: profile?.departmentId ?? null,
      rank: profile?.rank ?? '',
    },
  });

  const onSubmit = async (values: StaffProfileFormData) => {
    const result = await upsertStaffProfile.mutateAsync({
      id: userId,
      dto: { ...values, departmentId: values.departmentId || null },
    });
    if (!result.data) {
      toast.error(result.message || "Failed to save the staff member's profile.");
      return;
    }
    toast.success('Staff profile saved.');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff profile</CardTitle>
        <CardDescription>Staff ID, department and rank.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="staffId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Staff ID</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rank"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rank</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="departmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department (optional)</FormLabel>
                  <FormControl>
                    <DepartmentSelect value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving…' : 'Save staff profile'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
