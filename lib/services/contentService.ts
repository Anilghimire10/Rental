import "server-only";
import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/session";
import type { SiteContentRow } from "@/lib/types/database";

export type ContentKey = "terms" | "privacy";

/** Public read of an editable content page (Terms, Privacy). */
export async function getSiteContent(key: ContentKey): Promise<SiteContentRow | null> {
  noStore();
  const supabase = createClient();
  const { data } = await supabase.from("site_content").select("*").eq("key", key).maybeSingle();
  return (data as SiteContentRow | null) ?? null;
}

/** Admin: all editable content rows. */
export async function adminListContent(): Promise<SiteContentRow[]> {
  await requireAdmin();
  const admin = createAdminClient();
  const { data, error } = await admin.from("site_content").select("*").order("key", { ascending: true });
  if (error) throw new Error(error.message);
  return data as SiteContentRow[];
}

/** Admin: create/update a content page by key. */
export async function upsertSiteContent(input: { key: ContentKey; title: string; body: string }): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from("site_content")
    .upsert({ key: input.key, title: input.title, body: input.body, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) throw new Error(error.message);
}
