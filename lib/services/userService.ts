import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin, requireUser } from "@/lib/auth/session";
import { toAdminUser } from "@/lib/dto/user.dto";
import type { ProfileRow, UserPlan, UserRole } from "@/lib/types/database";
import type { AdminUser } from "@/lib/types";

/** Update the current user's own profile (name/phone/whatsapp only). */
export async function updateMyProfile(input: {
  name: string;
  phone?: string;
  whatsapp?: string;
}): Promise<void> {
  const user = await requireUser();
  const supabase = createClient();
  // RLS prevents role/plan/ban escalation; we only send the safe fields.
  const { error } = await supabase
    .from("profiles")
    .update({ name: input.name, phone: input.phone || null, whatsapp: input.whatsapp || null })
    .eq("id", user.id);
  if (error) throw new Error(error.message);
}

// --- Admin user management --------------------------------------------------

export async function adminListUsers(opts?: { role?: UserRole; q?: string }): Promise<AdminUser[]> {
  await requireAdmin();
  const admin = createAdminClient();
  let q = admin.from("profiles").select("*").order("created_at", { ascending: false });
  if (opts?.role) q = q.eq("role", opts.role);
  if (opts?.q) q = q.ilike("email", `%${opts.q}%`);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data as ProfileRow[]).map(toAdminUser);
}

export async function adminUpdateUser(
  userId: string,
  patch: { role?: UserRole; plan?: UserPlan; isBanned?: boolean },
): Promise<void> {
  const adminUser = await requireAdmin();
  // Guard: an admin cannot demote or ban themselves (avoid lockout).
  if (userId === adminUser.id && (patch.role && patch.role !== "admin" || patch.isBanned)) {
    throw new Error("You cannot change your own admin role or ban yourself.");
  }
  const admin = createAdminClient();
  const update: Partial<ProfileRow> = {};
  if (patch.role) update.role = patch.role;
  if (patch.plan) update.plan = patch.plan;
  if (typeof patch.isBanned === "boolean") update.is_banned = patch.isBanned;
  const { error } = await admin.from("profiles").update(update).eq("id", userId);
  if (error) throw new Error(error.message);
}
