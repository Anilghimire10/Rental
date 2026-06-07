import "server-only";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { categoryLookup, toPublicCard } from "@/lib/dto/listing.dto";
import type { CategoryRow, FavoriteRow, ListingRow } from "@/lib/types/database";
import type { PublicListingCard } from "@/lib/types";

/** Toggle a favorite; returns the new favorited state. */
export async function toggleFavorite(listingId: string): Promise<boolean> {
  const user = await requireUser();
  const supabase = createClient();

  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("listing_id", listingId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("favorites").delete().eq("id", (existing as { id: string }).id);
    if (error) throw new Error(error.message);
    return false;
  }

  const { error } = await supabase.from("favorites").insert({ user_id: user.id, listing_id: listingId });
  if (error) throw new Error(error.message);
  return true;
}

export async function getFavoriteIds(): Promise<Set<string>> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set();
  const { data } = await supabase.from("favorites").select("listing_id").eq("user_id", user.id);
  return new Set((data as Pick<FavoriteRow, "listing_id">[] | null)?.map((f) => f.listing_id) ?? []);
}

export async function getMyFavorites(): Promise<PublicListingCard[]> {
  const user = await requireUser();
  const supabase = createClient();

  const { data: favs } = await supabase
    .from("favorites")
    .select("listing_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  const ids = (favs as Pick<FavoriteRow, "listing_id">[] | null)?.map((f) => f.listing_id) ?? [];
  if (ids.length === 0) return [];

  // RLS ensures only approved listings (or the user's own) come back.
  const { data: listings } = await supabase.from("listings").select("*").in("id", ids);
  const { data: cats } = await supabase.from("categories").select("*");
  const lookup = categoryLookup(cats as CategoryRow[]);
  return (listings as ListingRow[] | null)?.map((r) => toPublicCard(r, lookup)) ?? [];
}
