import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/session";
import type { DashboardStats } from "@/lib/types";

/** Admin dashboard stats. Service-role aggregates only — no PII leaves here. */
export async function getDashboardStats(): Promise<DashboardStats> {
  await requireAdmin();
  const admin = createAdminClient();

  const countOf = async (
    table: "listings" | "profiles" | "inquiries" | "visit_requests",
    filter?: (q: ReturnType<ReturnType<typeof createAdminClient>["from"]>) => unknown,
  ) => {
    let q = admin.from(table).select("*", { count: "exact", head: true });
    if (filter) q = filter(q) as typeof q;
    const { count } = await q;
    return count ?? 0;
  };

  const [
    totalProperties,
    activeProperties,
    pendingApprovals,
    totalUsers,
    totalInquiries,
    newInquiries,
    totalVisits,
    pendingVisits,
  ] = await Promise.all([
    countOf("listings"),
    countOf("listings", (q) => (q as any).eq("status", "approved").eq("is_rented", false)),
    countOf("listings", (q) => (q as any).eq("status", "pending")),
    countOf("profiles"),
    countOf("inquiries"),
    countOf("inquiries", (q) => (q as any).eq("status", "new")),
    countOf("visit_requests"),
    countOf("visit_requests", (q) => (q as any).eq("status", "pending")),
  ]);

  const { data: mv } = await admin
    .from("listings")
    .select("id, property_code, title, view_count")
    .order("view_count", { ascending: false })
    .limit(1)
    .maybeSingle();

  const mostViewed = mv
    ? {
        id: (mv as any).id,
        propertyCode: (mv as any).property_code,
        title: (mv as any).title,
        viewCount: (mv as any).view_count,
      }
    : null;

  return {
    totalProperties,
    activeProperties,
    pendingApprovals,
    totalUsers,
    totalInquiries,
    newInquiries,
    totalVisits,
    pendingVisits,
    mostViewed,
  };
}

/** Recent activity feed (latest listings + inquiries + visits, merged). */
export async function getRecentActivity(limit = 8) {
  await requireAdmin();
  const admin = createAdminClient();
  const [listings, inquiries, visits] = await Promise.all([
    admin.from("listings").select("property_code, title, status, created_at").order("created_at", { ascending: false }).limit(limit),
    admin.from("inquiries").select("name, created_at, listing_id").order("created_at", { ascending: false }).limit(limit),
    admin.from("visit_requests").select("name, created_at, listing_id").order("created_at", { ascending: false }).limit(limit),
  ]);

  const events: { type: string; label: string; at: string }[] = [];
  for (const l of (listings.data as any[]) ?? [])
    events.push({ type: "listing", label: `New ${l.status} listing ${l.property_code} — ${l.title}`, at: l.created_at });
  for (const i of (inquiries.data as any[]) ?? [])
    events.push({ type: "inquiry", label: `Inquiry from ${i.name}`, at: i.created_at });
  for (const v of (visits.data as any[]) ?? [])
    events.push({ type: "visit", label: `Visit request from ${v.name}`, at: v.created_at });

  return events.sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, limit);
}
