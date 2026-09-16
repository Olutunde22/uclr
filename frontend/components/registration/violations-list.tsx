import { AlertTriangle } from 'lucide-react';
import type { RuleViolation } from '@/types/registrations';

// RegistrationRulesService.evaluate returns EVERY violation, not just the
// first (PLAN.md: "the student sees all clash and error alerts together") —
// this renders the full list as one alert block, never truncated to one
// message.
interface ViolationsListProps {
  violations: RuleViolation[];
}

export function ViolationsList({ violations }: ViolationsListProps) {
  if (violations.length === 0) return null;

  return (
    <div className="border-destructive/30 bg-destructive/5 space-y-2 rounded-md border p-4">
      <div className="text-destructive flex items-center gap-2 text-sm font-medium">
        <AlertTriangle className="size-4" />
        {violations.length === 1
          ? '1 problem with your selection'
          : `${violations.length} problems with your selection`}
      </div>
      <ul className="text-destructive space-y-1 pl-6 text-sm">
        {violations.map((v, i) => (
          <li key={`${v.rule}-${v.courseId ?? 'general'}-${i}`} className="list-disc">
            {v.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
