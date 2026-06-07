import Link from "next/link";
import { cn } from "@/lib/utils";
import { AdminListingRow } from "@/components/admin/admin-listing-row";
import { EmptyState } from "@/components/shared/empty-state";
import { adminListListings } from "@/lib/services/listingService";
import type { ListingStatus } from "@/lib/types";

export const metadata = { title: "Properties" };

const TABS: { key: ListingStatus | "all"; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All" },
];

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: { status?: string; q?: string };
}) {
  const status = (searchParams.status as ListingStatus | "all") ?? "pending";
  const q = searchParams.q;
  const listings = await adminListListings({
    status: status === "all" ? undefined : status,
    q,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-primary">Property management</h1>
        <p className="text-sm text-muted-foreground">Approve, reject, feature and remove listings.</p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/listings?status=${t.key}`}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition",
              status === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {listings.length ? (
        <div className="space-y-4">
          {listings.map((l) => <AdminListingRow key={l.id} listing={l} />)}
        </div>
      ) : (
        <EmptyState title="No listings here" description="Nothing matches this filter." />
      )}
    </div>
  );
}
