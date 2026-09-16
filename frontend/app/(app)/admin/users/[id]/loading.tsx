import { Skeleton } from '@/components/ui/skeleton';

export default function EditUserLoading() {
  return (
    <div className="max-w-2xl space-y-6">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
