'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUsers } from '@/hooks/use-users';

interface HodSelectProps {
  value?: string | null;
  onChange: (userId: string) => void;
  disabled?: boolean;
}

// Eligible HODs = active users holding the "hod" role (AcademicsService
// .assignHod enforces the same constraint server-side, and also rejects a
// user who already heads a different department).
export function HodSelect({ value, onChange, disabled }: HodSelectProps) {
  const { data, isLoading } = useUsers({
    role: 'hod',
    isActive: true,
    pageSize: 200,
  });
  const candidates = data?.data?.items ?? [];

  return (
    <Select value={value ?? undefined} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-56">
        <SelectValue placeholder={isLoading ? 'Loading…' : 'Assign a HOD'} />
      </SelectTrigger>
      <SelectContent>
        {candidates.map((candidate) => (
          <SelectItem key={candidate.id} value={candidate.id}>
            {candidate.firstName} {candidate.lastName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
