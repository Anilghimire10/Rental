"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { updateUserAction } from "@/lib/actions/admin";
import { formatDate } from "@/lib/utils";
import type { AdminUser, UserPlan, UserRole } from "@/lib/types";

export function AdminUserRow({ user }: { user: AdminUser }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  const update = (patch: { role?: UserRole; plan?: UserPlan; isBanned?: boolean }) =>
    start(async () => {
      const res = await updateUserAction({ userId: user.id, ...patch });
      toast(res.ok ? { title: res.message } : { variant: "destructive", title: "Error", description: res.error });
      router.refresh();
    });

  return (
    <tr className="border-b border-border last:border-0">
      <td className="py-3 pr-4">
        <p className="font-medium">{user.name || "—"}</p>
        <p className="text-xs text-muted-foreground">{user.email}</p>
        <p className="text-xs text-muted-foreground">{user.phone ?? ""}</p>
      </td>
      <td className="py-3 pr-4">
        <Select value={user.role} onValueChange={(v) => update({ role: v as UserRole })}>
          <SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="tenant">Tenant</SelectItem>
            <SelectItem value="owner">Owner</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </td>
      <td className="py-3 pr-4">
        <Select value={user.plan} onValueChange={(v) => update({ plan: v as UserPlan })}>
          <SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="featured">Featured</SelectItem>
          </SelectContent>
        </Select>
      </td>
      <td className="py-3 pr-4">
        {user.isVerified ? <Badge variant="success">Verified</Badge> : <Badge variant="warning">Unverified</Badge>}
      </td>
      <td className="py-3 pr-4 text-xs text-muted-foreground">{formatDate(user.createdAt)}</td>
      <td className="py-3 text-right">
        {user.isBanned ? (
          <Button size="sm" variant="outline" disabled={pending} onClick={() => update({ isBanned: false })}>
            <ShieldCheck className="h-4 w-4" /> Unban
          </Button>
        ) : (
          <Button size="sm" variant="ghost" disabled={pending} className="text-destructive hover:text-destructive"
            onClick={() => { if (confirm(`Ban ${user.email}?`)) update({ isBanned: true }); }}>
            <Ban className="h-4 w-4" /> Ban
          </Button>
        )}
      </td>
    </tr>
  );
}
