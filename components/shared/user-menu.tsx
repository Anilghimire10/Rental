"use client";

import Link from "next/link";
import { LayoutDashboard, Heart, MessageSquare, CalendarCheck, User, LogOut, Shield } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/lib/actions/auth";
import type { SessionUser } from "@/lib/types";

export function UserMenu({ user }: { user: SessionUser }) {
  const initials = (user.name || user.email).slice(0, 2).toUpperCase();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full" aria-label="Account menu">
          <span className="text-xs font-semibold">{initials}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="flex flex-col">
          <span>{user.name || "Account"}</span>
          <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {user.role === "admin" && (
          <DropdownMenuItem asChild>
            <Link href="/admin"><Shield className="h-4 w-4" /> Admin dashboard</Link>
          </DropdownMenuItem>
        )}
        {(user.role === "owner" || user.role === "admin") && (
          <DropdownMenuItem asChild>
            <Link href="/owner/listings"><LayoutDashboard className="h-4 w-4" /> My properties</Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href="/favorites"><Heart className="h-4 w-4" /> Saved</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/inquiries"><MessageSquare className="h-4 w-4" /> My inquiries</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/visits"><CalendarCheck className="h-4 w-4" /> My visits</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account"><User className="h-4 w-4" /> Account</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <form action={signOutAction} className="w-full">
            <button type="submit" className="flex w-full items-center gap-2">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
