'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ErrorState } from '@/components/ui/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { DangerConfirm } from '@/components/shared/danger-confirm';
import { LecturerSelect } from '@/components/courses/lecturer-select';
import { PrerequisitesPanel } from '@/components/department-courses/prerequisites-panel';
import { TimetableSlotsPanel } from '@/components/department-courses/timetable-slots-panel';
import {
  courseSchema,
  type CourseFormData,
} from '@/lib/schemas/courses';
import {
  useAssignLecturer,
  useClearLecturer,
  useCourse,
  useUpdateCourse,
} from '@/hooks/use-courses';
import { COURSE_LEVELS } from '@/types/courses';

type CourseFormInput = z.input<typeof courseSchema>;

interface CourseDetailViewProps {
  courseId: string;
}

export function CourseDetailView({ courseId }: CourseDetailViewProps) {
  const { data, isLoading, isError, error, refetch } = useCourse(courseId);
  const updateCourse = useUpdateCourse();
  const assignLecturer = useAssignLecturer();
  const clearLecturer = useClearLecturer();
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [confirmClearLecturer, setConfirmClearLecturer] = useState(false);
  const [lecturerPick, setLecturerPick] = useState<string | undefined>();

  const course = data?.data;

  const form = useForm<CourseFormInput, undefined, CourseFormData>({
    resolver: zodResolver(courseSchema),
    values: course
      ? {
          departmentId: course.departmentId,
          code: course.code,
          title: course.title,
          creditUnits: course.creditUnits,
          level: course.level,
          semester: course.semester,
          capacity: course.capacity,
        }
      : undefined,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !course) {
    return (
      <ErrorState
        message={
          !data?.data && data?.message
            ? data.message
            : error instanceof Error
              ? error.message
              : 'Failed to load this course.'
        }
        onRetry={() => refetch()}
      />
    );
  }

  const onSubmit = async (values: CourseFormData) => {
    // departmentId is intentionally excluded from the payload — this build's
    // judgement call is that moving a course between departments is out of
    // scope for the edit form (see PROGRESS.md's Decisions); it's fixed at
    // creation time.
    const { departmentId: _departmentId, ...rest } = values;
    const result = await updateCourse.mutateAsync({ id: courseId, dto: rest });
    if (!result.data) {
      toast.error(result.message || 'Failed to update course.');
      return;
    }
    toast.success('Course updated.');
  };

  const handleToggleActive = async () => {
    const result = await updateCourse.mutateAsync({
      id: courseId,
      dto: { isActive: !course.isActive },
    });
    if (!result.data) {
      toast.error(result.message || 'Failed to update course status.');
      return;
    }
    toast.success(course.isActive ? 'Course deactivated.' : 'Course activated.');
    setConfirmDeactivate(false);
  };

  const handleAssignLecturer = async () => {
    if (!lecturerPick) return;
    const result = await assignLecturer.mutateAsync({
      id: courseId,
      userId: lecturerPick,
    });
    if (!result.data) {
      toast.error(result.message || 'Failed to assign lecturer.');
      return;
    }
    toast.success('Lecturer assigned.');
    setLecturerPick(undefined);
  };

  const handleClearLecturer = async () => {
    const result = await clearLecturer.mutateAsync(courseId);
    if (!result.data) {
      toast.error(result.message || "Failed to clear the course's lecturer.");
      return;
    }
    toast.success('Lecturer cleared.');
    setConfirmClearLecturer(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-start justify-between">
          <div>
            <CardTitle>
              {course.code} &mdash; {course.title}
            </CardTitle>
            <CardDescription>
              {course.department?.code} - {course.department?.name}
            </CardDescription>
          </div>
          <StatusBadge tone={course.isActive ? 'success' : 'destructive'}>
            {course.isActive ? 'Active' : 'Inactive'}
          </StatusBadge>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course code</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="creditUnits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credit units</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          value={(field.value as number | string | undefined) ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Level</FormLabel>
                      <Select
                        value={String(field.value)}
                        onValueChange={(v) => field.onChange(Number(v))}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COURSE_LEVELS.map((level) => (
                            <SelectItem key={level} value={String(level)}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="semester"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Semester</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Semester" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="first">First</SelectItem>
                          <SelectItem value="second">Second</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          value={(field.value as number | string | undefined) ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Saving…' : 'Save changes'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="justify-end border-t">
          {course.isActive ? (
            <Button variant="destructive" onClick={() => setConfirmDeactivate(true)}>
              Deactivate course
            </Button>
          ) : (
            <Button variant="outline" onClick={handleToggleActive}>
              Activate course
            </Button>
          )}
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lecturer</CardTitle>
          <CardDescription>
            The lecturer who owns this course&apos;s capacity, prerequisites and
            class list under &ldquo;My courses&rdquo;.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {course.lecturer ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {course.lecturer.firstName} {course.lecturer.lastName}
                </p>
                <p className="text-muted-foreground text-sm">
                  {course.lecturer.email}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmClearLecturer(true)}
              >
                Clear
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <LecturerSelect value={lecturerPick} onChange={setLecturerPick} />
              </div>
              <Button
                size="sm"
                disabled={!lecturerPick || assignLecturer.isPending}
                onClick={handleAssignLecturer}
              >
                Assign
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <PrerequisitesPanel course={course} />
      <TimetableSlotsPanel courseId={course.id} slots={course.timetableSlots} />

      <DangerConfirm
        open={confirmDeactivate}
        onOpenChange={setConfirmDeactivate}
        title="Deactivate this course?"
        consequence={
          <>&ldquo;{course.code} - {course.title}&rdquo; will no longer accept new registrations.</>
        }
        impact="Existing approved registrations are unaffected. It can be reactivated later."
        confirmText="Deactivate course"
        cancelText="Keep active"
        loading={updateCourse.isPending}
        onConfirm={handleToggleActive}
      />

      <DangerConfirm
        open={confirmClearLecturer}
        onOpenChange={setConfirmClearLecturer}
        title="Clear this course's lecturer?"
        consequence={
          course.lecturer ? (
            <>
              {course.lecturer.firstName} {course.lecturer.lastName} will
              lose access to this course under &ldquo;My courses&rdquo;,
              including its class list.
            </>
          ) : (
            ''
          )
        }
        impact="The course is unassigned until a new lecturer is chosen."
        confirmText="Clear lecturer"
        cancelText="Keep lecturer"
        loading={clearLecturer.isPending}
        onConfirm={handleClearLecturer}
      />
    </div>
  );
}
