import { Skeleton } from '@/components/ui/skeleton';

// Shaped like DashboardView's real layout (routing.md): a title-width bar,
// then a grid of card-sized blocks, not a centered spinner.
export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    </div>
  );
}
