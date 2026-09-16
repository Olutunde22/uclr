'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AdviserSelect } from '@/components/admin/users/adviser-select';
import { DepartmentSelect } from '@/components/admin/users/department-select';
import {
  studentProfileSchema,
  type StudentProfileFormData,
} from '@/lib/schemas/users';
import { useUpsertStudentProfile } from '@/hooks/use-users';
import type { StudentProfile } from '@/types/users';

const LEVELS = [100, 200, 300, 400, 500] as const;

// `level`'s z.coerce.number() has an `unknown` INPUT type distinct from its
// OUTPUT type after parsing - see settings-view.tsx's identical comment.
type StudentProfileFormInput = z.input<typeof studentProfileSchema>;

interface StudentProfileFormProps {
  userId: string;
  profile?: StudentProfile;
}

// The "assign/change adviser for a student" requirement from PLAN.md's admin
// pages lives here, as the adviserId field on this same profile form -
// there's no separate route for it.
export function StudentProfileForm({ userId, profile }: StudentProfileFormProps) {
  const upsertStudentProfile = useUpsertStudentProfile();

  const form = useForm<StudentProfileFormInput, undefined, StudentProfileFormData>({
    resolver: zodResolver(studentProfileSchema),
    defaultValues: {
      matricNo: profile?.matricNo ?? '',
      departmentId: profile?.departmentId ?? '',
      level: profile?.level ?? 100,
      programme: profile?.programme ?? '',
      gender: profile?.gender ?? '',
      adviserId: profile?.adviserId ?? null,
    },
  });

  const onSubmit = async (values: StudentProfileFormData) => {
    const result = await upsertStudentProfile.mutateAsync({
      id: userId,
      dto: { ...values, adviserId: values.adviserId || null },
    });
    if (!result.data) {
      toast.error(result.message || "Failed to save the student's profile.");
      return;
    }
    toast.success("Student profile saved.");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student profile</CardTitle>
        <CardDescription>
          Matric no., department, level, programme and academic adviser.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="matricNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Matric no.</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                          <SelectValue placeholder="Select a level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LEVELS.map((level) => (
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
            </div>
            <FormField
              control={form.control}
              name="departmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <FormControl>
                    <DepartmentSelect value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="programme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Programme</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="adviserId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Academic adviser</FormLabel>
                  <FormControl>
                    <AdviserSelect value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving…' : 'Save student profile'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
