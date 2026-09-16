'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ReactNode } from 'react';

// Dark mode is first-class from day one (decision gate answers 6-7). Uses
// the `class` strategy to match globals.css's `.dark` selector and the
// `@custom-variant dark (&:is(.dark *))` Tailwind v4 variant shadcn wired up.
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
