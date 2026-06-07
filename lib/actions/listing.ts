"use server";

import { revalidatePath } from "next/cache";
import { listingInputSchema } from "@/lib/validation/listing.schema";
import {
  createListing,
  updateListing,
  deleteListing,
  setListingRented,
} from "@/lib/services/listingService";
import type { ActionResult } from "@/lib/types";

export async function createListingAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = listingInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please check the form.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  try {
    const id = await createListing(parsed.data);
    revalidatePath("/owner/listings");
    return { ok: true, data: { id }, message: "Submitted for admin approval." };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not create listing." };
  }
}

export async function updateListingAction(id: string, input: unknown): Promise<ActionResult> {
  const parsed = listingInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please check the form.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  try {
    await updateListing(id, parsed.data);
    revalidatePath("/owner/listings");
    revalidatePath(`/owner/listings/${id}`);
    return { ok: true, message: "Saved. Your edits are pending re-approval." };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not update listing." };
  }
}

export async function deleteListingAction(id: string): Promise<ActionResult> {
  try {
    await deleteListing(id);
    revalidatePath("/owner/listings");
    return { ok: true, message: "Listing deleted." };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not delete listing." };
  }
}

export async function toggleRentedAction(id: string, isRented: boolean): Promise<ActionResult> {
  try {
    await setListingRented(id, isRented);
    revalidatePath("/owner/listings");
    return { ok: true, message: isRented ? "Marked as rented." : "Marked as available." };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not update." };
  }
}
