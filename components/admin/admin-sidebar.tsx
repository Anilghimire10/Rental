"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Building2, MessageSquare, CalendarCheck, Users, Tags, Megaphone, HelpCircle, MessageCircle, FileText,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";

export const ADMIN_NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/listings", label: "Properties", icon: Building2 },
  { href: "/admin/inquiries", label: "Inquiries", icon: MessageSquare },
  { href: "/admin/visits", label: "Visit requests", icon: CalendarCheck },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/advertisements", label: "Advertisements", icon: Megaphone },
  { href: "/admin/faqs", label: "FAQs", icon: HelpCircle },
  { href: "/admin/feedback", label: "Feedback", icon: MessageCircle },
  { href: "/admin/content", label: "Terms & Privacy", icon: FileText },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-primary text-primary-foreground lg:flex">
      <div className="flex h-14 items-center border-b border-primary-foreground/10 px-5">
        <Logo href="/admin" className="[&_span:last-child]:text-primary-foreground" />
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {ADMIN_NAV.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition",
                active ? "bg-accent text-accent-foreground" : "text-primary-foreground/80 hover:bg-primary-foreground/10",
              )}
            >
              <item.icon className="h-4 w-4" /> {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
