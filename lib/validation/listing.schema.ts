import { z } from "zod";

const optionalDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
  .optional()
  .or(z.literal(""));

const phone = z
  .string()
  .trim()
  .min(7, "Enter a valid phone")
  .max(20)
  .regex(/^[+0-9()\s-]+$/, "Enter a valid phone");

export const listingInputSchema = z.object({
  title: z.string().trim().min(6, "Title is too short").max(140),
  categoryId: z.string().uuid("Choose a category"),
  description: z.string().trim().min(20, "Add a longer description").max(6000),

  // Pricing
  monthlyRent: z.coerce.number().int().min(0).max(100_000_000),
  securityDeposit: z.coerce.number().int().min(0).max(100_000_000).default(0),
  advanceRequired: z.coerce.boolean().default(false),
  availableFrom: optionalDate,

  // Location (city fixed to Pokhara in v1 but accepted as a field)
  area: z.string().trim().min(2, "Add an area").max(120),
  wardNumber: z.coerce.number().int().min(0).max(99).optional(),
  city: z.string().trim().min(2).max(60).default("Pokhara"),
  nearbyLandmark: z.string().trim().max(160).optional().or(z.literal("")),
  latitude: z.coerce.number().min(-90).max(90), // PRIVATE
  longitude: z.coerce.number().min(-180).max(180), // PRIVATE

  // Owner contact (PRIVATE — admin only)
  ownerName: z.string().trim().min(2, "Owner name required").max(80),
  ownerPhone: phone,
  ownerWhatsapp: z
    .string()
    .trim()
    .max(20)
    .regex(/^[+0-9()\s-]*$/, "Enter a valid number")
    .optional()
    .or(z.literal("")),
  ownerEmail: z.string().trim().toLowerCase().email("Enter a valid email").optional().or(z.literal("")),
  exactAddress: z.string().trim().max(240).optional().or(z.literal("")),

  // Media
  coverImage: z.string().url("Add a cover image"),
  galleryImages: z.array(z.string().url()).max(20, "Up to 20 photos").default([]),

  // Details
  totalRooms: z.coerce.number().int().min(0).max(100).default(0),
  bedrooms: z.coerce.number().int().min(0).max(50).default(0),
  kitchens: z.coerce.number().int().min(0).max(20).default(0),
  bathrooms: z.coerce.number().int().min(0).max(50).default(0),
  floorNumber: z.coerce.number().int().min(-2).max(200).optional(),
  areaSqft: z.coerce.number().int().min(0).max(1_000_000).optional(),
  amenities: z.array(z.string().trim().min(1).max(40)).max(40).default([]),
});

export type ListingInput = z.infer<typeof listingInputSchema>;

export const moderateListingSchema = z.object({
  listingId: z.string().uuid(),
  action: z.enum(["approve", "reject"]),
  rejectionReason: z.string().trim().max(500).optional().or(z.literal("")),
});

export const searchParamsSchema = z.object({
  q: z.string().trim().max(120).optional(),
  area: z.string().trim().max(120).optional(),
  categorySlug: z.string().trim().max(60).optional(),
  minRent: z.coerce.number().int().min(0).optional(),
  maxRent: z.coerce.number().int().min(0).optional(),
  furnished: booleanParam(),
  parking: booleanParam(),
  petFriendly: booleanParam(),
  attachedBathroom: booleanParam(),
  availableNow: booleanParam(),
  sort: z.enum(["newest", "rent_asc", "rent_desc", "popular"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(48).default(12),
});

function booleanParam() {
  return z
    .union([z.literal("true"), z.literal("false"), z.boolean()])
    .transform((v) => v === true || v === "true")
    .optional();
}
