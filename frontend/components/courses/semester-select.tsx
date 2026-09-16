'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSemesters } from '@/hooks/use-calendar';

interface SemesterSelectProps {
  value?: string;
  onChange: (semesterId: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

// Class-list scoping needs a real semester id (CoursesService.classList takes
// `semesterId` as a required query param) — a select over GET
// /calendar/semesters (permission-less, any authenticated user, see
// backend/CLAUDE.md's calendar module notes), never free text. Shared by the
// lecturer's own class-list view; the HOD gets no class-list view per
// PLAN.md's actor table.
export function SemesterSelect({
  value,
  onChange,
  disabled,
  placeholder = 'Select a semester',
}: SemesterSelectProps) {
  const { data, isLoading } = useSemesters();
  const semesters = data?.data ?? [];

  return (
    <Select value={value ?? undefined} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-full sm:w-64">
        <SelectValue placeholder={isLoading ? 'Loading semesters…' : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {semesters.map((semester) => (
          <SelectItem key={semester.id} value={semester.id}>
            {semester.session?.name ?? 'Session'} -{' '}
            {semester.name === 'first' ? 'First' : 'Second'} semester
            {semester.isCurrent ? ' (current)' : ''}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
