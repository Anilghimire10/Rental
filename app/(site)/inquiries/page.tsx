import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { InquiryStatusBadge } from "@/components/shared/status-badge";
import { getMyInquiries } from "@/lib/services/inquiryService";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "My inquiries" };

export default async function MyInquiriesPage() {
  const inquiries = await getMyInquiries();

  return (
    <div className="container py-10">
      <h1 className="font-serif text-3xl font-bold text-primary">My inquiries</h1>
      <p className="mt-1 text-muted-foreground">Track the status of the properties you've reached out about.</p>

      <div className="mt-8 space-y-4">
        {inquiries.length ? (
          inquiries.map((iq) => (
            <Card key={iq.id}>
              <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">{iq.propertyCode}</span>
                    <InquiryStatusBadge status={iq.status} />
                  </div>
                  <Link href={`/property/${iq.slug}`} className="mt-1 block font-serif text-lg font-semibold hover:text-primary">
                    {iq.listingTitle}
                  </Link>
                  <p className="text-sm text-muted-foreground">{iq.listingArea} · sent {formatDate(iq.createdAt)}</p>
                  {iq.message && <p className="mt-2 line-clamp-2 text-sm text-foreground/80">“{iq.message}”</p>}
                </div>
                <Button asChild variant="outline" size="sm"><Link href={`/property/${iq.slug}`}>View property</Link></Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <EmptyState
            icon={<MessageSquare className="h-10 w-10" />}
            title="No inquiries yet"
            description="When you send an inquiry, you'll be able to track it here."
          >
            <Button asChild><Link href="/search">Find a home</Link></Button>
          </EmptyState>
        )}
      </div>
    </div>
  );
}
