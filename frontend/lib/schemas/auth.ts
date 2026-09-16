import { z } from 'zod';

// Schema-first (forms.md). Identifier accepts email, matric no. or staff ID —
// the backend's UsersService.findByIdentifier resolves all three, so the
// frontend deliberately doesn't validate the shape beyond "not empty".
export const loginSchema = z.object({
  identifier: z.string().min(1, 'Enter your email, matric no. or staff ID.'),
  password: z.string().min(1, 'Enter your password.'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
