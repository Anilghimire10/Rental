import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin, requireUser, requireVerified, AuthError } from "@/lib/auth/session";
import {
  categoryLookup,
  toAdminListing,
  toOwnerListing,
  toPublicCard,
  toPublicDetail,
} from "@/lib/dto/listing.dto";
import { listingSlug } from "@/lib/utils";
import type { ListingInput } from "@/lib/validation/listing.schema";
import type { CategoryRow, ListingRow, ProfileRow } from "@/lib/types/database";
import type {
  AdminListing,
  ListingSearchParams,
  OwnerListing,
  Paginated,
  PublicListingCard,
  PublicListingDetail,
} from "@/lib/types";

/**
 * listingService — all listing data access. UI never touches the DB directly.
 *  - Public reads: RLS-bound server client (only ever returns approved rows) +
 *    DTOs that strip private columns (owner contact, exact lat/lng).
 *  - Owner reads/writes: RLS client + explicit ownership checks.
 *  - Admin ops: service-role client AFTER requireAdmin().
 */

// Amenity tokens used for boolean filters (match the master AMENITIES list).
const FURNISHED = "Furnished";
const PET = "Pet Allowed";
const ATTACHED_BATH = "Attached Bathroom";
const PARKING = ["Bike Parking", "Car Parking"];

async function getCategoryLookup() {
  const supabase = createClient();
  const { data } = await supabase.from("categories").select("*");
  return categoryLookup(data as CategoryRow[]);
}

function dbToWrite(input: ListingInput, ownerId: string) {
  return {
    owner_id: ownerId,
    title: input.title,
    category_id: input.categoryId,
    description: input.description,
    monthly_rent: input.monthlyRent,
    security_deposit: input.securityDeposit,
    advance_required: input.advanceRequired,
    is_negotiable: input.isNegotiable,
    electricity_included: input.electricityIncluded,
    water_included: input.waterIncluded,
    available_from: input.availableFrom || null,
    area: (input.area && input.area.trim()) || input.city || "Pokhara",
    ward_number: input.wardNumber ?? null,
    city: input.city || "Pokhara",
    nearby_landmark: input.nearbyLandmark || null,
    latitude: input.latitude,
    longitude: input.longitude,
    owner_name: input.ownerName || null,
    owner_phone: input.ownerPhone || null,
    owner_whatsapp: input.ownerWhatsapp || null,
    owner_email: input.ownerEmail || null,
    exact_address: input.exactAddress || null,
    cover_image: input.coverImage || null,
    gallery_images: input.galleryImages,
    total_rooms: input.totalRooms,
    bedrooms: input.bedrooms,
    kitchens: input.kitchens,
    bathrooms: input.bathrooms,
    floor_number: input.floorNumber ?? null,
    area_sqft: input.areaSqft ?? null,
    amenities: input.amenities,
  };
}

// ---------------------------------------------------------------------------
// PUBLIC / TENANT
// ---------------------------------------------------------------------------

export async function searchPublicListings(
  params: ListingSearchParams,
): Promise<Paginated<PublicListingCard>> {
  const supabase = createClient();
  const cats = await getCategoryLookup();
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 12;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let categoryId: string | undefined;
  if (params.categorySlug) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", params.categorySlug)
      .maybeSingle();
    categoryId = (cat as { id: string } | null)?.id;
    if (!categoryId) {
      return { items: [], total: 0, page, pageSize, totalPages: 1 };
    }
  }

  let query = supabase
    .from("listings")
    .select("*", { count: "exact" })
    .eq("status", "approved")
    .eq("is_rented", false);

  if (params.q) query = query.ilike("title", `%${params.q}%`);
  if (params.area) query = query.ilike("area", `%${params.area}%`);
  if (categoryId) query = query.eq("category_id", categoryId);
  if (typeof params.minRent === "number") query = query.gte("monthly_rent", params.minRent);
  if (typeof params.maxRent === "number") query = query.lte("monthly_rent", params.maxRent);
  if (params.furnished) query = query.contains("amenities", [FURNISHED]);
  if (params.petFriendly) query = query.contains("amenities", [PET]);
  if (params.attachedBathroom) query = query.contains("amenities", [ATTACHED_BATH]);
  if (params.parking) query = query.overlaps("amenities", PARKING);
  if (params.availableNow) {
    const today = new Date().toISOString().slice(0, 10);
    query = query.or(`available_from.is.null,available_from.lte.${today}`);
  }

  switch (params.sort) {
    case "rent_asc":
      query = query.order("monthly_rent", { ascending: true });
      break;
    case "rent_desc":
      query = query.order("monthly_rent", { ascending: false });
      break;
    case "popular":
      query = query.order("view_count", { ascending: false });
      break;
    default:
      query = query
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });
  }

  const { data, count, error } = await query.range(from, to);
  if (error) throw new Error(error.message);

  const items = (data as ListingRow[]).map((r) => toPublicCard(r, cats));
  const total = count ?? 0;
  return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getFeaturedListings(limit = 6): Promise<PublicListingCard[]> {
  const supabase = createClient();
  const cats = await getCategoryLookup();
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "approved")
    .eq("is_rented", false)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data as ListingRow[]).map((r) => toPublicCard(r, cats));
}

export async function getLatestListings(limit = 8): Promise<PublicListingCard[]> {
  const supabase = createClient();
  const cats = await getCategoryLookup();
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "approved")
    .eq("is_rented", false)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data as ListingRow[]).map((r) => toPublicCard(r, cats));
}

/** Approved, available listings in a given category slug (empty if none/unknown). */
export async function getListingsByCategorySlug(
  slug: string,
  limit = 4,
): Promise<PublicListingCard[]> {
  const supabase = createClient();
  const { data: cat } = await supabase.from("categories").select("id").eq("slug", slug).maybeSingle();
  const catId = (cat as { id: string } | null)?.id;
  if (!catId) return [];

  const cats = await getCategoryLookup();
  const { data } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "approved")
    .eq("is_rented", false)
    .eq("category_id", catId)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as ListingRow[] | null)?.map((r) => toPublicCard(r, cats)) ?? [];
}

/** Look up by SEO propertyCode (case-insensitive). Returns null if not public. */
export async function getPublicListingByCode(
  propertyCode: string,
): Promise<PublicListingDetail | null> {
  const supabase = createClient();
  const cats = await getCategoryLookup();
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .ilike("property_code", propertyCode)
    .eq("status", "approved")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toPublicDetail(data as ListingRow, cats) : null;
}

export async function getSimilarListings(
  detail: PublicListingDetail,
  limit = 3,
): Promise<PublicListingCard[]> {
  const supabase = createClient();
  const cats = await getCategoryLookup();
  const { data } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "approved")
    .eq("is_rented", false)
    .eq("area", detail.area)
    .neq("id", detail.id)
    .limit(limit);
  return (data as ListingRow[] | null)?.map((r) => toPublicCard(r, cats)) ?? [];
}

/** All approved listings as approximate map points (no private data). */
export async function getMapPoints(params: ListingSearchParams) {
  const { items } = await searchPublicListings({ ...params, page: 1, pageSize: 48 });
  // Re-fetch detail to expose approxLat/Lng (already jittered in the DTO).
  const supabase = createClient();
  const cats = await getCategoryLookup();
  const ids = items.map((i) => i.id);
  if (ids.length === 0) return [];
  const { data } = await supabase.from("listings").select("*").in("id", ids);
  return (data as ListingRow[]).map((r) => {
    const d = toPublicDetail(r, cats);
    return {
      id: d.id,
      slug: d.slug,
      title: d.title,
      monthlyRent: d.monthlyRent,
      area: d.area,
      approxLat: d.approxLat,
      approxLng: d.approxLng,
      coverImage: d.coverImage,
    };
  });
}

/** Lightweight slug + updatedAt list for the dynamic sitemap. */
export async function getSitemapEntries(): Promise<{ slug: string; updatedAt: string }[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("listings")
    .select("property_code, title, area, updated_at")
    .eq("status", "approved")
    .eq("is_rented", false)
    .order("updated_at", { ascending: false })
    .limit(5000);
  return (data as Pick<ListingRow, "property_code" | "title" | "area" | "updated_at">[] | null)?.map((r) => ({
    slug: listingSlug({ propertyCode: r.property_code, title: r.title, area: r.area }),
    updatedAt: r.updated_at,
  })) ?? [];
}

/** Fire-and-forget view counter (anonymous-safe RPC). */
export async function recordView(listingId: string): Promise<void> {
  const supabase = createClient();
  await supabase.rpc("increment_listing_view", { p_id: listingId });
}

// ---------------------------------------------------------------------------
// OWNER
// ---------------------------------------------------------------------------

export async function createListing(input: ListingInput): Promise<string> {
  // Any verified, non-banned user may list a property — no separate "owner" role.
  const user = await requireVerified();
  const supabase = createClient();
  const { data, error } = await supabase
    .from("listings")
    .insert({ ...dbToWrite(input, user.id), status: "pending", is_featured: false })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return (data as { id: string }).id;
}

export async function getOwnerListings(): Promise<OwnerListing[]> {
  const user = await requireUser();
  const supabase = createClient();
  const cats = await getCategoryLookup();
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  const rows = data as ListingRow[];
  const counts = await countEngagement(rows.map((r) => r.id));
  return rows.map((r) => toOwnerListing(r, counts[r.id] ?? { inquiries: 0, visits: 0 }, cats));
}

export async function getOwnerListing(id: string): Promise<OwnerListing | null> {
  const user = await requireUser();
  const supabase = createClient();
  const cats = await getCategoryLookup();
  let q = supabase.from("listings").select("*").eq("id", id);
  if (user.role !== "admin") q = q.eq("owner_id", user.id);
  const { data, error } = await q.maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const counts = await countEngagement([id]);
  return toOwnerListing(data as ListingRow, counts[id] ?? { inquiries: 0, visits: 0 }, cats);
}

export async function updateListing(id: string, input: ListingInput): Promise<void> {
  const user = await requireUser();
  const supabase = createClient();
  const { data: existing } = await supabase
    .from("listings")
    .select("id, owner_id")
    .eq("id", id)
    .maybeSingle();
  if (!existing) throw new AuthError("Listing not found.", 403);
  if ((existing as { owner_id: string }).owner_id !== user.id && user.role !== "admin") {
    throw new AuthError("You can only edit your own listings.", 403);
  }
  // Editing re-submits for approval.
  const { error } = await supabase
    .from("listings")
    .update({ ...dbToWrite(input, (existing as { owner_id: string }).owner_id), status: "pending", rejection_reason: null })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function setListingRented(id: string, isRented: boolean): Promise<void> {
  const user = await requireUser();
  const supabase = createClient();
  let q = supabase.from("listings").update({ is_rented: isRented }).eq("id", id);
  if (user.role !== "admin") q = q.eq("owner_id", user.id);
  const { error } = await q;
  if (error) throw new Error(error.message);
}

export async function deleteListing(id: string): Promise<void> {
  const user = await requireUser();
  const supabase = createClient();
  let q = supabase.from("listings").delete().eq("id", id);
  if (user.role !== "admin") q = q.eq("owner_id", user.id);
  const { error } = await q;
  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------------------------
// ADMIN (service-role, after requireAdmin)
// ---------------------------------------------------------------------------

export async function adminListListings(opts?: {
  status?: "pending" | "approved" | "rejected";
  q?: string;
}): Promise<AdminListing[]> {
  await requireAdmin();
  const admin = createAdminClient();
  const cats = categoryLookup((await admin.from("categories").select("*")).data as CategoryRow[]);

  let query = admin.from("listings").select("*").order("created_at", { ascending: false });
  if (opts?.status) query = query.eq("status", opts.status);
  if (opts?.q) query = query.ilike("title", `%${opts.q}%`);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  const rows = data as ListingRow[];

  const accounts = await fetchAccounts(rows.map((r) => r.owner_id));
  const counts = await countEngagement(rows.map((r) => r.id));
  return rows.map((r) =>
    toAdminListing(r, accounts[r.owner_id] ?? null, counts[r.id] ?? { inquiries: 0, visits: 0 }, cats),
  );
}

export async function getPendingListings(): Promise<AdminListing[]> {
  return adminListListings({ status: "pending" });
}

export async function getAdminListing(id: string): Promise<AdminListing | null> {
  await requireAdmin();
  const admin = createAdminClient();
  const cats = categoryLookup((await admin.from("categories").select("*")).data as CategoryRow[]);
  const { data, error } = await admin.from("listings").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const row = data as ListingRow;
  const accounts = await fetchAccounts([row.owner_id]);
  const counts = await countEngagement([id]);
  return toAdminListing(row, accounts[row.owner_id] ?? null, counts[id] ?? { inquiries: 0, visits: 0 }, cats);
}

export async function moderateListing(
  listingId: string,
  action: "approve" | "reject",
  rejectionReason?: string,
): Promise<ListingRow> {
  await requireAdmin();
  const admin = createAdminClient();
  const patch =
    action === "approve"
      ? { status: "approved" as const, rejection_reason: null }
      : { status: "rejected" as const, rejection_reason: rejectionReason || "Not specified" };
  const { data, error } = await admin.from("listings").update(patch).eq("id", listingId).select("*").single();
  if (error) throw new Error(error.message);
  return data as ListingRow;
}

export async function setFeatured(listingId: string, isFeatured: boolean): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("listings").update({ is_featured: isFeatured }).eq("id", listingId);
  if (error) throw new Error(error.message);
}

export async function adminDeleteListing(listingId: string): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("listings").delete().eq("id", listingId);
  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Inquiry + visit COUNTS per listing via the service-role client (owners have
 * no RLS row access to inquiries/visits). Returns ONLY aggregates.
 */
export async function countEngagement(
  listingIds: string[],
): Promise<Record<string, { inquiries: number; visits: number }>> {
  const out: Record<string, { inquiries: number; visits: number }> = {};
  if (listingIds.length === 0) return out;
  const admin = createAdminClient();
  for (const id of listingIds) out[id] = { inquiries: 0, visits: 0 };

  const [{ data: inq }, { data: vis }] = await Promise.all([
    admin.from("inquiries").select("listing_id").in("listing_id", listingIds),
    admin.from("visit_requests").select("listing_id").in("listing_id", listingIds),
  ]);
  for (const r of (inq as { listing_id: string }[] | null) ?? []) {
    if (out[r.listing_id]) out[r.listing_id].inquiries += 1;
  }
  for (const r of (vis as { listing_id: string }[] | null) ?? []) {
    if (out[r.listing_id]) out[r.listing_id].visits += 1;
  }
  return out;
}

async function fetchAccounts(
  ownerIds: string[],
): Promise<Record<string, Pick<ProfileRow, "name" | "email">>> {
  if (ownerIds.length === 0) return {};
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("id, name, email")
    .in("id", Array.from(new Set(ownerIds)));
  const map: Record<string, Pick<ProfileRow, "name" | "email">> = {};
  for (const a of (data as (Pick<ProfileRow, "name" | "email"> & { id: string })[]) ?? []) {
    map[a.id] = { name: a.name, email: a.email };
  }
  return map;
}
