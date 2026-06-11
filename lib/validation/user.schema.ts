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
  showInNav: z.coerce.boolean().default(false),
  showOnHome: z.coerce.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
});

// --- Advertisement management (admin) --------------------------------------
export const advertisementSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(2).max(120),
  image: z.string().url("Image URL required"),
  // Accept an internal path ("/search?...") OR a full external URL, or leave blank.
  linkUrl: z
    .string()
    .trim()
    .max(500)
    .refine(
      (v) => v === "" || v.startsWith("/") || /^https?:\/\//i.test(v),
      "Use a path like /search or a full https:// URL",
    )
    .optional()
    .or(z.literal("")),
  position: z.enum(["home_hero", "sidebar", "search_top"]).default("home_hero"),
  isActive: z.coerce.boolean().default(true),
});

// --- FAQ management (admin) -------------------------------------------------
export const faqSchema = z.object({
  id: z.string().uuid().optional(),
  category: z.string().trim().min(2, "Group title is too short").max(60).default("General"),
  question: z.string().trim().min(5, "Question is too short").max(200),
  answer: z.string().trim().min(5, "Answer is too short").max(2000),
  isActive: z.coerce.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
});

// --- Site content (admin-edited Terms / Privacy) ---------------------------
export const siteContentSchema = z.object({
  key: z.enum(["terms", "privacy"]),
  title: z.string().trim().min(2).max(120),
  body: z.string().trim().min(10, "Add some content").max(20000),
});

// --- Feedback (public submission) ------------------------------------------
export const feedbackSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email").optional().or(z.literal("")),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  message: z.string().trim().min(5, "Please write a little more").max(2000),
  // Honeypot.
  company: z.string().max(0, "Bot detected").optional().or(z.literal("")),
});
