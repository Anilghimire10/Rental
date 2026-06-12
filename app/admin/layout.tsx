import Link from "next/link";
import { ShieldAlert, LogOut } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { signOutAction } from "@/lib/actions/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: { default: "Admin", template: "%s · Admin · GharBhada" },
  robots: { index: false, follow: false },
};

/**
 * Admin shell — SEPARATE, data-dense layout. Role-gated: non-admins get a 403
 * screen instead of any admin page (defense in depth on top of per-service
 * requireAdmin() checks at the data layer).
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-secondary/40 px-4 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <h1 className="font-serif text-2xl font-bold">403 — Forbidden</h1>
        <p className="max-w-sm text-muted-foreground">
          This area is for administrators only. If you believe this is a mistake, contact support.
        </p>
        <Button asChild><Link href="/">Back to site</Link></Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-secondary/30">
      <AdminSidebar />
      <div className="flex-1 lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:px-8">
          <AdminMobileNav />
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">Signed in as {user.email}</span>
            <form action={signOutAction}>
              <Button type="submit" variant="outline" size="sm">
                <LogOut className="h-4 w-4" /> Sign out
              </Button>
            </form>
          </div>
        </header>
        <div className="p-4 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
