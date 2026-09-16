'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCourses } from '@/hooks/use-courses';

interface CourseSelectProps {
  value?: string;
  onChange: (courseId: string) => void;
  /** Scope the candidate list to one department — the backend allows any
   * course as a prerequisite, but a same-department list keeps the picker
   * short and sane (this build's own judgement call, see PROGRESS.md). */
  departmentId?: string;
  /** Course ids to hide — the course itself and prerequisites already added. */
  excludeIds?: string[];
  disabled?: boolean;
  placeholder?: string;
}

// Prerequisite picker — a course select over real GET /courses data, never a
// typed course code (forms.md's FK rule). Backs both the HOD's general
// add-prerequisite action and the lecturer's own-course equivalent.
export function CourseSelect({
  value,
  onChange,
  departmentId,
  excludeIds = [],
  disabled,
  placeholder = 'Select a course',
}: CourseSelectProps) {
  const { data, isLoading } = useCourses(
    departmentId ? { departmentId } : {},
  );
  const courses = (data?.data ?? []).filter((c) => !excludeIds.includes(c.id));

  return (
    <Select value={value ?? undefined} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={isLoading ? 'Loading courses…' : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {courses.map((course) => (
          <SelectItem key={course.id} value={course.id}>
            {course.code} - {course.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
