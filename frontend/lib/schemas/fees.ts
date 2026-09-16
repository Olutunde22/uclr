import { z } from 'zod';

// studentId is set from the selected search result, not typed by the user
// (forms.md / FK-select rule) — it isn't a field on this schema's form UI,
// only on the request payload the component assembles.
export const paymentSchema = z.object({
  sessionId: z.string().min(1, 'Select a session.'),
  amount: z
    .string()
    .min(1, 'Enter an amount.')
    .regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid amount, e.g. 50000.00.'),
  receiptNo: z.string().min(1, 'Enter a receipt number.').max(100),
  paymentDate: z.string().min(1, 'Select a payment date.'),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;
