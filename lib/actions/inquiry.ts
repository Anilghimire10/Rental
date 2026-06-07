"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { inquiryInputSchema, visitInputSchema } from "@/lib/validation/inquiry.schema";
import { createInquiry } from "@/lib/services/inquiryService";
import { createVisit } from "@/lib/services/visitService";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import type { ActionResult } from "@/lib/types";

/** Submit an inquiry (public, rate-limited, honeypot-protected). */
export async function submitInquiry(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const ip = clientIp(headers());
  const limit = rateLimit(`inquiry:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!limit.success) {
    return { ok: false, error: "Too many requests. Please wait a minute and try again." };
  }

  const parsed = inquiryInputSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: "Please check the form.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  // Honeypot: silently succeed so bots don't learn anything.
  if (parsed.data.company) return { ok: true, message: "Thanks! We'll be in touch." };

  try {
    await createInquiry(parsed.data);
    revalidatePath("/inquiries");
    return { ok: true, message: "Inquiry sent — our team will contact you shortly." };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Something went wrong." };
  }
}

/** Submit a visit request (public, rate-limited, honeypot-protected). */
export async function submitVisit(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const ip = clientIp(headers());
  const limit = rateLimit(`visit:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!limit.success) {
    return { ok: false, error: "Too many requests. Please wait a minute and try again." };
  }

  const parsed = visitInputSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: "Please check the form.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  if (parsed.data.company) return { ok: true, message: "Thanks! We'll confirm your visit soon." };

  try {
    await createVisit(parsed.data);
    revalidatePath("/visits");
    return { ok: true, message: "Visit requested — we'll confirm a time soon." };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Something went wrong." };
  }
}
