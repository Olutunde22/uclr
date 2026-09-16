import type { ReactNode } from 'react';

// Shared "nothing here yet" primitive (per PLAN.md's frontend foundation
// notes: `components/ui/*` gets `data-table.tsx`, `error-state.tsx`,
// `empty-state.tsx` alongside the shadcn primitives). Used directly on empty
// reads and inside data-table.tsx's empty row.
interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 py-10 text-center">
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
