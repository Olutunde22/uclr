'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DangerConfirm } from '@/components/shared/danger-confirm';
import { CourseSelect } from '@/components/courses/course-select';
import { useAddPrerequisite, useRemovePrerequisite } from '@/hooks/use-courses';
import type { Course, CourseDetail } from '@/types/courses';

interface PrerequisitesPanelProps {
  course: CourseDetail;
}

// Shared by the HOD's general course management (this file) and the
// lecturer's own-course equivalent (components/my-courses/prerequisites-
// dialog.tsx) — kept as two thin wrappers rather than one shared component
// since the underlying mutations (addPrerequisite vs addOwnPrerequisite) and
// scoping differ enough to make a shared prop surface awkward.
export function PrerequisitesPanel({ course }: PrerequisitesPanelProps) {
  const addPrerequisite = useAddPrerequisite();
  const removePrerequisite = useRemovePrerequisite();
  const [pick, setPick] = useState<string | undefined>();
  const [target, setTarget] = useState<Course | null>(null);

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

  const excludeIds = [course.id, ...course.prerequisites.map((p) => p.id)];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prerequisites</CardTitle>
        <CardDescription>
          Courses a student must have passed before registering for this one.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {course.prerequisites.length === 0 ? (
          <p className="text-muted-foreground text-sm">No prerequisites set.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {course.prerequisites.map((p) => (
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
        )}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <CourseSelect
              value={pick}
              onChange={setPick}
              departmentId={course.departmentId}
              excludeIds={excludeIds}
              placeholder="Select a course to add"
            />
          </div>
          <Button size="sm" disabled={!pick || addPrerequisite.isPending} onClick={handleAdd}>
            Add
          </Button>
        </div>
      </CardContent>

      <DangerConfirm
        open={!!target}
        onOpenChange={(open) => !open && setTarget(null)}
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
    </Card>
  );
}
