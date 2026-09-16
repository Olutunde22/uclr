import type { ReactNode } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { QueryProvider } from '@/app/providers/query-provider';
import { ThemeProvider } from '@/app/providers/theme-provider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        {children}
        <Toaster richColors closeButton />
      </QueryProvider>
    </ThemeProvider>
  );
}
