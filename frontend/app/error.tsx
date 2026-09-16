'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/error-state';

// Segment-level error boundary. Without this file, any unexpected throw
// during a Server Component's render (as opposed to a Server Action, which
// services/auth.ts's comment covers separately) fell through to Next's
// built-in default error page — an unbranded white screen. Next.js redacts
// the real error message here too in a production build (same mechanism as
// the Server Action case, `error.message` becomes a generic "error occurred
// in the Server Components render..." string with a `digest`), so this
// boundary's job is presentation, not recovering the original message: a
// branded fallback with a retry button and the digest for support to look up
// server-side logs by, not a diagnostic display.
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="w-full max-w-md">
        <ErrorState
          title="Something went wrong"
          message={
            error.digest
              ? `An unexpected error occurred. Reference: ${error.digest}`
              : 'An unexpected error occurred. Please try again.'
          }
          onRetry={reset}
        />
        <div className="mt-4 flex justify-center">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">Go to dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
