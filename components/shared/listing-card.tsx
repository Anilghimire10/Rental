import Link from "next/link";
import Image from "next/image";
import { BedDouble, Bath, Maximize, MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/shared/favorite-button";
import { formatPrice, timeAgo } from "@/lib/utils";
import type { PublicListingCard } from "@/lib/types";

export function ListingCard({
  listing,
  favorited = false,
  isAuthed = false,
}: {
  listing: PublicListingCard;
  favorited?: boolean;
  isAuthed?: boolean;
}) {
  return (
    <article className="group relative overflow-hidden rounded-lg border border-border bg-card shadow-card transition-all hover:-translate-y-0.5 hover:shadow-soft">
      <FavoriteButton listingId={listing.id} initialFavorited={favorited} isAuthed={isAuthed} />

      <Link href={`/property/${listing.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
          {listing.coverImage ? (
            <Image
              src={listing.coverImage}
              alt={listing.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">No photo</div>
          )}
          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            <Badge variant={listing.isRented ? "destructive" : "success"}>
              {listing.isRented ? "Unavailable" : "Available"}
            </Badge>
            {listing.isFeatured && (
              <span className="flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-accent-foreground shadow-card">
                <Star className="h-3.5 w-3.5 fill-current" /> Featured
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {listing.propertyCode}
            </span>
            {listing.categoryName && <Badge variant="secondary">{listing.categoryName}</Badge>}
          </div>

          <h3 className="line-clamp-1 font-serif text-lg font-semibold text-foreground">{listing.title}</h3>

          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" /> {listing.area}, {listing.city}
          </p>

          <div className="flex items-center gap-4 pt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><BedDouble className="h-4 w-4" /> {listing.bedrooms}</span>
            <span className="flex items-center gap-1"><Bath className="h-4 w-4" /> {listing.bathrooms}</span>
            {listing.areaSqft ? (
              <span className="flex items-center gap-1"><Maximize className="h-4 w-4" /> {listing.areaSqft} ft²</span>
            ) : null}
          </div>

          <div className="flex items-end justify-between pt-2">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-primary">{formatPrice(listing.monthlyRent)}</span>
              <span className="text-xs text-muted-foreground">/ month</span>
              {listing.isNegotiable && (
                <Badge variant="accent" className="ml-1">Negotiable</Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{timeAgo(listing.createdAt)}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
