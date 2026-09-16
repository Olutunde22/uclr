'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSessions } from '@/hooks/use-calendar';

interface SessionSelectProps {
  value?: string;
  onChange: (sessionId: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

// Every FK field in this slice is a select over real data, never free text —
// backs the semester create form's `sessionId` and the semesters panel's
// session filter, both driven by the same GET /calendar/sessions the page
// already prefetches.
export function SessionSelect({
  value,
  onChange,
  disabled,
  placeholder = 'Select a session',
}: SessionSelectProps) {
  const { data, isLoading } = useSessions();
  const sessions = data?.data ?? [];

  return (
    <Select value={value ?? undefined} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={isLoading ? 'Loading sessions…' : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {sessions.map((session) => (
          <SelectItem key={session.id} value={session.id}>
            {session.name}
            {session.isCurrent ? ' (current)' : ''}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
