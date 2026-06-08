import { redirect } from "next/navigation";
import { ListingForm } from "@/components/shared/listing-form";
import { getActiveCategories } from "@/lib/services/categoryService";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata = { title: "Add a property" };

export default async function NewListingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?next=/owner/listings/new");

  const categories = await getActiveCategories();

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="font-serif text-3xl font-bold text-primary">Add a property</h1>
      <p className="mt-1 text-muted-foreground">List your property for free. We'll review it before it goes live.</p>
      <div className="mt-8">
        <ListingForm categories={categories} />
      </div>
    </div>
  );
}
