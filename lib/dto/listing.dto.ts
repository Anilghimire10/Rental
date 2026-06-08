import type { CategoryRow, ListingRow, ProfileRow } from "@/lib/types/database";
import type {
  AdminListing,
  OwnerListing,
  PublicListingCard,
  PublicListingDetail,
} from "@/lib/types";
import { jitterCoord, listingSlug } from "@/lib/utils";

/**
 * Listing serializers — the single source of truth for COLUMN-level privacy.
 * (RLS controls ROW access; these control which columns each audience receives.)
 *
 * CRITICAL INVARIANT: toPublicCard / toPublicDetail MUST NOT expose:
 *   latitude/longitude (exact), owner_name, owner_phone, owner_whatsapp,
 *   owner_email, exact_address, owner_id, status, rejection_reason.
 * They build fresh objects and never spread the raw row, so a new private DB
 * column is excluded by default.
 */

type CatLookup = Map<string, string>; // category_id -> name

export function toPublicCard(row: ListingRow, cats?: CatLookup): PublicListingCard {
  return {
    id: row.id,
    propertyCode: row.property_code,
    slug: listingSlug({ propertyCode: row.property_code, title: row.title, area: row.area }),
    title: row.title,
    categoryName: row.category_id ? cats?.get(row.category_id) ?? null : null,
    monthlyRent: row.monthly_rent,
    area: row.area,
    city: row.city,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    areaSqft: row.area_sqft,
    coverImage: row.cover_image ?? row.gallery_images?.[0] ?? null,
    amenities: row.amenities ?? [],
    isFeatured: row.is_featured,
    isRented: row.is_rented,
    isNegotiable: row.is_negotiable,
    availableFrom: row.available_from,
    createdAt: row.created_at,
  };
}

export function toPublicDetail(row: ListingRow, cats?: CatLookup): PublicListingDetail {
  return {
    ...toPublicCard(row, cats),
    description: row.description,
    securityDeposit: row.security_deposit,
    advanceRequired: row.advance_required,
    electricityIncluded: row.electricity_included,
    waterIncluded: row.water_included,
    wardNumber: row.ward_number,
    nearbyLandmark: row.nearby_landmark,
    // APPROXIMATE only — jitter the exact coordinates so the public never gets the pin.
    approxLat: jitterCoord(row.latitude),
    approxLng: jitterCoord(row.longitude),
    gallery: row.gallery_images ?? [],
    totalRooms: row.total_rooms,
    kitchens: row.kitchens,
    floorNumber: row.floor_number,
    isRented: row.is_rented,
    viewCount: row.view_count,
  };
}

export function toOwnerListing(
  row: ListingRow,
  counts: { inquiries: number; visits: number },
  cats?: CatLookup,
): OwnerListing {
  return {
    ...toPublicDetail(row, cats),
    status: row.status,
    rejectionReason: row.rejection_reason,
    exactAddress: row.exact_address,
    exactLat: row.latitude,
    exactLng: row.longitude,
    ownerName: row.owner_name,
    ownerPhone: row.owner_phone,
    ownerWhatsapp: row.owner_whatsapp,
    ownerEmail: row.owner_email,
    inquiryCount: counts.inquiries, // COUNT only
    visitCount: counts.visits,
    updatedAt: row.updated_at,
  };
}

export function toAdminListing(
  row: ListingRow,
  account: Pick<ProfileRow, "name" | "email"> | null,
  counts: { inquiries: number; visits: number },
  cats?: CatLookup,
): AdminListing {
  return {
    ...toOwnerListing(row, counts, cats),
    ownerId: row.owner_id,
    ownerName: row.owner_name,
    ownerPhone: row.owner_phone,
    ownerWhatsapp: row.owner_whatsapp,
    ownerEmail: row.owner_email,
    accountOwnerName: account?.name ?? "—",
    accountOwnerEmail: account?.email ?? "—",
  };
}

export function categoryLookup(rows: CategoryRow[] | null | undefined): CatLookup {
  return new Map((rows ?? []).map((c) => [c.id, c.name]));
}
