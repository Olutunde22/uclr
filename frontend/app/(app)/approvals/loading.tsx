import { Skeleton } from '@/components/ui/skeleton';

export default function ApprovalsLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
