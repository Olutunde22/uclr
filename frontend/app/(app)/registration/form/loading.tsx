import { Skeleton } from '@/components/ui/skeleton';

export default function RegistrationFormLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-[32rem] w-full" />
    </div>
  );
}
