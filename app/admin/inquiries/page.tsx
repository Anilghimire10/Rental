import Link from "next/link";
import { cn } from "@/lib/utils";
import { AdminInquiryCard } from "@/components/admin/admin-inquiry-card";
import { EmptyState } from "@/components/shared/empty-state";
import { adminListInquiries } from "@/lib/services/inquiryService";
import type { InquiryStatus } from "@/lib/types";

export const metadata = { title: "Inquiries" };

const TABS: { key: InquiryStatus | "all"; label: string }[] = [
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "resolved", label: "Resolved" },
  { key: "all", label: "All" },
];

export default async function AdminInquiriesPage({ searchParams }: { searchParams: { status?: string } }) {
  const status = (searchParams.status as InquiryStatus | "all") ?? "all";
  const inquiries = await adminListInquiries(status === "all" ? undefined : status);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-primary">Inquiry hub</h1>
        <p className="text-sm text-muted-foreground">Mediate between tenants and owners. Contact details are visible to admins only.</p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        {TABS.map((t) => (
          <Link key={t.key} href={`/admin/inquiries?status=${t.key}`}
            className={cn("rounded-md px-3 py-1.5 text-sm font-medium transition", status === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary")}>
            {t.label}
          </Link>
        ))}
      </div>

      {inquiries.length ? (
        <div className="space-y-4">
          {inquiries.map((iq) => <AdminInquiryCard key={iq.id} inquiry={iq} />)}
        </div>
      ) : (
        <EmptyState title="No inquiries" description="Nothing matches this filter." />
      )}
    </div>
  );
}
