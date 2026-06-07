"use server";

import { revalidatePath } from "next/cache";
import { toggleFavorite } from "@/lib/services/favoriteService";
import type { ActionResult } from "@/lib/types";

export async function toggleFavoriteAction(listingId: string): Promise<ActionResult<{ favorited: boolean }>> {
  try {
    const favorited = await toggleFavorite(listingId);
    revalidatePath("/favorites");
    return { ok: true, data: { favorited } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Please sign in to save favorites." };
  }
}
