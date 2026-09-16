'use client';

import { useState } from 'react';
import { DangerConfirm } from '@/components/shared/danger-confirm';
import { Textarea } from '@/components/ui/textarea';

interface RejectDecisionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  loading?: boolean;
  onReject: (comment: string) => void | Promise<void>;
}

// Reject uses DangerConfirm (this repo's destructive-action pattern) with a
// required comment, per PLAN.md's adviser/HOD pages. DangerConfirm's own API
// has no built-in form field, so the comment lives in local state rendered
// inside its `consequence` slot, and this component validates it itself
// before calling through — an empty comment shows an inline error and keeps
// the dialog open rather than calling onReject.
export function RejectDecisionDialog({
  open,
  onOpenChange,
  studentName,
  loading,
  onReject,
}: RejectDecisionDialogProps) {
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleConfirm() {
    const trimmed = comment.trim();
    if (!trimmed) {
      setError('A comment is required to reject a registration.');
      return;
    }
    setError(null);
    void onReject(trimmed);
  }

  return (
    <DangerConfirm
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setComment('');
          setError(null);
        }
        onOpenChange(next);
      }}
      title="Reject this registration?"
      consequence={
        <div className="space-y-2 text-left">
          <p>
            {studentName} will see this registration as rejected and can edit and
            resubmit it.
          </p>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Explain why you're rejecting this registration"
            rows={3}
          />
          {error ? <p className="text-destructive text-sm">{error}</p> : null}
        </div>
      }
      confirmText="Reject"
      loading={loading}
      onConfirm={handleConfirm}
    />
  );
}
