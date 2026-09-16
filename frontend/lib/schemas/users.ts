import { z } from 'zod';
import { STAFF_ROLES, type RoleName } from '@/types/users';

// Schema-first (forms.md). The create form shows profile fields conditionally
// on the selected roles (PLAN.md: "role selection drives which profile
// fields show"), so those fields are optional at the type level and made
// required per-role in superRefine — one schema, cross-field rules attached
// to the exact input the role choice unlocked.
export const createUserFormSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Enter an email address.')
      .email('Enter a valid email address.'),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    firstName: z.string().min(1, 'Enter a first name.'),
    lastName: z.string().min(1, 'Enter a last name.'),
    phone: z.string().optional(),
    roles: z.array(z.string()).min(1, 'Select at least one role.'),
    // Student profile — required only when `roles` includes "student".
    matricNo: z.string().optional(),
    departmentId: z.string().optional(),
    level: z.coerce.number().optional(),
    programme: z.string().optional(),
    gender: z.string().optional(),
    adviserId: z.string().nullable().optional(),
    // Staff profile — required only when `roles` includes a staff role.
    // Named distinctly from the student's `departmentId` since a (rare) user
    // with both a student and a staff role would need both independently.
    staffId: z.string().optional(),
    staffDepartmentId: z.string().nullable().optional(),
    rank: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    const isStudent = val.roles.includes('student');
    const isStaff = val.roles.some((r) => STAFF_ROLES.includes(r as RoleName));

    if (isStudent) {
      if (!val.matricNo)
        ctx.addIssue({
          code: 'custom',
          message: 'Enter a matric no.',
          path: ['matricNo'],
        });
      if (!val.departmentId)
        ctx.addIssue({
          code: 'custom',
          message: 'Select a department.',
          path: ['departmentId'],
        });
      if (!val.level || ![100, 200, 300, 400, 500].includes(val.level))
        ctx.addIssue({
          code: 'custom',
          message: 'Select a level.',
          path: ['level'],
        });
      if (!val.programme)
        ctx.addIssue({
          code: 'custom',
          message: 'Enter a programme.',
          path: ['programme'],
        });
      if (!val.gender)
        ctx.addIssue({
          code: 'custom',
          message: 'Select a gender.',
          path: ['gender'],
        });
    }

    if (isStaff) {
      if (!val.staffId)
        ctx.addIssue({
          code: 'custom',
          message: 'Enter a staff ID.',
          path: ['staffId'],
        });
      if (!val.rank)
        ctx.addIssue({
          code: 'custom',
          message: 'Enter a rank.',
          path: ['rank'],
        });
    }
  });

export type CreateUserFormValues = z.infer<typeof createUserFormSchema>;

export const updateUserSchema = z.object({
  firstName: z.string().min(1, 'Enter a first name.'),
  lastName: z.string().min(1, 'Enter a last name.'),
  phone: z.string().optional(),
  roles: z.array(z.string()).min(1, 'Select at least one role.'),
});

export type UpdateUserFormData = z.infer<typeof updateUserSchema>;

export const studentProfileSchema = z.object({
  matricNo: z.string().min(1, 'Enter a matric no.').max(30),
  departmentId: z.string().min(1, 'Select a department.'),
  level: z.coerce
    .number()
    .refine((v): v is 100 | 200 | 300 | 400 | 500 =>
      [100, 200, 300, 400, 500].includes(v),
    ),
  programme: z.string().min(1, 'Enter a programme.'),
  gender: z.string().min(1, 'Select a gender.'),
  adviserId: z.string().nullable().optional(),
});

export type StudentProfileFormData = z.infer<typeof studentProfileSchema>;

export const staffProfileSchema = z.object({
  staffId: z.string().min(1, 'Enter a staff ID.').max(30),
  departmentId: z.string().nullable().optional(),
  rank: z.string().min(1, 'Enter a rank.'),
});

export type StaffProfileFormData = z.infer<typeof staffProfileSchema>;
