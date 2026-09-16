import { z } from 'zod';

// The three system_settings rows (PLAN.md) as one typed form, not a generic
// key/value editor. `z.coerce.number()` since values arrive as strings from
// <input type="number"> and from the backend (SystemSetting.value is a
// plain string column).
export const settingsSchema = z
  .object({
    minCreditUnits: z.coerce
      .number()
      .int('Must be a whole number.')
      .positive('Must be positive.'),
    maxCreditUnits: z.coerce
      .number()
      .int('Must be a whole number.')
      .positive('Must be positive.'),
    passMark: z.coerce
      .number()
      .int('Must be a whole number.')
      .min(0, 'Must be at least 0.')
      .max(100, 'Must be at most 100.'),
  })
  .refine((v) => v.maxCreditUnits > v.minCreditUnits, {
    message: 'Maximum credit units must be greater than the minimum.',
    path: ['maxCreditUnits'],
  });

export type SettingsFormData = z.infer<typeof settingsSchema>;
