import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/lib/types/database";
import type { SessionUser, UserRole } from "@/lib/types";

/**
 * Central server-side auth. Every privileged code path funnels through here.
 *
 * The golden rule from the spec — "if all UI were removed, no user could call
 * any endpoint and receive data they aren't authorized to see" — is enforced by
 * calling requireUser/requireRole/requireAdmin at the top of each server action,
 * route handler and service entry point, NOT by hiding things in the UI.
 */

export class AuthError extends Error {
  constructor(
    message: string,
    public status: 401 | 403 = 401,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

function toSessionUser(p: ProfileRow): SessionUser {
  return {
    id: p.id,
    email: p.email,
    name: p.name,
    phone: p.phone,
    whatsapp: p.whatsapp,
    role: p.role,
    plan: p.plan,
    isVerified: p.is_verified,
    isBanned: p.is_banned,
  };
}

/**
 * Returns the current user (verified against Supabase Auth) joined with their
 * profile, or null if not logged in. Cached per-request via React cache().
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) return null;
  return toSessionUser(profile as ProfileRow);
});

/** Require a logged-in, non-banned user. Throws AuthError otherwise. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError("You must be signed in.", 401);
  if (user.isBanned) throw new AuthError("Your account has been suspended.", 403);
  return user;
}

/** Require a logged-in user holding one of the given roles. */
export async function requireRole(...roles: UserRole[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    throw new AuthError("You do not have permission to perform this action.", 403);
  }
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  return requireRole("admin");
}

/** Owners (and admins) only. Used to gate listing creation/management. */
export async function requireOwner(): Promise<SessionUser> {
  return requireRole("owner", "admin");
}

/**
 * Require a verified (email-confirmed) user. Email verification is mandatory
 * before posting listings per the spec.
 */
export async function requireVerified(): Promise<SessionUser> {
  const user = await requireUser();
  if (!user.isVerified) {
    throw new AuthError("Please verify your email address first.", 403);
  }
  return user;
}
