'use client';

import Link from 'next/link';
import { useRouter } from 'nextjs-toploader/app';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge, statusTone } from '@/components/shared/status-badge';
import { CoursePicker } from '@/components/registration/course-picker';
import { RegisteredCourseList } from '@/components/registration/registered-course-list';
import { ViolationsList } from '@/components/registration/violations-list';
import { useSemesters } from '@/hooks/use-calendar';
import { useCourses } from '@/hooks/use-courses';
import {
  useAddDrop,
  useOwnRegistration,
  useSaveDraft,
  useSubmitRegistration,
  useValidateRegistration,
} from '@/hooks/use-registrations';
import type { RuleViolation } from '@/types/registrations';

const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  pending_adviser: 'Pending adviser approval',
  pending_hod: 'Pending HOD approval',
  approved: 'Approved',
  rejected: 'Rejected',
  finalised: 'Finalised',
};

// The student's course picker, live rule checking, and submit/add-drop flow
// (PLAN.md's `/registration`). Editing is only ever offered for a
// draft/rejected/no-registration state (pick and submit) or an approved one
// (add/drop, gated by the backend's own add-drop-window check — this page
// doesn't try to read the window itself, it just surfaces whatever violation
// `addDrop` returns if the window has closed).
export function RegistrationView() {
  const router = useRouter();
  const { data: semestersResult, isLoading: semestersLoading } = useSemesters();
  const currentSemester = (semestersResult?.data ?? []).find((s) => s.isCurrent);
  const semesterId = currentSemester?.id;

  const { data: registrationResult, isLoading: registrationLoading } =
    useOwnRegistration(semesterId);
  const registration = registrationResult?.data ?? null;

  const { data: coursesResult, isLoading: coursesLoading } = useCourses(
    currentSemester ? { semester: currentSemester.name, isActive: true } : {},
  );
  const courses = useMemo(() => coursesResult?.data ?? [], [coursesResult]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editing, setEditing] = useState(false);
  const [violations, setViolations] = useState<RuleViolation[]>([]);
  const initialisedFor = useRef<string | null>(null);

  const validateMutation = useValidateRegistration();
  const saveDraftMutation = useSaveDraft();
  const submitMutation = useSubmitRegistration();
  const addDropMutation = useAddDrop();

  const canEditFresh =
    !registration || registration.status === 'draft' || registration.status === 'rejected';
  const canAddDrop = registration?.status === 'approved';

  useEffect(() => {
    const key = registration?.id ?? 'none';
    if (initialisedFor.current === key) return;
    initialisedFor.current = key;
    setSelectedIds((registration?.courses ?? []).map((rc) => rc.courseId));
    setEditing(canEditFresh);
    setViolations([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registration?.id]);

  const courseById = useMemo(() => new Map(courses.map((c) => [c.id, c])), [courses]);

  const totalUnits = useMemo(
    () =>
      [...new Set(selectedIds)].reduce(
        (sum, id) => sum + (courseById.get(id)?.creditUnits ?? 0),
        0,
      ),
    [selectedIds, courseById],
  );

  useEffect(() => {
    if (!semesterId || !editing || selectedIds.length === 0) {
      setViolations([]);
      return;
    }
    const timer = setTimeout(() => {
      validateMutation.mutate(
        { semesterId, courseIds: selectedIds },
        {
          onSuccess: (result) => setViolations(result.data?.violations ?? []),
        },
      );
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds, semesterId, editing]);

  function toggleCourse(courseId: string) {
    setSelectedIds((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId],
    );
  }

  async function handleSaveDraft() {
    if (!semesterId) return;
    const result = await saveDraftMutation.mutateAsync({ semesterId, courseIds: selectedIds });
    if (!result.data) {
      toast.error(result.message || 'Failed to save your draft.');
      return;
    }
    toast.success('Draft saved.');
  }

  async function handleSubmitOrUpdate() {
    if (!semesterId) return;
    if (selectedIds.length === 0) {
      toast.error('Select at least one course first.');
      return;
    }

    if (canAddDrop) {
      const result = await addDropMutation.mutateAsync({ semesterId, courseIds: selectedIds });
      if (!result.data || !result.data.valid) {
        setViolations(result.data?.violations ?? []);
        toast.error('Your changes could not be saved. See the problems below.');
        return;
      }
      toast.success('Registration updated and sent back for adviser approval.');
      setEditing(false);
      return;
    }

    const draftResult = await saveDraftMutation.mutateAsync({
      semesterId,
      courseIds: selectedIds,
    });
    if (!draftResult.data) {
      toast.error(draftResult.message || 'Failed to save your draft.');
      return;
    }
    const result = await submitMutation.mutateAsync(semesterId);
    if (!result.data || !result.data.valid) {
      setViolations(result.data?.violations ?? []);
      toast.error('Your registration could not be submitted. See the problems below.');
      return;
    }
    toast.success('Registration submitted for adviser approval.');
    router.push('/registration/status');
  }

  if (semestersLoading || registrationLoading || coursesLoading) {
    return <p className="text-muted-foreground text-sm">Loading…</p>;
  }

  if (!currentSemester || !semesterId) {
    return (
      <Card>
        <CardContent className="text-muted-foreground py-10 text-center text-sm">
          There is no current semester open for registration. Contact the registry.
        </CardContent>
      </Card>
    );
  }

  const isBusy =
    saveDraftMutation.isPending || submitMutation.isPending || addDropMutation.isPending;

  return (
    <div className="space-y-6">
      {registration ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your registration</CardTitle>
            <StatusBadge tone={statusTone(registration.status)}>
              {STATUS_LABEL[registration.status]}
            </StatusBadge>
          </CardHeader>
          <CardContent className="space-y-4">
            {registration.status === 'rejected' ? (
              <div className="border-destructive/30 bg-destructive/5 rounded-md border p-3 text-sm">
                <p className="font-medium">Your registration was rejected.</p>
                {registration.approval?.adviserComment ? (
                  <p className="text-muted-foreground mt-1">
                    Adviser: {registration.approval.adviserComment}
                  </p>
                ) : null}
                {registration.approval?.hodComment ? (
                  <p className="text-muted-foreground mt-1">
                    HOD: {registration.approval.hodComment}
                  </p>
                ) : null}
                <p className="text-muted-foreground mt-1">
                  Update your course selection below and resubmit.
                </p>
              </div>
            ) : null}
            {!editing ? (
              <>
                <RegisteredCourseList registration={registration} />
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline">
                    <Link href="/registration/status">View status and approval trail</Link>
                  </Button>
                  {registration.status === 'approved' || registration.status === 'finalised' ? (
                    <Button asChild>
                      <Link href="/registration/form">
                        <FileDown className="size-4" />
                        Download your course form
                      </Link>
                    </Button>
                  ) : null}
                  {canAddDrop ? (
                    <Button onClick={() => setEditing(true)}>Add/drop courses</Button>
                  ) : null}
                </div>
                {(registration.status === 'pending_adviser' ||
                  registration.status === 'pending_hod') && (
                  <p className="text-muted-foreground text-sm">
                    Your registration is awaiting a decision and can&apos;t be edited right now.
                  </p>
                )}
              </>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {editing ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {canAddDrop ? 'Add or drop courses' : 'Pick your courses'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ViolationsList violations={violations} />
            <CoursePicker
              courses={courses}
              selectedIds={selectedIds}
              onToggle={toggleCourse}
              violations={violations}
              disabled={isBusy}
            />
            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
              <p className="text-sm">
                <span className="font-medium">{selectedIds.length}</span> course
                {selectedIds.length === 1 ? '' : 's'} selected -{' '}
                <span className="font-medium">{totalUnits}</span> credit units
              </p>
              <div className="flex gap-2">
                {canAddDrop ? (
                  <Button variant="outline" onClick={() => setEditing(false)} disabled={isBusy}>
                    Cancel
                  </Button>
                ) : (
                  <Button variant="outline" onClick={handleSaveDraft} disabled={isBusy}>
                    Save draft
                  </Button>
                )}
                <Button onClick={handleSubmitOrUpdate} disabled={isBusy}>
                  {isBusy
                    ? 'Working…'
                    : canAddDrop
                      ? 'Save changes'
                      : 'Submit registration'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
