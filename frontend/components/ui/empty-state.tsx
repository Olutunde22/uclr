import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

// Shared "nothing here yet" primitive (per PLAN.md's frontend foundation
// notes: `components/ui/*` gets `data-table.tsx`, `error-state.tsx`,
// `empty-state.tsx` alongside the shadcn primitives). Used directly on empty
// reads and inside data-table.tsx's empty row. Design pass, 2026-09-16: added
// an icon and slightly more generous spacing so it reads as a deliberate
// state rather than blank space.
interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <div className="bg-muted mb-1 flex size-10 items-center justify-center rounded-full">
        <Inbox className="text-muted-foreground size-5" />
      </div>
      <p className="text-sm font-medium">{title}</p>
      {description ? (
        <p className="text-muted-foreground max-w-sm text-sm">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
