import Link from "next/link";
import { Phone, Plus } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/shared/user-menu";
import { getCurrentUser } from "@/lib/auth/session";
import { AGENCY } from "@/lib/config";

/** Public site header. Server component — fetches the session for the user menu. */
export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm font-medium text-foreground/80 md:flex">
            <Link href="/search" className="transition-colors hover:text-primary">Browse</Link>
            <Link href="/search?sort=popular" className="transition-colors hover:text-primary">Popular</Link>
            <Link href="/owner/listings/new" className="transition-colors hover:text-primary">List a property</Link>
            <Link href="/#how-it-works" className="transition-colors hover:text-primary">How it works</Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${AGENCY.phone}`}
            className="hidden items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-primary hover:bg-secondary lg:flex"
          >
            <Phone className="h-4 w-4" /> {AGENCY.phone}
          </a>

          {user ? (
            <>
              {(user.role === "owner" || user.role === "admin") && (
                <Button asChild variant="accent" size="sm" className="hidden sm:inline-flex">
                  <Link href="/owner/listings/new"><Plus className="h-4 w-4" /> Add property</Link>
                </Button>
              )}
              <UserMenu user={user} />
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/auth/login">Sign in</Link>
              </Button>
              <Button asChild variant="accent" size="sm">
                <Link href="/auth/signup">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
