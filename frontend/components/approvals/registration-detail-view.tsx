'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'nextjs-toploader/app';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/shared/status-badge';
import { RegisteredCourseList } from '@/components/registration/registered-course-list';
import { RejectDecisionDialog } from '@/components/approvals/reject-decision-dialog';
import {
  useAdviserDecide,
  useAdviserQueue,
  useHodDecide,
  useHodQueue,
} from '@/hooks/use-approvals';

interface RegistrationDetailViewProps {
  id: string;
  role: 'adviser' | 'hod';
}

// There is no single GET /registrations/:id or /approvals/:id — the adviser
// and HOD only ever see a registration through their queue (see
// PROGRESS.md's Known issues / services/approvals.ts). This reads the
// already-fetched queue from the React Query cache and finds the one
// registration by id, the same "no per-item read exists" pattern milestone
// 11's lecturer prerequisites dialog used for its own course cache.
export function RegistrationDetailView({ id, role }: RegistrationDetailViewProps) {
  const router = useRouter();
  const adviserQuery = useAdviserQueue();
  const hodQuery = useHodQueue();
  const { data } = role === 'adviser' ? adviserQuery : hodQuery;
  const registration = (data?.data ?? []).find((r) => r.id === id);

  const adviserDecide = useAdviserDecide();
  const hodDecide = useHodDecide();
  const decideMutation = role === 'adviser' ? adviserDecide : hodDecide;

  const [approveComment, setApproveComment] = useState('');
  const [rejectOpen, setRejectOpen] = useState(false);

  if (!registration) {
    return (
      <EmptyState
        title="Not in your queue"
        description="This registration isn't currently waiting on your decision - it may already have been decided, or you followed a stale link."
        action={
          <Button asChild variant="outline">
            <Link href="/approvals">Back to approvals</Link>
          </Button>
        }
      />
    );
  }

  async function decide(decision: 'approved' | 'rejected', comment?: string) {
    const result = await decideMutation.mutateAsync({ id, decision, comment });
    if (!result.data) {
      toast.error(result.message || 'Failed to record your decision.');
      return;
    }
    toast.success(
      decision === 'approved' ? 'Registration approved.' : 'Registration rejected.',
    );
    router.push('/approvals');
  }

  const studentName = registration.student
    ? `${registration.student.firstName} ${registration.student.lastName}`
    : 'This student';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{studentName}</CardTitle>
          <StatusBadge tone="warning">
            {registration.status === 'pending_adviser'
              ? 'Pending adviser approval'
              : 'Pending HOD approval'}
          </StatusBadge>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p className="text-muted-foreground">{registration.student?.email}</p>
          <p>Total credit units: {registration.totalUnits}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Courses submitted</CardTitle>
        </CardHeader>
        <CardContent>
          <RegisteredCourseList registration={registration} />
          <p className="text-muted-foreground mt-2 text-xs">
            This is the submission as it was validated at submit time - all rule
            checks (prerequisites, clashes, capacity, credit load) already passed.
          </p>
        </CardContent>
      </Card>

      {role === 'hod' && registration.approval ? (
        <Card>
          <CardHeader>
            <CardTitle>Adviser&apos;s decision</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>
              {registration.approval.adviser
                ? `${registration.approval.adviser.firstName} ${registration.approval.adviser.lastName}`
                : 'Adviser'}{' '}
              approved this registration.
            </p>
            {registration.approval.adviserComment ? (
              <p className="text-muted-foreground">
                &ldquo;{registration.approval.adviserComment}&rdquo;
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Your decision</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="Optional comment for approval"
            value={approveComment}
            onChange={(e) => setApproveComment(e.target.value)}
            rows={2}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => decide('approved', approveComment.trim() || undefined)}
              disabled={decideMutation.isPending}
            >
              {decideMutation.isPending ? 'Working…' : 'Approve'}
            </Button>
            <Button
              variant="destructive"
              onClick={() => setRejectOpen(true)}
              disabled={decideMutation.isPending}
            >
              Reject
            </Button>
          </div>
          <p className="text-muted-foreground border-t pt-3 text-xs">
            {role === 'adviser'
              ? 'Approving sends this registration on to HOD approval. Rejecting sends your comment straight back to the student, who can edit and resubmit.'
              : 'Approving this registration lets the student download their course form immediately. Rejecting sends your comment straight back to the student, who can edit and resubmit.'}
          </p>
        </CardContent>
      </Card>

      <RejectDecisionDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        studentName={studentName}
        loading={decideMutation.isPending}
        onReject={(comment) => decide('rejected', comment)}
      />
    </div>
  );
}
