// Mirrors backend/src/modules/courses/entities/*.ts and its DTOs.
import type { Department } from './academics';
import type { User } from './users';

export type CourseSemester = 'first' | 'second';

export type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday';

export const WEEKDAY_OPTIONS: { value: Weekday; label: string }[] = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
];

export const COURSE_LEVELS = [100, 200, 300, 400, 500] as const;
export type CourseLevel = (typeof COURSE_LEVELS)[number];

export interface TimetableSlot {
  id: string;
  courseId: string;
  day: Weekday;
  startTime: string;
  endTime: string;
  venue: string;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  departmentId: string;
  department?: Department;
  code: string;
  title: string;
  creditUnits: number;
  level: CourseLevel;
  semester: CourseSemester;
  capacity: number;
  lecturerId?: string | null;
  lecturer?: User | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// GET /courses/:id additionally embeds prerequisites/timetableSlots
// (CoursesService.findOne), the list endpoints don't.
export interface CourseDetail extends Course {
  prerequisites: Course[];
  timetableSlots: TimetableSlot[];
}

export interface ListCoursesFilters {
  departmentId?: string;
  level?: CourseLevel;
  semester?: CourseSemester;
  isActive?: boolean;
}

export interface CreateCourseRequest {
  departmentId: string;
  code: string;
  title: string;
  creditUnits: number;
  level: CourseLevel;
  semester: CourseSemester;
  capacity: number;
  lecturerId?: string | null;
}

export type UpdateCourseRequest = Partial<CreateCourseRequest> & {
  isActive?: boolean;
};

export interface CreateTimetableSlotRequest {
  day: Weekday;
  startTime: string;
  endTime: string;
  venue: string;
}

export type UpdateTimetableSlotRequest = Partial<CreateTimetableSlotRequest>;

// GET /courses/:id/class-list row shape (CoursesService.ClassListRow).
export interface ClassListRow {
  studentId: string;
  matricNo: string;
  name: string;
  level: number;
  programme: string;
  department: string;
  registrationStatus: string;
}
