"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/types/database";

/**
 * Browser Supabase client (anon key). Subject to RLS. Use ONLY for auth flows
 * and realtime in client components — never for privileged reads/writes. All
 * sensitive data access happens server-side via the service layer.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
