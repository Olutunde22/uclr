'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { RegisteredCourseList } from '@/components/registration/registered-course-list';
import { useOwnRegistration } from '@/hooks/use-registrations';
import { useSemesters } from '@/hooks/use-calendar';
import type { ApprovalDecisionStatus } from '@/types/registrations';

const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  pending_adviser: 'Pending adviser approval',
  pending_hod: 'Pending HOD approval',
  approved: 'Approved',
  rejected: 'Rejected',
  finalised: 'Finalised',
};

function decisionBadge(status: ApprovalDecisionStatus) {
  if (status === 'approved') return <Badge>Approved</Badge>;
  if (status === 'rejected') return <Badge variant="destructive">Rejected</Badge>;
  return <Badge variant="secondary">Pending</Badge>;
}

function formatDate(value?: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleString();
}

// PLAN.md's `/registration/status`: current status plus the adviser/HOD
// approval trail (comments, decided-at timestamps).
export function StatusView() {
  const { data: semestersResult } = useSemesters();
  const currentSemester = (semestersResult?.data ?? []).find((s) => s.isCurrent);
  const { data, isLoading, isError } = useOwnRegistration(currentSemester?.id);
  const registration = data?.data ?? null;

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Loading…</p>;
  }

  if (isError) {
    return (
      <EmptyState
        title="Couldn't load your registration"
        description={data?.message}
      />
    );
  }

  if (!registration) {
    return (
      <EmptyState
        title="No registration yet"
        description="You haven't started a registration for the current semester."
      />
    );
  }

  const approval = registration.approval;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Status</CardTitle>
          <Badge variant="secondary">{STATUS_LABEL[registration.status]}</Badge>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>
            Semester: {registration.semester?.session?.name ?? ''}{' '}
            {registration.semester?.name === 'first' ? 'First' : 'Second'} semester
          </p>
          <p>Total credit units: {registration.totalUnits}</p>
          {registration.submittedAt ? (
            <p className="text-muted-foreground">
              Submitted {formatDate(registration.submittedAt)}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {approval ? (
        <Card>
          <CardHeader>
            <CardTitle>Approval trail</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-start justify-between gap-4 border-b pb-3">
              <div>
                <p className="font-medium">Academic adviser</p>
                {approval.adviser ? (
                  <p className="text-muted-foreground">
                    {approval.adviser.firstName} {approval.adviser.lastName}
                  </p>
                ) : null}
                {approval.adviserComment ? (
                  <p className="text-muted-foreground mt-1">
                    &ldquo;{approval.adviserComment}&rdquo;
                  </p>
                ) : null}
                {approval.adviserDecidedAt ? (
                  <p className="text-muted-foreground text-xs">
                    Decided {formatDate(approval.adviserDecidedAt)}
                  </p>
                ) : null}
              </div>
              {decisionBadge(approval.adviserStatus)}
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">HOD</p>
                {approval.hod ? (
                  <p className="text-muted-foreground">
                    {approval.hod.firstName} {approval.hod.lastName}
                  </p>
                ) : null}
                {approval.hodComment ? (
                  <p className="text-muted-foreground mt-1">
                    &ldquo;{approval.hodComment}&rdquo;
                  </p>
                ) : null}
                {approval.hodDecidedAt ? (
                  <p className="text-muted-foreground text-xs">
                    Decided {formatDate(approval.hodDecidedAt)}
                  </p>
                ) : null}
              </div>
              {decisionBadge(approval.hodStatus)}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <RegisteredCourseList registration={registration} />
        </CardContent>
      </Card>
    </div>
  );
}
