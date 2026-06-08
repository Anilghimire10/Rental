"use server";

import { headers } from "next/headers";
import { feedbackSchema } from "@/lib/validation/user.schema";
import { createFeedback } from "@/lib/services/feedbackService";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import type { ActionResult } from "@/lib/types";

export async function submitFeedback(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const ip = clientIp(headers());
  if (!rateLimit(`feedback:${ip}`, { limit: 5, windowMs: 60_000 }).success) {
    return { ok: false, error: "Too many submissions. Please wait a minute." };
  }
  const parsed = feedbackSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: "Please check the form.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  if (parsed.data.company) return { ok: true, message: "Thanks for your feedback!" };

  try {
    await createFeedback({
      name: parsed.data.name,
      email: parsed.data.email || undefined,
      rating: parsed.data.rating,
      message: parsed.data.message,
    });
    return { ok: true, message: "Thanks for your feedback!" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not submit." };
  }
}
