'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { type ReactNode, useState } from 'react';
import { getQueryClient } from '@/app/get-query-client';

export function QueryProvider({ children }: { children: ReactNode }) {
  // useState (not a module-level constant) so the browser singleton survives
  // re-renders without being recreated, while getQueryClient() still returns
  // a fresh instance per request on the server — see get-query-client.ts.
  const [queryClient] = useState(getQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' ? (
        <ReactQueryDevtools initialIsOpen={false} />
      ) : null}
    </QueryClientProvider>
  );
}
