import type { ReactNode } from 'react';
import { Badge, type badgeVariants } from '@/components/ui/badge';
import type { VariantProps } from 'class-variance-authority';

// One place that turns any ULCRS status string into a badge with a
// consistent, meaningful colour (design pass, 2026-09-16): green for
// approved/cleared/active states, amber for anything still pending, red for
// rejected/inactive/blocked states, and a plain outline for everything else
// (drafts, informational labels). Callers that already know the right tone
// can render `<StatusBadge tone="success">…</StatusBadge>` directly; this
// file's `statusTone()` covers the common status vocabularies (registration,
// approval decision, fee clearance, active/inactive records) so most call
// sites can just do `<StatusBadge tone={statusTone(status)}>{label}</StatusBadge>`.
type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>;

export type StatusTone = 'success' | 'warning' | 'destructive' | 'neutral';

const TONE_TO_VARIANT: Record<StatusTone, BadgeVariant> = {
  success: 'success',
  warning: 'warning',
  destructive: 'destructive',
  neutral: 'outline',
};

const SUCCESS = new Set([
  'approved',
  'finalised',
  'finalized',
  'cleared',
  'active',
  'paid',
]);

const WARNING = new Set([
  'pending',
  'pending_adviser',
  'pending_hod',
  'draft',
  'partial',
]);

const DESTRUCTIVE = new Set([
  'rejected',
  'inactive',
  'disabled',
  'not_cleared',
  'overdue',
  'failed',
]);

/** Best-effort mapping from a raw status string to a semantic tone. */
export function statusTone(status: string): StatusTone {
  const key = status.toLowerCase();
  if (SUCCESS.has(key)) return 'success';
  if (DESTRUCTIVE.has(key)) return 'destructive';
  if (WARNING.has(key)) return 'warning';
  return 'neutral';
}

interface StatusBadgeProps {
  tone: StatusTone;
  children: ReactNode;
  className?: string;
}

export function StatusBadge({ tone, children, className }: StatusBadgeProps) {
  return (
    <Badge variant={TONE_TO_VARIANT[tone]} className={className}>
      {children}
    </Badge>
  );
}
