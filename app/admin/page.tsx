import Link from "next/link";
import {
  Building2, Clock, Users, MessageSquare, CalendarCheck, Eye, TrendingUp, ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/admin/stat-card";
import { getDashboardStats, getRecentActivity } from "@/lib/services/analyticsService";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Overview" };

export default async function AdminOverviewPage() {
  const [stats, activity] = await Promise.all([getDashboardStats(), getRecentActivity(10)]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-primary">Dashboard</h1>
        <p className="text-sm text-muted-foreground">A snapshot of activity across GharBhada.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total properties" value={stats.totalProperties} icon={Building2} hint={`${stats.activeProperties} active`} />
        <StatCard label="Pending approvals" value={stats.pendingApprovals} icon={Clock} accent hint="Need review" />
        <StatCard label="Total users" value={stats.totalUsers} icon={Users} />
        <StatCard label="Inquiries" value={stats.totalInquiries} icon={MessageSquare} hint={`${stats.newInquiries} new`} />
        <StatCard label="Visit requests" value={stats.totalVisits} icon={CalendarCheck} hint={`${stats.pendingVisits} pending`} />
        <StatCard label="Active listings" value={stats.activeProperties} icon={TrendingUp} />
        {stats.mostViewed && (
          <Card className="sm:col-span-2">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">Most viewed</p>
                <p className="mt-1 line-clamp-1 font-serif font-semibold text-primary">{stats.mostViewed.title}</p>
                <p className="text-xs text-muted-foreground">{stats.mostViewed.propertyCode} · {stats.mostViewed.viewCount} views</p>
              </div>
              <Eye className="h-6 w-6 text-accent" />
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Recent activity</CardTitle></CardHeader>
          <CardContent>
            {activity.length ? (
              <ul className="divide-y divide-border">
                {activity.map((e, i) => (
                  <li key={i} className="flex items-center justify-between py-2.5 text-sm">
                    <span>{e.label}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(e.at)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">No recent activity.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Quick actions</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <QuickLink href="/admin/listings?status=pending" label={`Review ${stats.pendingApprovals} pending listings`} />
            <QuickLink href="/admin/inquiries?status=new" label={`Handle ${stats.newInquiries} new inquiries`} />
            <QuickLink href="/admin/visits?status=pending" label={`Confirm ${stats.pendingVisits} visit requests`} />
            <QuickLink href="/admin/users" label="Manage users" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="flex items-center justify-between rounded-md border border-border px-3 py-2.5 text-sm transition hover:border-accent hover:bg-secondary">
      {label} <ArrowRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}
