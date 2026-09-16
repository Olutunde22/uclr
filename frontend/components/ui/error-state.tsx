import { Button } from '@/components/ui/button';

// Shared error primitive for a failed read (see empty-state.tsx's doc
// comment for why this lives in components/ui/). `message` is whatever the
// service's ApiResponse.message resolved to (data-layer.md) — never a raw
// error object.
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
    <div className="border-destructive/30 bg-destructive/5 flex flex-col items-center justify-center gap-2 rounded-md border py-10 text-center">
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
