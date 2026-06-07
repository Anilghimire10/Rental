import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

/**
 * Service-role Supabase client. BYPASSES RLS. SERVER ONLY.
 *
 * The `server-only` import above makes the build FAIL if this module is ever
 * imported into a client bundle — a hard guardrail against leaking the key.
 *
 * Use ONLY for genuinely privileged operations that RLS can't express through
 * the user session, and ALWAYS after an explicit role check (requireAdmin):
 *   - admin mediator views (inquiries joined with owner contact)
 *   - owner inquiry COUNTS (aggregate only, never rows)
 *   - admin user management (role changes, bans)
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");

  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
