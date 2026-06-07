import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/shared/listing-card";
import { EmptyState } from "@/components/shared/empty-state";
import { getMyFavorites } from "@/lib/services/favoriteService";

export const metadata = { title: "Saved properties" };

export default async function FavoritesPage() {
  const favorites = await getMyFavorites();

  return (
    <div className="container py-10">
      <h1 className="font-serif text-3xl font-bold text-primary">Saved properties</h1>
      <p className="mt-1 text-muted-foreground">Your shortlist of homes.</p>

      <div className="mt-8">
        {favorites.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((l) => (
              <ListingCard key={l.id} listing={l} isAuthed favorited />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Heart className="h-10 w-10" />}
            title="No saved properties yet"
            description="Tap the heart on any listing to shortlist it here."
          >
            <Button asChild><Link href="/search">Browse properties</Link></Button>
          </EmptyState>
        )}
      </div>
    </div>
  );
}
