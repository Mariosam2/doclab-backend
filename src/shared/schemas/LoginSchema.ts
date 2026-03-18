import { z } from 'zod/v4';

export const LoginSchema = z
  .object({
    username: z.string().min(4, "Username's too short").max(30, "Username's too long").optional(),
    email: z.email().optional(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(64, 'Password must be at most 64 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[a-z]/, 'Must contain a lowercase letter')
      .regex(/[0-9]/, 'Must contain a number')
      .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
  })
  .refine((data) => data.username || data.email, {
    message: 'username or email is required',
  });
