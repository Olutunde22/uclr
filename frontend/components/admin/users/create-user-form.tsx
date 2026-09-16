'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'nextjs-toploader/app';
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
import { RoleCheckboxes } from '@/components/admin/users/role-checkboxes';
import {
  createUserFormSchema,
  type CreateUserFormValues,
} from '@/lib/schemas/users';
import {
  useCreateUser,
  useUpsertStaffProfile,
  useUpsertStudentProfile,
} from '@/hooks/use-users';
import { STAFF_ROLES, type RoleName } from '@/types/users';

const LEVELS = [100, 200, 300, 400, 500] as const;

// `level`'s z.coerce.number() has an `unknown` INPUT type (the raw select
// string) distinct from its OUTPUT type after parsing - see
// settings-view.tsx's identical comment for the full explanation.
type CreateUserFormInput = z.input<typeof createUserFormSchema>;

export function CreateUserForm() {
  const router = useRouter();
  const createUser = useCreateUser();
  const upsertStudentProfile = useUpsertStudentProfile();
  const upsertStaffProfile = useUpsertStaffProfile();

  const form = useForm<CreateUserFormInput, undefined, CreateUserFormValues>({
    resolver: zodResolver(createUserFormSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      roles: [],
      matricNo: '',
      departmentId: '',
      programme: '',
      gender: '',
      adviserId: null,
      staffId: '',
      staffDepartmentId: null,
      rank: '',
    },
  });

  const roles = form.watch('roles');
  const wantsStudentProfile = roles.includes('student');
  const wantsStaffProfile = roles.some((r) =>
    STAFF_ROLES.includes(r as RoleName),
  );

  const onSubmit = async (values: CreateUserFormValues) => {
    const created = await createUser.mutateAsync({
      email: values.email,
      password: values.password,
      firstName: values.firstName,
      lastName: values.lastName,
      phone: values.phone || undefined,
      roles: values.roles,
    });
    if (!created.data) {
      toast.error(created.message || 'Failed to create user.');
      return;
    }
    const userId = created.data.id;

    if (wantsStudentProfile) {
      const result = await upsertStudentProfile.mutateAsync({
        id: userId,
        dto: {
          matricNo: values.matricNo!,
          departmentId: values.departmentId!,
          level: values.level as 100 | 200 | 300 | 400 | 500,
          programme: values.programme!,
          gender: values.gender!,
          adviserId: values.adviserId || null,
        },
      });
      if (!result.data) {
        toast.error(result.message || "Failed to save the student's profile.");
      }
    }

    if (wantsStaffProfile) {
      const result = await upsertStaffProfile.mutateAsync({
        id: userId,
        dto: {
          staffId: values.staffId!,
          departmentId: values.staffDepartmentId || null,
          rank: values.rank!,
        },
      });
      if (!result.data) {
        toast.error(
          result.message || "Failed to save the staff member's profile.",
        );
      }
    }

    toast.success('User created.');
    router.push(`/admin/users/${userId}`);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Basic details and role assignment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (optional)</FormLabel>
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="roles"
              render={() => (
                <FormItem>
                  <FormLabel>Roles</FormLabel>
                  <FormControl>
                    <RoleCheckboxes
                      value={roles}
                      onChange={(value) => form.setValue('roles', value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {wantsStudentProfile ? (
          <Card>
            <CardHeader>
              <CardTitle>Student profile</CardTitle>
              <CardDescription>
                Required because the &ldquo;Student&rdquo; role is selected.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                        value={field.value ? String(field.value) : undefined}
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
                      <DepartmentSelect
                        value={field.value}
                        onChange={field.onChange}
                      />
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
                        <Input placeholder="B.Sc. Computer Science" {...field} />
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
                    <FormLabel>Academic adviser (optional)</FormLabel>
                    <FormControl>
                      <AdviserSelect value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        ) : null}

        {wantsStaffProfile ? (
          <Card>
            <CardHeader>
              <CardTitle>Staff profile</CardTitle>
              <CardDescription>
                Required because a staff role is selected.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                        <Input placeholder="Senior Lecturer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="staffDepartmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department (optional)</FormLabel>
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
            </CardContent>
          </Card>
        ) : null}

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/users')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Creating…' : 'Create user'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
