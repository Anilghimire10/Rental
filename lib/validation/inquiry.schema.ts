import { z } from "zod";

const phone = z
  .string()
  .trim()
  .min(7, "Enter a valid phone")
  .max(20)
  .regex(/^[+0-9()\s-]+$/, "Enter a valid phone");

// --- Inquiry ----------------------------------------------------------------
export const inquiryInputSchema = z.object({
  listingId: z.string().uuid(),
  name: z.string().trim().min(2, "Enter your name").max(80),
  phone,
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  // Honeypot — must remain empty.
  company: z.string().max(0, "Bot detected").optional().or(z.literal("")),
});
export type InquiryInput = z.infer<typeof inquiryInputSchema>;

export const updateInquirySchema = z.object({
  inquiryId: z.string().uuid(),
  status: z.enum(["new", "contacted", "resolved"]).optional(),
  adminNotes: z.string().trim().max(5000).optional(),
});

// --- Visit request ----------------------------------------------------------
export const visitInputSchema = z.object({
  listingId: z.string().uuid(),
  name: z.string().trim().min(2, "Enter your name").max(80),
  phone,
  preferredDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .optional()
    .or(z.literal("")),
  preferredTime: z.string().trim().max(40).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  // Honeypot.
  company: z.string().max(0, "Bot detected").optional().or(z.literal("")),
});
export type VisitInput = z.infer<typeof visitInputSchema>;

export const updateVisitSchema = z.object({
  visitId: z.string().uuid(),
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]).optional(),
  adminNotes: z.string().trim().max(5000).optional(),
});
