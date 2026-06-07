import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters")
  .regex(/[a-z]/, "Include a lowercase letter")
  .regex(/[A-Z]/, "Include an uppercase letter")
  .regex(/[0-9]/, "Include a number");

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: emailSchema,
  password: passwordSchema,
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(20)
    .regex(/^[+0-9()\s-]+$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
  role: z.enum(["tenant", "owner"]).default("tenant"),
  // Honeypot — must stay empty. Bots fill hidden fields.
  website: z.string().max(0, "Bot detected").optional().or(z.literal("")),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password"),
});

export const resetRequestSchema = z.object({ email: emailSchema });

export const updatePasswordSchema = z.object({ password: passwordSchema });

export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
