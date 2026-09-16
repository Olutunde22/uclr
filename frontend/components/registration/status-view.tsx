'use client';

import Link from 'next/link';
import { FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge, statusTone } from '@/components/shared/status-badge';
import { RegisteredCourseList } from '@/components/registration/registered-course-list';
import { useOwnRegistration } from '@/hooks/use-registrations';
import { useSemesters } from '@/hooks/use-calendar';
import type { ApprovalDecisionStatus, RegistrationStatus } from '@/types/registrations';

const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  pending_adviser: 'Pending adviser approval',
  pending_hod: 'Pending HOD approval',
  approved: 'Approved',
  rejected: 'Rejected',
  finalised: 'Finalised',
};

// What the student should do or expect next at each status - the "what
// happens next" copy the design pass added alongside the badge, so a status
// page never just states a fact with no guidance attached.
const STATUS_NEXT_STEP: Record<RegistrationStatus, string> = {
  draft: 'Finish selecting your courses and submit for approval.',
  pending_adviser: "Your registration is awaiting your academic adviser's decision.",
  pending_hod: "Your adviser approved your registration. It's now awaiting HOD approval.",
  approved: 'Your registration is approved. You can now download your course form below.',
  rejected: 'Your registration was rejected - see the comment below, then edit and resubmit.',
  finalised:
    'Your registration has been finalised by the registry for this semester. You can still download your course form.',
};

function decisionBadge(status: ApprovalDecisionStatus) {
  const label = status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Pending';
  return <StatusBadge tone={statusTone(status)}>{label}</StatusBadge>;
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
          <StatusBadge tone={statusTone(registration.status)}>
            {STATUS_LABEL[registration.status]}
          </StatusBadge>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="space-y-1">
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
          </div>

          <p className="text-muted-foreground border-t pt-3">
            {STATUS_NEXT_STEP[registration.status]}
          </p>

          {registration.status === 'approved' || registration.status === 'finalised' ? (
            <Button asChild>
              <Link href="/registration/form">
                <FileDown className="size-4" />
                Download your course form
              </Link>
            </Button>
          ) : null}

          {registration.status === 'rejected' ? (
            <Button asChild variant="outline">
              <Link href="/registration">Edit and resubmit your registration</Link>
            </Button>
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
