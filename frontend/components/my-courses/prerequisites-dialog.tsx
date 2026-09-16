'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DangerConfirm } from '@/components/shared/danger-confirm';
import { CourseSelect } from '@/components/courses/course-select';
import { getQueryClient } from '@/app/get-query-client';
import { coursesKeys } from '@/hooks/keys';
import {
  useAddOwnPrerequisite,
  useRemoveOwnPrerequisite,
} from '@/hooks/use-courses';
import type { ApiResponse } from '@/types/api';
import type { Course, CourseDetail } from '@/types/courses';

interface PrerequisitesDialogProps {
  course: Course;
  trigger: React.ReactNode;
}

// Lecturer's own-course equivalent of components/department-courses/
// prerequisites-panel.tsx, kept separate (see that file's doc comment) since
// the mutations and available data differ: there is no `GET /courses/mine/:id`
// (only list/capacity/prerequisite mutations, per backend/CLAUDE.md), so a
// lecturer can't fetch a single own-course's current prerequisites on first
// open. `useAddOwnPrerequisite`/`useRemoveOwnPrerequisite` cache their
// CourseDetail response under the same `coursesKeys.detail(id)` key an HOD's
// detail page reads (hooks/use-courses.ts), so this dialog reads that cache
// directly — "known prerequisites" builds up as the lecturer adds/removes
// them in this session, and starts empty/unknown otherwise. Documented
// limitation, not a crash: the add/remove actions themselves always work
// regardless of what this dialog can display.
export function PrerequisitesDialog({ course, trigger }: PrerequisitesDialogProps) {
  const [open, setOpen] = useState(false);
  const [pick, setPick] = useState<string | undefined>();
  const [target, setTarget] = useState<Course | null>(null);
  const addPrerequisite = useAddOwnPrerequisite();
  const removePrerequisite = useRemoveOwnPrerequisite();

  const queryClient = getQueryClient();
  const cached = queryClient.getQueryData<ApiResponse<CourseDetail | null>>(
    coursesKeys.detail(course.id),
  );
  const known = cached?.data?.prerequisites ?? [];
  const hasKnownList = !!cached?.data;

  const handleAdd = async () => {
    if (!pick) return;
    const result = await addPrerequisite.mutateAsync({
      id: course.id,
      prerequisiteId: pick,
    });
    if (!result.data) {
      toast.error(result.message || 'Failed to add prerequisite.');
      return;
    }
    toast.success('Prerequisite added.');
    setPick(undefined);
  };

  const handleRemove = async () => {
    if (!target) return;
    const result = await removePrerequisite.mutateAsync({
      id: course.id,
      prerequisiteId: target.id,
    });
    if (!result.data) {
      toast.error(result.message || 'Failed to remove prerequisite.');
      return;
    }
    toast.success('Prerequisite removed.');
    setTarget(null);
  };

  const excludeIds = [course.id, ...known.map((p) => p.id)];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Prerequisites — {course.code}</DialogTitle>
          <DialogDescription>
            Courses a student must have passed before registering for this one.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {hasKnownList ? (
            known.length === 0 ? (
              <p className="text-muted-foreground text-sm">No prerequisites set.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {known.map((p) => (
                  <Badge key={p.id} variant="outline" className="gap-1 py-1 pr-1">
                    {p.code}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 px-1"
                      onClick={() => setTarget(p)}
                    >
                      &times;
                    </Button>
                  </Badge>
                ))}
              </div>
            )
          ) : (
            <p className="text-muted-foreground text-sm">
              Current prerequisites aren&apos;t shown until you add or remove
              one this session (this page has no single-course read). Ask the
              department&apos;s HOD to check the full list on{' '}
              &ldquo;Department courses&rdquo; if needed.
            </p>
          )}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <CourseSelect
                value={pick}
                onChange={setPick}
                excludeIds={excludeIds}
                placeholder="Select a course to add"
              />
            </div>
            <Button size="sm" disabled={!pick || addPrerequisite.isPending} onClick={handleAdd}>
              Add
            </Button>
          </div>
        </div>
      </DialogContent>

      <DangerConfirm
        open={!!target}
        onOpenChange={(next) => !next && setTarget(null)}
        title="Remove this prerequisite?"
        consequence={
          target ? (
            <>&ldquo;{target.code}&rdquo; will no longer be required before registering for {course.code}.</>
          ) : (
            ''
          )
        }
        impact="Students who haven't taken it can register once this is removed."
        confirmText="Remove prerequisite"
        cancelText="Keep prerequisite"
        loading={removePrerequisite.isPending}
        onConfirm={handleRemove}
      />
    </Dialog>
  );
}
