import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getQueryClient } from '@/app/get-query-client';
import { DashboardView } from '@/components/dashboard/dashboard-view';
import { authKeys } from '@/hooks/keys';
import { requireSession } from '@/lib/route-access';
import { getMe } from '@/services/auth';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your ULCRS dashboard',
  robots: 'noindex, nofollow',
};

export default async function DashboardPage() {
  // Guard before prefetch (routing.md). Open to any authenticated user per
  // PLAN.md's actor table ("/" — dashboard for the user's role"); no finer
  // capability is required, so this is requireSession() rather than
  // page-access.ts's canAccess(...permission).
  const user = await requireSession();
  if (!user) redirect('/login');

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    // Must match hooks/use-auth.ts's useSession() key exactly.
    queryKey: authKeys.session(),
    queryFn: () => getMe(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardView />
    </HydrationBoundary>
  );
}
