import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Root middleware. Two jobs:
 *  1. Refresh the Supabase auth session cookie on every request (SSR auth).
 *  2. Coarse gate for protected route groups — a fast redirect for unauthenticated
 *     users. NOTE: this is a UX convenience only. Real authorization is enforced
 *     server-side in services/route handlers (see lib/auth/session.ts). The
 *     security rule "no UI ⇒ no unauthorized data" never depends on this file.
 */
export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const protectedPrefixes = [
    "/owner",
    "/admin",
    "/favorites",
    "/inquiries",
    "/visits",
    "/account",
  ];
  const isProtected = protectedPrefixes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (isProtected && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  // Run on everything except static assets and image optimization.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
