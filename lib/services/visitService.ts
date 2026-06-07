import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin, getCurrentUser } from "@/lib/auth/session";
import { toAdminVisit, toTenantVisit } from "@/lib/dto/inquiry.dto";
import {
  notifyAdminNewVisit,
  notifyOwnerNewEngagement,
  notifyTenantVisitConfirmed,
} from "@/lib/services/notificationService";
import type { VisitInput } from "@/lib/validation/inquiry.schema";
import type { ListingRow, VisitRequestRow, VisitStatus } from "@/lib/types/database";
import type { AdminVisit, TenantVisit } from "@/lib/types";

type ListingLite = Pick<
  ListingRow,
  "id" | "title" | "area" | "property_code" | "owner_name" | "owner_phone" | "owner_whatsapp" | "owner_email"
>;
const LITE = "id, title, area, property_code, owner_name, owner_phone, owner_whatsapp, owner_email";

export async function createVisit(input: VisitInput): Promise<string> {
  const admin = createAdminClient();
  const user = await getCurrentUser();

  const { data: listing } = await admin
    .from("listings")
    .select(LITE + ", status, is_rented")
    .eq("id", input.listingId)
    .maybeSingle();
  const l = listing as (ListingLite & { status: string; is_rented: boolean }) | null;
  if (!l || l.status !== "approved" || l.is_rented) {
    throw new Error("This property is not available for visits.");
  }

  const { data, error } = await admin
    .from("visit_requests")
    .insert({
      listing_id: input.listingId,
      tenant_id: user?.id ?? null,
      name: input.name,
      phone: input.phone,
      preferred_date: input.preferredDate || null,
      preferred_time: input.preferredTime || null,
      notes: input.notes || "",
      status: "pending",
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  await Promise.allSettled([
    notifyAdminNewVisit({
      propertyCode: l.property_code,
      listingTitle: l.title,
      name: input.name,
      phone: input.phone,
      preferredDate: input.preferredDate || null,
      preferredTime: input.preferredTime || null,
    }),
    notifyOwnerNewEngagement({
      to: l.owner_email,
      propertyCode: l.property_code,
      listingTitle: l.title,
      kind: "visit",
    }),
  ]);

  return (data as { id: string }).id;
}

export async function getMyVisits(): Promise<TenantVisit[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  const supabase = createClient();
  const { data, error } = await supabase
    .from("visit_requests")
    .select("*")
    .eq("tenant_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const rows = data as VisitRequestRow[];
  const listings = await fetchListingsLite(rows.map((r) => r.listing_id));
  return rows.filter((r) => listings[r.listing_id]).map((r) => toTenantVisit(r, listings[r.listing_id]));
}

export async function adminListVisits(status?: VisitStatus): Promise<AdminVisit[]> {
  await requireAdmin();
  const admin = createAdminClient();
  let q = admin.from("visit_requests").select("*").order("created_at", { ascending: false });
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  const rows = data as VisitRequestRow[];
  const listings = await fetchListingsLite(rows.map((r) => r.listing_id), true);
  return rows.map((r) => toAdminVisit(r, listings[r.listing_id] ?? emptyListing(r.listing_id)));
}

export async function updateVisit(
  visitId: string,
  patch: { status?: VisitStatus; adminNotes?: string },
): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();
  const update: Partial<VisitRequestRow> = {};
  if (patch.status) update.status = patch.status;
  if (typeof patch.adminNotes === "string") update.admin_notes = patch.adminNotes;

  const { data, error } = await admin
    .from("visit_requests")
    .update(update)
    .eq("id", visitId)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  const row = data as VisitRequestRow;

  // On confirmation, email the tenant (if we have their email on profile).
  if (patch.status === "confirmed" && row.tenant_id) {
    const { data: profile } = await admin
      .from("profiles")
      .select("email, name")
      .eq("id", row.tenant_id)
      .maybeSingle();
    const listing = (await fetchListingsLite([row.listing_id]))[row.listing_id];
    if (profile && listing) {
      await notifyTenantVisitConfirmed({
        to: (profile as { email: string }).email,
        name: row.name,
        propertyCode: listing.property_code,
        listingTitle: listing.title,
        date: row.preferred_date,
        time: row.preferred_time,
      });
    }
  }
}

// --- helpers ----------------------------------------------------------------
async function fetchListingsLite(ids: string[], withOwner = false): Promise<Record<string, ListingLite>> {
  const out: Record<string, ListingLite> = {};
  if (ids.length === 0) return out;
  const admin = createAdminClient();
  const cols = withOwner ? LITE : "id, title, area, property_code";
  const { data } = await admin.from("listings").select(cols).in("id", Array.from(new Set(ids)));
  for (const row of (data as ListingLite[] | null) ?? []) out[row.id] = row;
  return out;
}
function emptyListing(id: string): ListingLite {
  return { id, title: "(deleted listing)", area: "—", property_code: "—", owner_name: null, owner_phone: null, owner_whatsapp: null, owner_email: null };
}
