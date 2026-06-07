import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { AdminUserRow } from "@/components/admin/admin-user-row";
import { EmptyState } from "@/components/shared/empty-state";
import { adminListUsers } from "@/lib/services/userService";
import type { UserRole } from "@/lib/types";

export const metadata = { title: "Users" };

const TABS: { key: UserRole | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "tenant", label: "Tenants" },
  { key: "owner", label: "Owners" },
  { key: "admin", label: "Admins" },
];

export default async function AdminUsersPage({ searchParams }: { searchParams: { role?: string } }) {
  const role = (searchParams.role as UserRole | "all") ?? "all";
  const users = await adminListUsers({ role: role === "all" ? undefined : role });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-primary">User management</h1>
        <p className="text-sm text-muted-foreground">Change roles & plans, ban or unban accounts.</p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        {TABS.map((t) => (
          <Link key={t.key} href={`/admin/users?role=${t.key}`}
            className={cn("rounded-md px-3 py-1.5 text-sm font-medium transition", role === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary")}>
            {t.label}
          </Link>
        ))}
      </div>

      {users.length ? (
        <Card>
          <CardContent className="overflow-x-auto p-5">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">User</th>
                  <th className="pb-2 pr-4 font-medium">Role</th>
                  <th className="pb-2 pr-4 font-medium">Plan</th>
                  <th className="pb-2 pr-4 font-medium">Status</th>
                  <th className="pb-2 pr-4 font-medium">Joined</th>
                  <th className="pb-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => <AdminUserRow key={u.id} user={u} />)}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : (
        <EmptyState title="No users" />
      )}
    </div>
  );
}
