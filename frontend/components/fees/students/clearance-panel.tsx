'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Switch } from '@/components/ui/switch';
import { DangerConfirm } from '@/components/shared/danger-confirm';
import { StatusBadge } from '@/components/shared/status-badge';
import { useFeeSessionOptions, useIssueClearance, useRevokeClearance } from '@/hooks/use-fees';
import type { AcademicSession } from '@/types/calendar';
import type { User } from '@/types/users';

interface ClearancePanelProps {
  student: User;
}

// There is no GET endpoint for an arbitrary student's fee clearance — only
// the self-scoped GET /fees/me (currentUser.id only) and the issue/revoke
// mutations, which each return just the one row they touched
// (backend/src/modules/fees/fees.service.ts). So this panel can't show a
// searched student's TRUE clearance state on first load; it tracks only
// what this browser session has itself set via the switches below,
// labelling anything else "not yet checked" rather than guessing. See
// PROGRESS.md's Decisions for the full writeup and the suggested backend
// follow-up (a permission-gated read of a specific student's clearances).
export function ClearancePanel({ student }: ClearancePanelProps) {
  const { sessions, isLoading } = useFeeSessionOptions();
  const issueClearance = useIssueClearance();
  const revokeClearance = useRevokeClearance();
  const [known, setKnown] = useState<Record<string, boolean>>({});
  const [revokeTarget, setRevokeTarget] = useState<AcademicSession | null>(null);

  useEffect(() => {
    setKnown({});
  }, [student.id]);

  const handleIssue = (session: AcademicSession) => {
    issueClearance.mutate(
      { studentId: student.id, sessionId: session.id },
      {
        onSuccess: (result) => {
          if (!result.data) {
            toast.error(result.message || 'Failed to issue clearance.');
            return;
          }
          setKnown((prev) => ({ ...prev, [session.id]: true }));
          toast.success(`Clearance issued for ${session.name}.`);
        },
      },
    );
  };

  const handleConfirmRevoke = async () => {
    if (!revokeTarget) return;
    const result = await revokeClearance.mutateAsync({
      studentId: student.id,
      sessionId: revokeTarget.id,
    });
    if (!result.data) {
      toast.error(result.message || 'Failed to revoke clearance.');
      return;
    }
    setKnown((prev) => ({ ...prev, [revokeTarget.id]: false }));
    toast.success(`Clearance revoked for ${revokeTarget.name}.`);
    setRevokeTarget(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fee clearance</CardTitle>
        <CardDescription>
          Issue or revoke this student&rsquo;s clearance per session. Status
          reflects only what has been set in this browser session.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground text-sm">Loading sessions…</p>
        ) : sessions.length === 0 ? (
          <EmptyState
            title="No sessions available"
            description="No academic session could be loaded to set clearance against. Record a payment first, or ask the registry officer/ICT admin to check calendar access."
          />
        ) : (
          <ul className="space-y-2">
            {sessions.map((session) => {
              const state = known[session.id];
              return (
                <li
                  key={session.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{session.name}</p>
                    {state === undefined ? (
                      <p className="text-muted-foreground text-xs">
                        Not yet checked this session
                      </p>
                    ) : (
                      <StatusBadge tone={state ? 'success' : 'destructive'}>
                        {state ? 'Cleared' : 'Not cleared'}
                      </StatusBadge>
                    )}
                  </div>
                  <Switch
                    checked={!!state}
                    onCheckedChange={(checked) =>
                      checked ? handleIssue(session) : setRevokeTarget(session)
                    }
                    disabled={issueClearance.isPending || revokeClearance.isPending}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
      <DangerConfirm
        open={!!revokeTarget}
        onOpenChange={(open) => !open && setRevokeTarget(null)}
        title="Revoke this student's clearance?"
        consequence={
          revokeTarget ? (
            <>
              {student.firstName} {student.lastName} will lose fee clearance
              for &ldquo;{revokeTarget.name}&rdquo;.
            </>
          ) : (
            ''
          )
        }
        impact="They won't be able to submit or add/drop a registration for this session until cleared again."
        confirmText="Revoke clearance"
        cancelText="Keep clearance"
        loading={revokeClearance.isPending}
        onConfirm={handleConfirmRevoke}
      />
    </Card>
  );
}
