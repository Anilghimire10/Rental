import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/session";
import type { FaqRow } from "@/lib/types/database";
import type { Faq } from "@/lib/types";

/** Active FAQs for the public landing page. */
export async function getActiveFaqs(): Promise<Faq[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("faqs")
    .select("*")
    .eq("is_active", true)
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true });
  return (
    (data as FaqRow[] | null)?.map((f) => ({
      id: f.id,
      category: f.category,
      question: f.question,
      answer: f.answer,
    })) ?? []
  );
}

export async function adminListFaqs(): Promise<FaqRow[]> {
  await requireAdmin();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("faqs")
    .select("*")
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data as FaqRow[];
}

export async function upsertFaq(input: {
  id?: string;
  category: string;
  question: string;
  answer: string;
  isActive: boolean;
  sortOrder: number;
}): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();
  const payload = {
    category: input.category,
    question: input.question,
    answer: input.answer,
    is_active: input.isActive,
    sort_order: input.sortOrder,
  };
  if (input.id) {
    const { error } = await admin.from("faqs").update(payload).eq("id", input.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await admin.from("faqs").insert(payload);
    if (error) throw new Error(error.message);
  }
}

export async function deleteFaq(id: string): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("faqs").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
