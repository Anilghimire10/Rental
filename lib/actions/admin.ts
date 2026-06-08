"use server";

import { revalidatePath } from "next/cache";
import { moderateListingSchema } from "@/lib/validation/listing.schema";
import { updateInquirySchema, updateVisitSchema } from "@/lib/validation/inquiry.schema";
import {
  adminUpdateUserSchema,
  categorySchema,
  advertisementSchema,
  faqSchema,
} from "@/lib/validation/user.schema";
import {
  moderateListing,
  setFeatured,
  adminDeleteListing,
} from "@/lib/services/listingService";
import { updateInquiry } from "@/lib/services/inquiryService";
import { updateVisit } from "@/lib/services/visitService";
import { adminUpdateUser } from "@/lib/services/userService";
import { upsertCategory, deleteCategory } from "@/lib/services/categoryService";
import { upsertFaq, deleteFaq } from "@/lib/services/faqService";
import { upsertAd, deleteAd } from "@/lib/services/advertisementService";
import { notifyOwnerPropertyApproved } from "@/lib/services/notificationService";
import type { ActionResult } from "@/lib/types";

function ok(message?: string): ActionResult {
  return { ok: true, message };
}
function fail(e: unknown): ActionResult {
  return { ok: false, error: e instanceof Error ? e.message : "Action failed." };
}

// --- Listings moderation ----------------------------------------------------
export async function moderateListingAction(input: unknown): Promise<ActionResult> {
  const parsed = moderateListingSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input." };
  try {
    const listing = await moderateListing(parsed.data.listingId, parsed.data.action, parsed.data.rejectionReason);
    if (parsed.data.action === "approve") {
      await notifyOwnerPropertyApproved({
        to: listing.owner_email,
        propertyCode: listing.property_code,
        listingTitle: listing.title,
      });
    }
    revalidatePath("/admin/listings");
    revalidatePath("/admin");
    return ok(parsed.data.action === "approve" ? "Listing approved." : "Listing rejected.");
  } catch (e) {
    return fail(e);
  }
}

export async function setFeaturedAction(listingId: string, isFeatured: boolean): Promise<ActionResult> {
  try {
    await setFeatured(listingId, isFeatured);
    revalidatePath("/admin/listings");
    return ok(isFeatured ? "Featured." : "Unfeatured.");
  } catch (e) {
    return fail(e);
  }
}

export async function adminDeleteListingAction(listingId: string): Promise<ActionResult> {
  try {
    await adminDeleteListing(listingId);
    revalidatePath("/admin/listings");
    return ok("Listing removed.");
  } catch (e) {
    return fail(e);
  }
}

// --- Inquiries --------------------------------------------------------------
export async function updateInquiryAction(input: unknown): Promise<ActionResult> {
  const parsed = updateInquirySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input." };
  try {
    await updateInquiry(parsed.data.inquiryId, { status: parsed.data.status, adminNotes: parsed.data.adminNotes });
    revalidatePath("/admin/inquiries");
    return ok("Inquiry updated.");
  } catch (e) {
    return fail(e);
  }
}

// --- Visits -----------------------------------------------------------------
export async function updateVisitAction(input: unknown): Promise<ActionResult> {
  const parsed = updateVisitSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input." };
  try {
    await updateVisit(parsed.data.visitId, { status: parsed.data.status, adminNotes: parsed.data.adminNotes });
    revalidatePath("/admin/visits");
    return ok("Visit updated.");
  } catch (e) {
    return fail(e);
  }
}

// --- Users ------------------------------------------------------------------
export async function updateUserAction(input: unknown): Promise<ActionResult> {
  const parsed = adminUpdateUserSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input." };
  try {
    await adminUpdateUser(parsed.data.userId, {
      role: parsed.data.role,
      plan: parsed.data.plan,
      isBanned: parsed.data.isBanned,
    });
    revalidatePath("/admin/users");
    return ok("User updated.");
  } catch (e) {
    return fail(e);
  }
}

// --- Categories -------------------------------------------------------------
export async function upsertCategoryAction(input: unknown): Promise<ActionResult> {
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input." };
  try {
    await upsertCategory(parsed.data);
    revalidatePath("/admin/categories");
    revalidatePath("/", "layout"); // refresh navbar + home sections everywhere
    return ok("Category saved.");
  } catch (e) {
    return fail(e);
  }
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  try {
    await deleteCategory(id);
    revalidatePath("/admin/categories");
    revalidatePath("/", "layout");
    return ok("Category deleted.");
  } catch (e) {
    return fail(e);
  }
}

// --- Advertisements ---------------------------------------------------------
export async function upsertAdAction(input: unknown): Promise<ActionResult> {
  const parsed = advertisementSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input." };
  try {
    await upsertAd(parsed.data);
    revalidatePath("/admin/advertisements");
    return ok("Advertisement saved.");
  } catch (e) {
    return fail(e);
  }
}

export async function deleteAdAction(id: string): Promise<ActionResult> {
  try {
    await deleteAd(id);
    revalidatePath("/admin/advertisements");
    return ok("Advertisement deleted.");
  } catch (e) {
    return fail(e);
  }
}

// --- FAQ --------------------------------------------------------------------
export async function upsertFaqAction(input: unknown): Promise<ActionResult> {
  const parsed = faqSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input." };
  try {
    await upsertFaq(parsed.data);
    revalidatePath("/admin/faqs");
    revalidatePath("/");
    return ok("FAQ saved.");
  } catch (e) {
    return fail(e);
  }
}

export async function deleteFaqAction(id: string): Promise<ActionResult> {
  try {
    await deleteFaq(id);
    revalidatePath("/admin/faqs");
    revalidatePath("/");
    return ok("FAQ deleted.");
  } catch (e) {
    return fail(e);
  }
}
