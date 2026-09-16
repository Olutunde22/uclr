import { Skeleton } from '@/components/ui/skeleton';

export default function FeesLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-32 w-full max-w-lg" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
