import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/session";
import type { FeedbackRow } from "@/lib/types/database";
import type { AdminFeedback } from "@/lib/types";

/** Public feedback submission. Uses service role to insert (RLS also allows it). */
export async function createFeedback(input: {
  name: string;
  email?: string;
  rating?: number;
  message: string;
}): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("feedback").insert({
    name: input.name,
    email: input.email || null,
    rating: input.rating ?? null,
    message: input.message,
  });
  if (error) throw new Error(error.message);
}

export async function adminListFeedback(): Promise<AdminFeedback[]> {
  await requireAdmin();
  const admin = createAdminClient();
  const { data, error } = await admin.from("feedback").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as FeedbackRow[]).map((f) => ({
    id: f.id,
    name: f.name,
    email: f.email,
    rating: f.rating,
    message: f.message,
    createdAt: f.created_at,
  }));
}
