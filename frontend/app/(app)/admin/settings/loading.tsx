import { Skeleton } from '@/components/ui/skeleton';

export default function AdminSettingsLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-72 w-full max-w-lg" />
    </div>
  );
}
