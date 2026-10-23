import { z } from 'zod';

// TEMPORARY: same rules as spec Section 12. Once Bhuvana publishes lib/validators/*,
// import her schemas here instead so both sides share one source of truth.

export const passwordSchema = z
  .string()
  .min(8, 'At least 8 characters')
  .regex(/[A-Z]/, 'Include an uppercase letter')
  .regex(/[a-z]/, 'Include a lowercase letter')
  .regex(/[0-9]/, 'Include a digit');

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Enter your full name').max(100, 'Too long'),
    email: z.string().trim().email('Enter a valid email'),
    phone: z
      .string()
      .optional()
      .refine((v) => !v || /^[0-9+ -]{10,15}$/.test(v), 'Enter a valid phone number (10-15 digits)'),
    password: passwordSchema,
    role: z.enum(['BUYER', 'AGENT']),
    agencyName: z.string().trim().optional(),
    licenseNo: z.string().trim().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.role === 'AGENT') {
      if (!v.agencyName) ctx.addIssue({ code: 'custom', path: ['agencyName'], message: 'Agency name is required' });
      if (!v.licenseNo) ctx.addIssue({ code: 'custom', path: ['licenseNo'], message: 'Licence number is required' });
    }
  });
export type RegisterFormValues = z.infer<typeof registerSchema>;
