'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUsers } from '@/hooks/use-users';

const NONE = '__none__';

interface AdviserSelectProps {
  value?: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
}

// Eligible advisers = active users holding the "academic_adviser" role
// (UsersService.upsertStudentProfile enforces the same constraint
// server-side). "No adviser" is a real, selectable state (a student can be
// unassigned until the admin gets to it).
export function AdviserSelect({ value, onChange, disabled }: AdviserSelectProps) {
  const { data, isLoading } = useUsers({
    role: 'academic_adviser',
    isActive: true,
    pageSize: 200,
  });
  const advisers = data?.data?.items ?? [];

  return (
    <Select
      value={value ?? NONE}
      onValueChange={(v) => onChange(v === NONE ? null : v)}
      disabled={disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={isLoading ? 'Loading advisers…' : 'No adviser'} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>No adviser</SelectItem>
        {advisers.map((adviser) => (
          <SelectItem key={adviser.id} value={adviser.id}>
            {adviser.firstName} {adviser.lastName} ({adviser.email})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
