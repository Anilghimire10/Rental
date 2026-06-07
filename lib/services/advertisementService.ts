import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/session";
import { toAdvertisement } from "@/lib/dto/user.dto";
import type { AdvertisementRow } from "@/lib/types/database";
import type { Advertisement } from "@/lib/types";

/** Active ads for a given placement (public). */
export async function getActiveAds(position?: string): Promise<Advertisement[]> {
  const supabase = createClient();
  let q = supabase.from("advertisements").select("*").eq("is_active", true);
  if (position) q = q.eq("position", position);
  const { data } = await q.order("created_at", { ascending: false });
  return (data as AdvertisementRow[] | null)?.map(toAdvertisement) ?? [];
}

export async function adminListAds(): Promise<Advertisement[]> {
  await requireAdmin();
  const admin = createAdminClient();
  const { data, error } = await admin.from("advertisements").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as AdvertisementRow[]).map(toAdvertisement);
}

export async function upsertAd(input: {
  id?: string;
  title: string;
  image: string;
  linkUrl?: string;
  position: string;
  isActive: boolean;
}): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();
  const payload = {
    title: input.title,
    image: input.image,
    link_url: input.linkUrl || null,
    position: input.position,
    is_active: input.isActive,
  };
  if (input.id) {
    const { error } = await admin.from("advertisements").update(payload).eq("id", input.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await admin.from("advertisements").insert(payload);
    if (error) throw new Error(error.message);
  }
}

export async function deleteAd(id: string): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("advertisements").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
