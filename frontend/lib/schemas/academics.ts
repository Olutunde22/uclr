import { z } from 'zod';

export const facultySchema = z.object({
  code: z.string().min(1, 'Enter a code.').max(20),
  name: z.string().min(1, 'Enter a name.').max(200),
});

export type FacultyFormData = z.infer<typeof facultySchema>;

export const departmentSchema = z.object({
  facultyId: z.string().min(1, 'Select a faculty.'),
  code: z.string().min(1, 'Enter a code.').max(20),
  name: z.string().min(1, 'Enter a name.').max(200),
});

export type DepartmentFormData = z.infer<typeof departmentSchema>;
