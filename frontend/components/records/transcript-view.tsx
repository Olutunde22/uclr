'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { ErrorState } from '@/components/ui/error-state';
import { useTranscript } from '@/hooks/use-records';
import type { TranscriptResultRow } from '@/types/records';

interface TranscriptViewProps {
  studentId: string;
}

export function TranscriptView({ studentId }: TranscriptViewProps) {
  const { data, isLoading, isError, refetch } = useTranscript(studentId);

  if (isError || (!isLoading && !data?.data)) {
    return (
      <ErrorState
        message={data?.message ?? 'Failed to load the transcript.'}
        onRetry={() => refetch()}
      />
    );
  }

  const transcript = data?.data;

  const columns: DataTableColumn<TranscriptResultRow>[] = [
    { key: 'session', header: 'Session', cell: (r) => r.sessionName },
    { key: 'code', header: 'Course', cell: (r) => r.courseCode },
    { key: 'title', header: 'Title', cell: (r) => r.courseTitle },
    { key: 'units', header: 'Units', cell: (r) => r.creditUnits },
    { key: 'score', header: 'Score', cell: (r) => r.score },
    { key: 'grade', header: 'Grade', cell: (r) => r.grade },
    { key: 'points', header: 'Grade points', cell: (r) => r.gradePoint },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{transcript?.student.name ?? 'Loading…'}</CardTitle>
          <CardDescription>
            {transcript ? (
              <>
                {transcript.student.matricNo} · {transcript.student.department}{' '}
                · Level {transcript.student.level} · {transcript.student.programme}
              </>
            ) : (
              'Loading…'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Badge variant="secondary">GPA {transcript?.gpa.toFixed(2) ?? '-'}</Badge>
          <Badge variant="outline">
            {transcript?.totalCreditUnits ?? 0} total credit units
          </Badge>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        rows={transcript?.results ?? []}
        rowKey={(r) => `${r.sessionName}-${r.courseCode}`}
        isLoading={isLoading}
        emptyTitle="No course results on record"
        emptyDescription="This is a seed-only stub (PLAN.md) - no results-entry UI exists."
      />

      <Link href="/records" className="text-sm underline underline-offset-2">
        Back to records
      </Link>
    </div>
  );
}
