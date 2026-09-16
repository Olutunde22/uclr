import { z } from 'zod';

// DecisionDto (backend/src/modules/registrations/dto/decision.dto.ts) makes
// `comment` optional at the API layer for either decision, but this build's
// UX rule (PLAN.md's adviser/HOD pages) requires one on reject so the
// student always sees why. Approve has no form at all (a direct button) so
// there's nothing to validate there.
export const rejectSchema = z.object({
  comment: z
    .string()
    .trim()
    .min(1, 'A comment is required to reject a registration.')
    .max(2000, 'Keep the comment under 2000 characters.'),
});

export type RejectFormData = z.infer<typeof rejectSchema>;
