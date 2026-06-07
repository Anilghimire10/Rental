import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin, getCurrentUser } from "@/lib/auth/session";
import { toAdminInquiry, toTenantInquiry } from "@/lib/dto/inquiry.dto";
import {
  notifyAdminNewInquiry,
  notifyOwnerNewEngagement,
  notifyTenantInquiryReceived,
} from "@/lib/services/notificationService";
import type { InquiryInput } from "@/lib/validation/inquiry.schema";
import type { InquiryRow, InquiryStatus, ListingRow } from "@/lib/types/database";
import type { AdminInquiry, TenantInquiry } from "@/lib/types";

type ListingLite = Pick<
  ListingRow,
  "id" | "title" | "area" | "property_code" | "owner_name" | "owner_phone" | "owner_whatsapp" | "owner_email"
>;
const LITE = "id, title, area, property_code, owner_name, owner_phone, owner_whatsapp, owner_email";

/**
 * Create an inquiry. Anyone (incl. guests) may inquire on an approved listing.
 * Routes to the ADMIN; notifies admin + the tenant + the owner (count-only — no
 * tenant contact reaches the owner). Uses the service-role client so we can read
 * the listing's private owner contact for the admin/owner notifications, but
 * re-validates listing state ourselves (we are not relying on RLS here).
 */
export async function createInquiry(input: InquiryInput): Promise<string> {
  const admin = createAdminClient();
  const user = await getCurrentUser();

  const { data: listing } = await admin
    .from("listings")
    .select(LITE + ", status, is_rented")
    .eq("id", input.listingId)
    .maybeSingle();
  const l = listing as (ListingLite & { status: string; is_rented: boolean }) | null;
  if (!l || l.status !== "approved" || l.is_rented) {
    throw new Error("This property is not available for inquiries.");
  }

  const { data, error } = await admin
    .from("inquiries")
    .insert({
      listing_id: input.listingId,
      tenant_id: user?.id ?? null,
      name: input.name,
      phone: input.phone,
      email: input.email,
      message: input.message || "",
      status: "new",
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  // Best-effort notifications (never block the user).
  await Promise.allSettled([
    notifyAdminNewInquiry({
      propertyCode: l.property_code,
      listingTitle: l.title,
      name: input.name,
      email: input.email,
      phone: input.phone,
      message: input.message || "",
    }),
    notifyTenantInquiryReceived({
      to: input.email,
      name: input.name,
      propertyCode: l.property_code,
      listingTitle: l.title,
    }),
    notifyOwnerNewEngagement({
      to: l.owner_email,
      propertyCode: l.property_code,
      listingTitle: l.title,
      kind: "inquiry",
    }),
  ]);

  return (data as { id: string }).id;
}

/** Tenant's own inquiries (status tracking). */
export async function getMyInquiries(): Promise<TenantInquiry[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  const supabase = createClient();
  const { data, error } = await supabase
    .from("inquiries")
    .select("*")
    .eq("tenant_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const rows = data as InquiryRow[];

  const listings = await fetchListingsLite(rows.map((r) => r.listing_id));
  return rows
    .filter((r) => listings[r.listing_id])
    .map((r) => toTenantInquiry(r, listings[r.listing_id]));
}

// --- Admin (mediator) -------------------------------------------------------

export async function adminListInquiries(status?: InquiryStatus): Promise<AdminInquiry[]> {
  await requireAdmin();
  const admin = createAdminClient();
  let q = admin.from("inquiries").select("*").order("created_at", { ascending: false });
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  const rows = data as InquiryRow[];
  const listings = await fetchListingsLite(rows.map((r) => r.listing_id), true);
  return rows.map((r) =>
    toAdminInquiry(r, listings[r.listing_id] ?? emptyListing(r.listing_id)),
  );
}

export async function updateInquiry(
  inquiryId: string,
  patch: { status?: InquiryStatus; adminNotes?: string },
): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();
  const update: Partial<InquiryRow> = {};
  if (patch.status) update.status = patch.status;
  if (typeof patch.adminNotes === "string") update.admin_notes = patch.adminNotes;
  const { error } = await admin.from("inquiries").update(update).eq("id", inquiryId);
  if (error) throw new Error(error.message);
}

// --- helpers ----------------------------------------------------------------

async function fetchListingsLite(
  ids: string[],
  withOwner = false,
): Promise<Record<string, ListingLite>> {
  const out: Record<string, ListingLite> = {};
  if (ids.length === 0) return out;
  const admin = createAdminClient();
  const cols = withOwner ? LITE : "id, title, area, property_code";
  const { data } = await admin.from("listings").select(cols).in("id", Array.from(new Set(ids)));
  for (const row of (data as ListingLite[] | null) ?? []) out[row.id] = row;
  return out;
}

function emptyListing(id: string): ListingLite {
  return {
    id,
    title: "(deleted listing)",
    area: "—",
    property_code: "—",
    owner_name: null,
    owner_phone: null,
    owner_whatsapp: null,
    owner_email: null,
  };
}
