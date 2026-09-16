import { Skeleton } from '@/components/ui/skeleton';

export default function CourseDetailLoading() {
  return (
    <div className="max-w-3xl space-y-6">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}
