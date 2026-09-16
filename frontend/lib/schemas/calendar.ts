import { z } from 'zod';

// Matches CreateSessionDto's regex exactly (backend/.../calendar/dto/create-session.dto.ts).
export const sessionSchema = z.object({
  name: z
    .string()
    .regex(/^\d{4}\/\d{4}$/, 'Enter a session like "2025/2026".'),
});

export type SessionFormData = z.infer<typeof sessionSchema>;

// sessionId is a select populated from real sessions (GET /calendar/sessions),
// never free text — see components/calendar/semester-form-dialog.tsx.
export const semesterSchema = z.object({
  sessionId: z.string().min(1, 'Select a session.'),
  name: z.enum(['first', 'second']),
});

export type SemesterFormData = z.infer<typeof semesterSchema>;

// Cross-field ordering rules use .refine() with an explicit path (forms.md)
// so each error lands on the field it concerns rather than the form root.
// Every field is optional (UpdateSemesterWindowsDto allows partial updates),
// but any two present fields must still be chronologically consistent.
export const semesterWindowsSchema = z
  .object({
    registrationOpensAt: z.string().optional(),
    registrationClosesAt: z.string().optional(),
    addDropClosesAt: z.string().optional(),
  })
  .refine(
    (v) =>
      !v.registrationOpensAt ||
      !v.registrationClosesAt ||
      new Date(v.registrationClosesAt) > new Date(v.registrationOpensAt),
    {
      message: 'Registration must close after it opens.',
      path: ['registrationClosesAt'],
    },
  )
  .refine(
    (v) =>
      !v.registrationClosesAt ||
      !v.addDropClosesAt ||
      new Date(v.addDropClosesAt) >= new Date(v.registrationClosesAt),
    {
      message: 'Add/drop must close on or after registration closes.',
      path: ['addDropClosesAt'],
    },
  );

export type SemesterWindowsFormData = z.infer<typeof semesterWindowsSchema>;
