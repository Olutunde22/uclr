'use client';

import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/shared/status-badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { DangerConfirm } from '@/components/shared/danger-confirm';
import { useUpdateUser, useUsers } from '@/hooks/use-users';
import { useDepartments } from '@/hooks/use-academics';
import { ROLE_OPTIONS, type User } from '@/types/users';

const ALL = '__all__';
const PAGE_SIZE = 20;

function formatRole(name: string) {
  return name
    .split('_')
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ');
}

export function UsersListView() {
  const [role, setRole] = useState<string>(ALL);
  const [departmentId, setDepartmentId] = useState<string>(ALL);
  const [isActive, setIsActive] = useState<string>(ALL);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<User | null>(null);

  const filters = {
    role: role === ALL ? undefined : role,
    departmentId: departmentId === ALL ? undefined : departmentId,
    isActive: isActive === ALL ? undefined : isActive === 'active',
    search: search || undefined,
    page,
    pageSize: PAGE_SIZE,
  };

  const { data, isLoading, isError, refetch } = useUsers(filters);
  const { data: departmentsData } = useDepartments();
  const updateUser = useUpdateUser();

  const paginated = data?.data;
  const users = paginated?.items ?? [];
  const total = paginated?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleToggleActive = async () => {
    if (!target) return;
    const result = await updateUser.mutateAsync({
      id: target.id,
      dto: { isActive: !target.isActive },
    });
    if (!result.data) {
      toast.error(result.message || 'Failed to update account status.');
      return;
    }
    toast.success(target.isActive ? 'Account disabled.' : 'Account enabled.');
    setTarget(null);
  };

  const columns: DataTableColumn<User>[] = [
    {
      key: 'name',
      header: 'Name',
      cell: (row) => (
        <Link
          href={`/admin/users/${row.id}`}
          className="font-medium hover:underline"
        >
          {row.firstName} {row.lastName}
        </Link>
      ),
    },
    { key: 'email', header: 'Email', cell: (row) => row.email },
    {
      key: 'roles',
      header: 'Roles',
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.roles.map((r) => (
            <Badge key={r.id} variant="outline">
              {formatRole(r.name)}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => (
        <StatusBadge tone={row.isActive ? 'success' : 'destructive'}>
          {row.isActive ? 'Active' : 'Disabled'}
        </StatusBadge>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      cell: (row) => (
        <div className="flex justify-end gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/users/${row.id}`}>Edit</Link>
          </Button>
          <Button
            variant={row.isActive ? 'destructive' : 'outline'}
            size="sm"
            onClick={() =>
              row.isActive
                ? setTarget(row)
                : updateUser.mutate(
                    { id: row.id, dto: { isActive: true } },
                    {
                      onSuccess: (result) => {
                        if (!result.data) {
                          toast.error(
                            result.message || 'Failed to enable account.',
                          );
                          return;
                        }
                        toast.success('Account enabled.');
                      },
                    },
                  )
            }
          >
            {row.isActive ? 'Disable' : 'Enable'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Search name, email, matric no., staff ID…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-64"
          />
          <Select
            value={role}
            onValueChange={(v) => {
              setRole(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All roles</SelectItem>
              {ROLE_OPTIONS.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={departmentId}
            onValueChange={(v) => {
              setDepartmentId(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-52">
              <SelectValue placeholder="All departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All departments</SelectItem>
              {(departmentsData?.data ?? []).map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.code} - {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={isActive}
            onValueChange={(v) => {
              setIsActive(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="disabled">Disabled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button asChild>
          <Link href="/admin/users/new">Create user</Link>
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={users}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        isError={isError}
        errorMessage={data?.message}
        onRetry={() => refetch()}
        emptyTitle="No users found"
        emptyDescription="Try a different filter or create a new account."
      />

      {totalPages > 1 ? (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-muted-foreground text-sm">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      ) : null}

      <DangerConfirm
        open={!!target}
        onOpenChange={(open) => !open && setTarget(null)}
        title="Disable this account?"
        consequence={
          target ? (
            <>
              &ldquo;{target.firstName} {target.lastName}&rdquo; will no
              longer be able to log in.
            </>
          ) : (
            ''
          )
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
