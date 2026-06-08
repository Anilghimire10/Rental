import "server-only";
import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/session";
import { toCategory } from "@/lib/dto/user.dto";
import { slugify } from "@/lib/utils";
import type { CategoryRow } from "@/lib/types/database";
import type { Category } from "@/lib/types";

/** Active categories for public selects/filters. */
export async function getActiveCategories(): Promise<Category[]> {
  noStore();
  const supabase = createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return (data as CategoryRow[] | null)?.map(toCategory) ?? [];
}

/** Categories the admin chose to show in the navbar, in position order. */
export async function getNavCategories(): Promise<Category[]> {
  noStore();
  const supabase = createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .eq("show_in_nav", true)
    .order("sort_order", { ascending: true });
  return (data as CategoryRow[] | null)?.map(toCategory) ?? [];
}

/** Categories the admin chose to feature as home-page sections, in position order. */
export async function getHomeSectionCategories(): Promise<Category[]> {
  noStore();
  const supabase = createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .eq("show_on_home", true)
    .order("sort_order", { ascending: true });
  return (data as CategoryRow[] | null)?.map(toCategory) ?? [];
}

export async function adminListCategories(): Promise<CategoryRow[]> {
  await requireAdmin();
  const admin = createAdminClient();
  const { data, error } = await admin.from("categories").select("*").order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data as CategoryRow[];
}

export async function upsertCategory(input: {
  id?: string;
  name: string;
  isActive: boolean;
  showInNav: boolean;
  showOnHome: boolean;
  sortOrder: number;
}): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();
  const payload = {
    name: input.name,
    slug: slugify(input.name),
    is_active: input.isActive,
    show_in_nav: input.showInNav,
    show_on_home: input.showOnHome,
    sort_order: input.sortOrder,
  };
  if (input.id) {
    const { error } = await admin.from("categories").update(payload).eq("id", input.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await admin.from("categories").insert(payload);
    if (error) throw new Error(error.message);
  }
}

export async function deleteCategory(id: string): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
