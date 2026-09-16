'use client';

import { useEffect } from 'react';

// Root-layout error boundary — catches a crash in app/layout.tsx itself,
// where app/error.tsx can't help because it renders inside that same layout.
// This replaces the entire document, so it must supply its own <html>/<body>
// and can't rely on globals.css/providers/shadcn primitives being mounted
// (the layout that would mount them is what just crashed) — plain inline
// styles only.
export default function GlobalError({
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
    <html lang="en">
      <body
        style={{
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          padding: '1.5rem',
        }}
      >
        <div style={{ maxWidth: '28rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
            Something went wrong
          </h1>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
            {error.digest
              ? `An unexpected error occurred. Reference: ${error.digest}`
              : 'An unexpected error occurred. Please try again.'}
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid #d1d5db',
              background: 'white',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
