'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUsers } from '@/hooks/use-users';

interface LecturerSelectProps {
  value?: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

// Eligible lecturers = active users holding the "lecturer" role
// (CoursesService.assertLecturerRole enforces the same constraint
// server-side) — mirrors components/admin/users/adviser-select.tsx.
//
// Known gap (documented in PROGRESS.md, not fixed here per this milestone's
// scope rule): GET /users is gated on `users:read`, which the `hod` role is
// not seeded with, so this select 403s (renders empty, via ErrorState) for a
// pure HOD account. It works for `system_admin`, which holds every
// permission. Recommended backend fix: give `hod` `users:read` the same way
// `bursary_officer` already has it.
export function LecturerSelect({
  value,
  onChange,
  disabled,
  placeholder = 'Select a lecturer',
}: LecturerSelectProps) {
  const { data, isLoading } = useUsers({
    role: 'lecturer',
    isActive: true,
    pageSize: 200,
  });
  const lecturers = data?.data?.items ?? [];

  return (
    <Select value={value ?? undefined} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={isLoading ? 'Loading lecturers…' : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {lecturers.map((lecturer) => (
          <SelectItem key={lecturer.id} value={lecturer.id}>
            {lecturer.firstName} {lecturer.lastName} ({lecturer.email})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
