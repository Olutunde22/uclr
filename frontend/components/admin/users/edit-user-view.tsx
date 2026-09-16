'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { ErrorState } from '@/components/ui/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { DangerConfirm } from '@/components/shared/danger-confirm';
import { RoleCheckboxes } from '@/components/admin/users/role-checkboxes';
import { StudentProfileForm } from '@/components/admin/users/student-profile-form';
import { StaffProfileForm } from '@/components/admin/users/staff-profile-form';
import { updateUserSchema, type UpdateUserFormData } from '@/lib/schemas/users';
import { useUpdateUser, useUser } from '@/hooks/use-users';
import { STAFF_ROLES, type RoleName } from '@/types/users';

interface EditUserViewProps {
  userId: string;
}

export function EditUserView({ userId }: EditUserViewProps) {
  const { data, isLoading, isError, error, refetch } = useUser(userId);
  const updateUser = useUpdateUser();
  const [confirmDisable, setConfirmDisable] = useState(false);

  const user = data?.data;

  const form = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    values: user
      ? {
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone ?? '',
          roles: user.roles.map((r) => r.name),
        }
      : undefined,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <ErrorState
        message={
          !data?.data && data?.message
            ? data.message
            : error instanceof Error
              ? error.message
              : 'Failed to load this user.'
        }
        onRetry={() => refetch()}
      />
    );
  }

  const roles = form.watch('roles') ?? [];
  const showStudentProfile = roles.includes('student');
  const showStaffProfile = roles.some((r) => STAFF_ROLES.includes(r as RoleName));

  const onSubmit = async (values: UpdateUserFormData) => {
    const result = await updateUser.mutateAsync({
      id: userId,
      dto: { ...values, phone: values.phone || undefined },
    });
    if (!result.data) {
      toast.error(result.message || 'Failed to update user.');
      return;
    }
    toast.success('User updated.');
  };

  const handleToggleActive = async () => {
    const result = await updateUser.mutateAsync({
      id: userId,
      dto: { isActive: !user.isActive },
    });
    if (!result.data) {
      toast.error(result.message || 'Failed to update account status.');
      return;
    }
    toast.success(user.isActive ? 'Account disabled.' : 'Account enabled.');
    setConfirmDisable(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-start justify-between">
          <div>
            <CardTitle>
              {user.firstName} {user.lastName}
            </CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </div>
          <Badge variant={user.isActive ? 'secondary' : 'destructive'}>
            {user.isActive ? 'Active' : 'Disabled'}
          </Badge>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              <div className="flex justify-end">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Saving…' : 'Save changes'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="justify-end border-t">
          {user.isActive ? (
            <Button variant="destructive" onClick={() => setConfirmDisable(true)}>
              Disable account
            </Button>
          ) : (
            <Button variant="outline" onClick={handleToggleActive}>
              Enable account
            </Button>
          )}
        </CardFooter>
      </Card>

      {showStudentProfile ? (
        <StudentProfileForm userId={userId} profile={user.studentProfile} />
      ) : null}

      {showStaffProfile ? (
        <StaffProfileForm userId={userId} profile={user.staffProfile} />
      ) : null}

      <DangerConfirm
        open={confirmDisable}
        onOpenChange={setConfirmDisable}
        title="Disable this account?"
        consequence={
          <>
            &ldquo;{user.firstName} {user.lastName}&rdquo; will no longer be
            able to log in.
          </>
        }
        impact="Their data is kept and the account can be re-enabled later."
        confirmText="Disable account"
        cancelText="Keep account"
        loading={updateUser.isPending}
        onConfirm={handleToggleActive}
      />
    </div>
  );
}
