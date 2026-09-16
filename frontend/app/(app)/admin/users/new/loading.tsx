import { Skeleton } from '@/components/ui/skeleton';

export default function NewUserLoading() {
  return (
    <div className="max-w-2xl space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
