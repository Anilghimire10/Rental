import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Plus, MessageSquare, CalendarCheck, Eye, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { ListingStatusBadge } from "@/components/shared/status-badge";
import { OwnerListingActions } from "@/components/shared/owner-listing-actions";
import { getOwnerListings } from "@/lib/services/listingService";
import { getCurrentUser } from "@/lib/auth/session";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "My properties" };

export default async function OwnerListingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?next=/owner/listings");

  const listings = await getOwnerListings();

  return (
    <div className="container py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary">My properties</h1>
          <p className="text-muted-foreground">Manage your listings and track interest.</p>
        </div>
        <Button asChild variant="accent"><Link href="/owner/listings/new"><Plus className="h-4 w-4" /> Add property</Link></Button>
      </div>

      {!user.isVerified && (
        <p className="mb-6 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Verify your email before submitting a property. Check your inbox.
        </p>
      )}

      {listings.length ? (
        <div className="space-y-4">
          {listings.map((l) => (
            <Card key={l.id}>
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-md bg-secondary sm:w-36">
                  {l.coverImage && <Image src={l.coverImage} alt={l.title} fill sizes="144px" className="object-cover" />}
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">{l.propertyCode}</span>
                    <ListingStatusBadge status={l.status} />
                    <span className={l.isRented ? "text-xs font-medium text-destructive" : "text-xs font-medium text-emerald-600"}>
                      {l.isRented ? "Unavailable" : "Available"}
                    </span>
                  </div>
                  <Link href={`/property/${l.slug}`} className="mt-1 block font-serif text-lg font-semibold hover:text-primary">{l.title}</Link>
                  <p className="text-sm text-muted-foreground">{l.area} · {formatPrice(l.monthlyRent)}/mo</p>
                  {l.status === "rejected" && l.rejectionReason && (
                    <p className="mt-1 text-sm text-destructive">Rejected: {l.rejectionReason}</p>
                  )}
                  <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> {l.inquiryCount} inquiries</span>
                    <span className="flex items-center gap-1"><CalendarCheck className="h-3.5 w-3.5" /> {l.visitCount} visits</span>
                    <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {l.viewCount} views</span>
                  </div>
                </div>

                <OwnerListingActions id={l.id} isRented={l.isRented} />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Building2 className="h-10 w-10" />}
          title="No properties yet"
          description="List your first property — it's free and takes a few minutes."
        >
          <Button asChild variant="accent"><Link href="/owner/listings/new"><Plus className="h-4 w-4" /> Add property</Link></Button>
        </EmptyState>
      )}
    </div>
  );
}
