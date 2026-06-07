import { z } from "zod";

const phoneOptional = z
  .string()
  .trim()
  .max(20)
  .regex(/^[+0-9()\s-]*$/, "Enter a valid phone")
  .optional()
  .or(z.literal(""));

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  phone: phoneOptional,
  whatsapp: phoneOptional,
});

export const adminUpdateUserSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["tenant", "owner", "admin"]).optional(),
  plan: z.enum(["free", "premium", "featured"]).optional(),
  isBanned: z.boolean().optional(),
});

// --- Category management (admin) -------------------------------------------
export const categorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2, "Name is too short").max(60),
  isActive: z.coerce.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
});

// --- Advertisement management (admin) --------------------------------------
export const advertisementSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(2).max(120),
  image: z.string().url("Image URL required"),
  linkUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  position: z.enum(["home_hero", "sidebar", "search_top"]).default("home_hero"),
  isActive: z.coerce.boolean().default(true),
});
