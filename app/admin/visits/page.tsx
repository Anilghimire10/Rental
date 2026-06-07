import Link from "next/link";
import { cn } from "@/lib/utils";
import { AdminVisitCard } from "@/components/admin/admin-visit-card";
import { EmptyState } from "@/components/shared/empty-state";
import { adminListVisits } from "@/lib/services/visitService";
import type { VisitStatus } from "@/lib/types";

export const metadata = { title: "Visit requests" };

const TABS: { key: VisitStatus | "all"; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
  { key: "all", label: "All" },
];

export default async function AdminVisitsPage({ searchParams }: { searchParams: { status?: string } }) {
  const status = (searchParams.status as VisitStatus | "all") ?? "pending";
  const visits = await adminListVisits(status === "all" ? undefined : status);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-primary">Visit requests</h1>
        <p className="text-sm text-muted-foreground">Confirm, complete or cancel viewings. Confirming emails the tenant.</p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        {TABS.map((t) => (
          <Link key={t.key} href={`/admin/visits?status=${t.key}`}
            className={cn("rounded-md px-3 py-1.5 text-sm font-medium transition", status === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary")}>
            {t.label}
          </Link>
        ))}
      </div>

      {visits.length ? (
        <div className="space-y-4">{visits.map((v) => <AdminVisitCard key={v.id} visit={v} />)}</div>
      ) : (
        <EmptyState title="No visit requests" description="Nothing matches this filter." />
      )}
    </div>
  );
}
