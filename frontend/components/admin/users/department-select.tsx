'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDepartments } from '@/hooks/use-academics';

interface DepartmentSelectProps {
  value?: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

// Shared department picker - backs the student profile's department, the
// staff profile's (optional) department, and academics.tsx's department
// create/edit forms' faculty-scoped variant lives separately since that one
// also needs a faculty filter.
export function DepartmentSelect({
  value,
  onChange,
  disabled,
  placeholder = 'Select a department',
}: DepartmentSelectProps) {
  const { data, isLoading } = useDepartments();
  const departments = data?.data ?? [];

  return (
    <Select value={value ?? undefined} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue
          placeholder={isLoading ? 'Loading departments…' : placeholder}
        />
      </SelectTrigger>
      <SelectContent>
        {departments.map((department) => (
          <SelectItem key={department.id} value={department.id}>
            {department.code} - {department.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
