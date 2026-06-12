"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type NavCat = { id: string; name: string; slug: string };
type AboutLink = { href: string; label: string };

/**
 * Mobile navigation drawer. Shown only below `lg` (the desktop nav handles wider
 * screens). Hosts the category links, About links and the auth/add-property CTAs
 * that are otherwise hidden on small screens.
 */
export function MobileNav({
  navCats,
  aboutLinks,
  isAuthed,
}: {
  navCats: NavCat[];
  aboutLinks: AboutLink[];
  isAuthed: boolean;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-md text-foreground/80 hover:bg-secondary"
      >
        <Menu className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 flex h-full w-[min(20rem,85vw)] flex-col bg-background shadow-soft">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
              <span className="font-serif text-lg font-semibold text-primary">Menu</span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-md text-foreground/80 hover:bg-secondary"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-1 text-sm font-medium">
                <li>
                  <Link href="/" className="block rounded-md px-3 py-2.5 hover:bg-secondary">Home</Link>
                </li>
                {navCats.map((c) => (
                  <li key={c.id}>
                    <Link href={`/search?categorySlug=${c.slug}`} className="block rounded-md px-3 py-2.5 hover:bg-secondary">
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>

              <p className="mt-5 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">About</p>
              <ul className="mt-1 space-y-1 text-sm font-medium">
                {aboutLinks.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="block rounded-md px-3 py-2.5 hover:bg-secondary">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>

            {isAuthed && (
              <div className="shrink-0 border-t border-border p-4">
                <Button asChild variant="accent" className="w-full">
                  <Link href="/owner/listings/new"><Plus className="h-4 w-4" /> Add property</Link>
                </Button>
              </div>
            )}
            {!isAuthed && (
              <div className="shrink-0 space-y-2 border-t border-border p-4">
                <Button asChild variant="accent" className="w-full">
                  <Link href="/auth/signup">Register</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/auth/login">Login</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
