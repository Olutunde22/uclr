import { Skeleton } from '@/components/ui/skeleton';

// Shaped like CoursesListView's real layout (routing.md): a title bar, a
// filter row, then a table-sized block.
export default function DepartmentCoursesLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-56" />
      <div className="flex justify-between gap-3">
        <Skeleton className="h-9 w-96" />
        <Skeleton className="h-9 w-32" />
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
