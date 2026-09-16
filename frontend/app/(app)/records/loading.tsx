import { Skeleton } from '@/components/ui/skeleton';

export default function RecordsLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-40" />
      <div className="flex flex-wrap justify-between gap-3">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-40" />
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
