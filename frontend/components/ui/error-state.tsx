import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Shared error primitive for a failed read (see empty-state.tsx's doc
// comment for why this lives in components/ui/). `message` is whatever the
// service's ApiResponse.message resolved to (data-layer.md) — never a raw
// error object. Design pass, 2026-09-16: added an icon and matched
// empty-state.tsx's spacing so a failed read and an empty read read as
// siblings, not two different visual languages.
interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="border-destructive/30 bg-destructive/5 flex flex-col items-center justify-center gap-2 rounded-lg border px-6 py-12 text-center">
      <div className="bg-destructive/10 mb-1 flex size-10 items-center justify-center rounded-full">
        <AlertTriangle className="text-destructive size-5" />
      </div>
      <p className="text-destructive text-sm font-medium">{title}</p>
      {message ? (
        <p className="text-muted-foreground max-w-sm text-sm">{message}</p>
      ) : null}
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-1">
          Try again
        </Button>
      ) : null}
    </div>
  );
}
