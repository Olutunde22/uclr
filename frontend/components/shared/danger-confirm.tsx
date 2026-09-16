'use client';

import { useState, type ReactNode } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';

// Required on every irreversible action or anything that revokes access
// (forms.md): disabling a user, clearing a department's HOD. The distinct
// props are the point — a generic "Are you sure?" gives the user nothing to
// decide with. Merely-confirmed actions (re-enabling a user, assigning a
// HOD) use an ordinary dialog/direct action instead; using this everywhere
// makes it noise.
interface DangerConfirmProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** What happens, naming the specific record. Required. */
  consequence: string | ReactNode;
  /** Blast radius beyond the record itself. */
  impact?: string | ReactNode;
  /** A verb phrase - never "OK" or "Yes". Users click "Yes" reflexively. */
  confirmText?: string;
  cancelText?: string;
  /** For the worst cases: force typing the record's name to enable confirm. */
  confirmPhrase?: string;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
}

export function DangerConfirm({
  open,
  onOpenChange,
  title,
  consequence,
  impact,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  confirmPhrase,
  loading,
  onConfirm,
}: DangerConfirmProps) {
  const [typed, setTyped] = useState('');
  const phraseSatisfied = !confirmPhrase || typed.trim() === confirmPhrase;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <span className="block">{consequence}</span>
              {impact ? (
                <span className="text-muted-foreground block text-sm">
                  {impact}
                </span>
              ) : null}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {confirmPhrase ? (
          <Input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={`Type "${confirmPhrase}" to confirm`}
            aria-label={`Type ${confirmPhrase} to confirm`}
          />
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={loading || !phraseSatisfied}
            onClick={(e) => {
              e.preventDefault();
              void onConfirm();
            }}
          >
            {loading ? 'Working…' : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
