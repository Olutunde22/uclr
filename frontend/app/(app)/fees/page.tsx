import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getQueryClient } from '@/app/get-query-client';
import { MyFeesView } from '@/components/fees/my-fees-view';
import { feesKeys } from '@/hooks/keys';
import { requireSession } from '@/lib/route-access';
import { getOwnFeeStatus } from '@/services/fees';

export const metadata: Metadata = {
  title: 'Fees',
  description: 'Your fee balance and clearance status',
  robots: 'noindex, nofollow',
};

// Open to any authenticated user, not gated by a permission (PLAN.md: a
// student reads their own status; GET /fees/me is deliberately
// permission-less and self-scoped — see backend/CLAUDE.md). Same
// requireSession() pattern as the dashboard stub, not page-access.ts's
// canAccess(...permission).
export default async function FeesPage() {
  const user = await requireSession();
  if (!user) redirect('/login');

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: feesKeys.me(undefined),
    queryFn: () => getOwnFeeStatus(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Fees</h1>
          <p className="text-muted-foreground text-sm">
            Your fee clearance status and payment history, per session.
          </p>
        </div>
        <MyFeesView />
      </div>
    </HydrationBoundary>
  );
}
