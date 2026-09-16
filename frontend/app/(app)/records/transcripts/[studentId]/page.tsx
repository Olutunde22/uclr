import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { getQueryClient } from '@/app/get-query-client';
import { NoAccess } from '@/components/shared/no-access';
import { TranscriptView } from '@/components/records/transcript-view';
import { recordsKeys } from '@/hooks/keys';
import { canAccess } from '@/lib/page-access';
import { PERMISSIONS } from '@/lib/permissions';
import { getTranscript } from '@/services/records';

interface TranscriptPageProps {
  params: Promise<{ studentId: string }>;
}

export const metadata: Metadata = {
  title: 'Transcript',
  description: "A student's course results and GPA",
  robots: 'noindex, nofollow',
};

// records:read-only, per backend/CLAUDE.md ("Transcript access is
// registry-officer-only, not opened to the student reading their own"). No
// student-search UI exists yet (PLAN.md's milestone scope) — this page's
// only entry point is the /records list's student-name link.
export default async function TranscriptPage({ params }: TranscriptPageProps) {
  if (!(await canAccess(PERMISSIONS.RECORDS_READ))) {
    return <NoAccess />;
  }

  const { studentId } = await params;
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: recordsKeys.transcript(studentId),
    queryFn: () => getTranscript(studentId),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Transcript</h1>
          <p className="text-muted-foreground text-sm">
            All course results on record and the computed GPA.
          </p>
        </div>
        <TranscriptView studentId={studentId} />
      </div>
    </HydrationBoundary>
  );
}
