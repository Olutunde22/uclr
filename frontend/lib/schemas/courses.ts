import { z } from 'zod';

// Matches CreateCourseDto/UpdateCourseDto exactly (backend/.../courses/dto).
// departmentId is a real id sourced from a select — see the "Foreign-key
// fields are selects, never free text" rule in frontend/CLAUDE.md. For an
// HOD caller it's fixed to their own (inferred) department rather than user
// -editable at all, so this schema doesn't distinguish the two cases.
export const courseSchema = z.object({
  departmentId: z.string().min(1, 'Select a department.'),
  code: z.string().min(1, 'Enter a course code.').max(20),
  title: z.string().min(1, 'Enter a course title.').max(200),
  creditUnits: z.coerce.number().int().min(1, 'Enter at least 1 credit unit.'),
  level: z.coerce
    .number()
    .refine((v): v is 100 | 200 | 300 | 400 | 500 =>
      [100, 200, 300, 400, 500].includes(v),
    ),
  semester: z.enum(['first', 'second']),
  capacity: z.coerce.number().int().min(1, 'Enter a capacity of at least 1.'),
});

export type CourseFormData = z.infer<typeof courseSchema>;

// Matches CreateTimetableSlotDto's 24h HH:MM pattern exactly.
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export const timetableSlotSchema = z
  .object({
    day: z.enum([
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ]),
    startTime: z
      .string()
      .regex(TIME_PATTERN, 'Enter a time like 09:00 (24h).'),
    endTime: z.string().regex(TIME_PATTERN, 'Enter a time like 11:00 (24h).'),
    venue: z.string().min(1, 'Enter a venue.').max(100),
  })
  .refine((v) => v.startTime < v.endTime, {
    message: 'End time must be after start time.',
    path: ['endTime'],
  });

export type TimetableSlotFormData = z.infer<typeof timetableSlotSchema>;

export const capacitySchema = z.object({
  capacity: z.coerce.number().int().min(1, 'Enter a capacity of at least 1.'),
});

export type CapacityFormData = z.infer<typeof capacitySchema>;
