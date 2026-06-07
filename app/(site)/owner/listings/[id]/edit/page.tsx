import { notFound, redirect } from "next/navigation";
import { ListingForm } from "@/components/shared/listing-form";
import { getActiveCategories } from "@/lib/services/categoryService";
import { getOwnerListing } from "@/lib/services/listingService";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata = { title: "Edit property" };

export default async function EditListingPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect(`/auth/login?next=/owner/listings/${params.id}/edit`);

  const [listing, categories] = await Promise.all([
    getOwnerListing(params.id),
    getActiveCategories(),
  ]);
  if (!listing) notFound();

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="font-serif text-3xl font-bold text-primary">Edit property</h1>
      <p className="mt-1 text-muted-foreground">
        {listing.propertyCode} · Saving changes re-submits the listing for approval.
      </p>
      <div className="mt-8">
        <ListingForm categories={categories} existing={listing} />
      </div>
    </div>
  );
}
