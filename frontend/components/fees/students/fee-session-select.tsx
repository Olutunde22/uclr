'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFeeSessionOptions } from '@/hooks/use-fees';

interface FeeSessionSelectProps {
  value?: string;
  onChange: (sessionId: string) => void;
  disabled?: boolean;
}

// The bursary-safe session picker (hooks/use-fees.ts's useFeeSessionOptions
// doc comment explains why this isn't calendar's SessionSelect: bursary
// isn't seeded with calendar:manage, so GET /calendar/sessions 403s for a
// pure bursary account and this hook falls back to real sessions derived
// from GET /fees/payments instead). Still a select over real rows, never
// free text.
export function FeeSessionSelect({
  value,
  onChange,
  disabled,
}: FeeSessionSelectProps) {
  const { sessions, isLoading } = useFeeSessionOptions();

  return (
    <Select value={value ?? undefined} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue
          placeholder={
            isLoading
              ? 'Loading sessions…'
              : sessions.length === 0
                ? 'No sessions available'
                : 'Select a session'
          }
        />
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
