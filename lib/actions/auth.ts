"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { loginSchema, signUpSchema, resetRequestSchema } from "@/lib/validation/auth.schema";
import type { ActionResult } from "@/lib/types";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function signUpAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const ip = clientIp(headers());
  if (!rateLimit(`signup:${ip}`, { limit: 5, windowMs: 60_000 }).success) {
    return { ok: false, error: "Too many attempts. Please wait a minute." };
  }

  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: "Please check the form.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  // Honeypot.
  if (parsed.data.website) return { ok: true, message: "Check your email to verify your account." };

  const supabase = createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${SITE}/auth/callback`,
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone || null,
        role: "tenant", // single account type; everyone can rent and list
      },
    },
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, message: "Account created! Check your email to verify before posting." };
}

export async function signInAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const ip = clientIp(headers());
  if (!rateLimit(`login:${ip}`, { limit: 10, windowMs: 60_000 }).success) {
    return { ok: false, error: "Too many login attempts. Please wait a minute." };
  }

  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: "Enter your email and password." };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) return { ok: false, error: "Invalid email or password." };
  return { ok: true };
}

export async function signOutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function requestPasswordResetAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const ip = clientIp(headers());
  if (!rateLimit(`reset:${ip}`, { limit: 5, windowMs: 60_000 }).success) {
    return { ok: false, error: "Too many requests. Please wait a minute." };
  }
  const parsed = resetRequestSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: "Enter a valid email." };

  const supabase = createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${SITE}/auth/reset`,
  });
  // Always succeed (don't reveal whether the email exists).
  return { ok: true, message: "If that email exists, a reset link is on its way." };
}
