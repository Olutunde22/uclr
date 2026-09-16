import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { AppSidebar } from '@/components/shell/app-sidebar';
import { AppTopbar } from '@/components/shell/app-topbar';
import { requireSession } from '@/lib/route-access';

// The authenticated shell (decision gate answer 8: single layout, sidebar
// built from session.permissions — not parallel-route slots). Authentication
// itself is middleware's job (see middleware.ts); this redirect is a
// defensive fallback for the rare gap where a request reaches here with no
// valid session (e.g. the cookie expired between middleware's check and this
// render), not the primary guard.
export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireSession();
  if (!user) redirect('/login');

  return (
    <div className="flex min-h-screen">
      <AppSidebar user={user} />
      <div className="flex flex-1 flex-col">
        <AppTopbar user={user} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
