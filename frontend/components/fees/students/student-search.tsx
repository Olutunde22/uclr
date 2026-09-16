'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { useUsers } from '@/hooks/use-users';
import type { User } from '@/types/users';

interface StudentSearchProps {
  onSelect: (student: User) => void;
  selectedId?: string;
}

// "search by matric no." per CLAUDE.md's milestone brief — the input is a
// free-text search box (not a relational field), and results are picked
// from real GET /users rows, never typed by ID.
export function StudentSearch({ onSelect, selectedId }: StudentSearchProps) {
  const [term, setTerm] = useState('');
  const filters = { role: 'student', search: term, pageSize: 10 };
  const { data, isLoading, isError, refetch } = useUsers(filters);

  const results = term.trim() ? (data?.data?.items ?? []) : [];

  const columns: DataTableColumn<User>[] = [
    {
      key: 'name',
      header: 'Name',
      cell: (row) => (
        <span className="font-medium">
          {row.firstName} {row.lastName}
        </span>
      ),
    },
    { key: 'email', header: 'Email', cell: (row) => row.email },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      cell: (row) => (
        <Button
          size="sm"
          variant={row.id === selectedId ? 'secondary' : 'outline'}
          onClick={() => onSelect(row)}
        >
          {row.id === selectedId ? 'Selected' : 'Select'}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <Input
        placeholder="Search by matric no., name or email…"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        className="max-w-md"
      />
      {term.trim() ? (
        <DataTable
          columns={columns}
          rows={results}
          rowKey={(row) => row.id}
          isLoading={isLoading}
          isError={isError}
          errorMessage={data?.message}
          onRetry={() => refetch()}
          emptyTitle="No matching students"
          emptyDescription="Try a different matric no., name or email."
          skeletonRows={3}
        />
      ) : null}
    </div>
  );
}
