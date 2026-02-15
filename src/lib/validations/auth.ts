import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Name must be at least 2 characters').optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type SignupFormValues = z.infer<typeof signupSchema>;

export const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').optional().nullable(),
  default_currency: z.string().min(1, 'Currency is required'),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
