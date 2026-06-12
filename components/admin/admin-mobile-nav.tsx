"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { ADMIN_NAV } from "@/components/admin/admin-sidebar";
import { cn } from "@/lib/utils";

/** Hamburger + slide-in drawer giving admins navigation on screens below `lg`. */
export function AdminMobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="flex items-center gap-2 lg:hidden">
      <button
        type="button"
        aria-label="Open admin menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-md text-foreground/80 hover:bg-secondary"
      >
        <Menu className="h-6 w-6" />
      </button>
      <Logo href="/admin" />

      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-[min(18rem,82vw)] flex-col border-r border-border bg-primary text-primary-foreground shadow-soft">
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-primary-foreground/10 px-4">
              <Logo href="/admin" className="[&_span:last-child]:text-primary-foreground" />
              <button
                type="button"
                aria-label="Close admin menu"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-md text-primary-foreground/80 hover:bg-primary-foreground/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto p-3">
              {ADMIN_NAV.map((item) => {
                const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition",
                      active ? "bg-accent text-accent-foreground" : "text-primary-foreground/80 hover:bg-primary-foreground/10",
                    )}
                  >
                    <item.icon className="h-4 w-4" /> {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
}
