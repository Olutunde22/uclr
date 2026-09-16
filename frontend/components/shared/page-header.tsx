import type { ReactNode } from 'react';
import { cn } from 'cn';

// One consistent page header for every route under app/(app) — a title,
// a short description, and an optional right-aligned actions slot (a
// "create" button, a filter control). Design pass, 2026-09-16: every page
// previously hand-rolled the same `<h1>/<p>` pair with slightly different
// spacing; this replaces that markup 1:1 so the typography scale, spacing
// under the title, and the border under the whole header are identical
// everywhere.
interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="text-muted-foreground max-w-2xl text-sm">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
