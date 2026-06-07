"use server";

import { revalidatePath } from "next/cache";
import { updateProfileSchema } from "@/lib/validation/user.schema";
import { updateMyProfile } from "@/lib/services/userService";
import type { ActionResult } from "@/lib/types";

export async function updateProfileAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = updateProfileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: "Please check the form.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  try {
    await updateMyProfile(parsed.data);
    revalidatePath("/account");
    return { ok: true, message: "Profile updated." };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not update profile." };
  }
}
