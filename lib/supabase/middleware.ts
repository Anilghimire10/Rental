import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/types/database";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Refreshes the Supabase auth session and propagates updated cookies on the
 * response. Returns the (possibly refreshed) user so the root middleware can do
 * coarse route gating. See middleware.ts.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: getUser() revalidates the token with Supabase Auth (getSession()
  // alone trusts the cookie). Do not run code between createServerClient and here.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
