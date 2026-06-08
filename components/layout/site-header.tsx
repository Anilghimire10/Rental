import Link from "next/link";
import { Phone, Mail, Plus, ChevronDown } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/shared/user-menu";
import { getCurrentUser } from "@/lib/auth/session";
import { getNavCategories } from "@/lib/services/categoryService";
import { AGENCY, BRAND } from "@/lib/config";
import { whatsappLink } from "@/lib/utils";

const ABOUT_LINKS = [
  { href: "/about", label: "About Us" },
  { href: "/policy", label: "Terms & Conditions" },
  { href: "/policy", label: "Privacy Policy" },
  { href: "/faq", label: "FAQ" },
];

/** Public site header — top contact bar + main nav with an About Us dropdown. */
export async function SiteHeader() {
  // Navbar categories are admin-controlled (show_in_nav + position). Cap at 8 so
  // the bar never overflows.
  const [user, navCatsAll] = await Promise.all([getCurrentUser(), getNavCategories()]);
  const navCats = navCatsAll.slice(0, 8);

  return (
    <header className="sticky top-0 z-40 bg-background">
      {/* Top contact bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto flex w-full items-center justify-between gap-3 px-4 py-1.5 text-xs sm:px-6 lg:px-10">
          <span className="hidden sm:block">{BRAND} — a complete rental solution for Pokhara</span>
          <div className="flex items-center gap-4">
            <a href={whatsappLink(AGENCY.whatsapp)} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-accent">
              <Phone className="h-3.5 w-3.5" /> {AGENCY.phone}
            </a>
            <a href={`mailto:${AGENCY.email}`} className="hidden items-center gap-1.5 hover:text-accent sm:flex">
              <Mail className="h-3.5 w-3.5" /> {AGENCY.email}
            </a>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="border-b border-border">
        <div className="mx-auto flex h-16 w-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
          <Logo />

          <nav className="hidden items-center gap-5 text-sm font-semibold uppercase tracking-wide text-foreground/85 lg:flex">
            <Link href="/" className="transition-colors hover:text-primary">Home</Link>
            {navCats.map((c) => (
              <Link key={c.id} href={`/search?categorySlug=${c.slug}`} className="whitespace-nowrap transition-colors hover:text-primary">
                {c.name}
              </Link>
            ))}

            {/* About Us — CSS hover dropdown */}
            <div className="group relative">
              <button className="flex items-center gap-1 uppercase transition-colors hover:text-primary">
                About Us <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <div className="invisible absolute left-0 top-full z-50 w-52 translate-y-1 rounded-md border border-border bg-popover p-1 opacity-0 shadow-md transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                {ABOUT_LINKS.map((l) => (
                  <Link key={l.label} href={l.href} className="block rounded-sm px-3 py-2 text-xs font-medium normal-case text-foreground/90 hover:bg-secondary">
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            {user ? (
              <>
                <Button asChild variant="accent" size="sm" className="hidden sm:inline-flex">
                  <Link href="/owner/listings/new"><Plus className="h-4 w-4" /> Add property</Link>
                </Button>
                <UserMenu user={user} />
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button asChild variant="accent" size="sm">
                  <Link href="/auth/signup">Register</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
