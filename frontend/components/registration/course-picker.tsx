'use client';

import { useMemo, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EmptyState } from '@/components/ui/empty-state';
import type { Course } from '@/types/courses';
import type { RuleViolation } from '@/types/registrations';

interface CoursePickerProps {
  courses: Course[];
  selectedIds: string[];
  onToggle: (courseId: string) => void;
  violations: RuleViolation[];
  disabled?: boolean;
}

// The real course multi-select for registration (PLAN.md: "course picker...
// from GET /courses filtered to the current semester"). There is no endpoint
// that scopes the catalogue to a student's own department/level (see
// PROGRESS.md's Known issues — GET /users/:id needs users:read, which
// `student` isn't granted, so a student can't even read their own
// studentProfile to learn it) — this filters department/level client-side
// from options DERIVED from the fetched course list itself (no extra
// request), and defaults to showing everything so nothing is hidden by a
// filter the student didn't choose.
export function CoursePicker({
  courses,
  selectedIds,
  onToggle,
  violations,
  disabled,
}: CoursePickerProps) {
  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState<string>('all');
  const [level, setLevel] = useState<string>('all');

  const departmentOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of courses) {
      if (c.department) map.set(c.department.id, c.department.code);
    }
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [courses]);

  const levelOptions = useMemo(() => {
    const set = new Set<number>();
    for (const c of courses) set.add(c.level);
    return [...set].sort((a, b) => a - b);
  }, [courses]);

  const violationCourseIds = useMemo(
    () => new Set(violations.filter((v) => v.courseId).map((v) => v.courseId)),
    [violations],
  );

  const filtered = courses.filter((c) => {
    if (departmentId !== 'all' && c.departmentId !== departmentId) return false;
    if (level !== 'all' && String(c.level) !== level) return false;
    if (search) {
      const term = search.toLowerCase();
      if (
        !c.code.toLowerCase().includes(term) &&
        !c.title.toLowerCase().includes(term)
      ) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          placeholder="Search by code or title"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={departmentId} onValueChange={setDepartmentId}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {departmentOptions.map(([id, code]) => (
              <SelectItem key={id} value={id}>
                {code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={level} onValueChange={setLevel}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All levels</SelectItem>
            {levelOptions.map((lvl) => (
              <SelectItem key={lvl} value={String(lvl)}>
                {lvl} level
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No courses match"
          description="Try a different search term or clear the filters."
        />
      ) : (
        <div className="max-h-[28rem] overflow-y-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 sticky top-0">
              <tr>
                <th className="w-10 p-2" />
                <th className="p-2 text-left">Code</th>
                <th className="p-2 text-left">Title</th>
                <th className="p-2 text-left">Department</th>
                <th className="p-2 text-left">Level</th>
                <th className="p-2 text-right">Units</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((course) => {
                const checked = selectedIds.includes(course.id);
                const hasViolation = violationCourseIds.has(course.id);
                return (
                  <tr
                    key={course.id}
                    className={
                      'border-t' +
                      (hasViolation ? ' bg-destructive/5' : '') +
                      (checked ? ' bg-accent/40' : '')
                    }
                  >
                    <td className="p-2">
                      <Checkbox
                        checked={checked}
                        disabled={disabled}
                        onCheckedChange={() => onToggle(course.id)}
                        aria-label={`Select ${course.code}`}
                      />
                    </td>
                    <td className="p-2 font-medium">{course.code}</td>
                    <td className="p-2">{course.title}</td>
                    <td className="p-2">{course.department?.code ?? '-'}</td>
                    <td className="p-2">{course.level}</td>
                    <td className="p-2 text-right">{course.creditUnits}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
