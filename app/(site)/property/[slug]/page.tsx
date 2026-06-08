import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  BedDouble, Bath, Maximize, Home, Layers, ChefHat, MapPin, CalendarDays, Wallet, CheckCircle2, Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ImageGallery } from "@/components/shared/image-gallery";
import { PropertyMap } from "@/components/shared/property-map";
import { PropertyContact } from "@/components/shared/property-contact";
import { ListingCard } from "@/components/shared/listing-card";
import {
  getPublicListingByCode,
  getSimilarListings,
  recordView,
} from "@/lib/services/listingService";
import { getFavoriteIds } from "@/lib/services/favoriteService";
import { getCurrentUser } from "@/lib/auth/session";
import { propertyCodeFromSlug, formatPrice, formatDate, titleCase, timeAgo } from "@/lib/utils";
import { BRAND } from "@/lib/config";

async function load(slug: string) {
  const code = propertyCodeFromSlug(slug);
  if (!code) return null;
  return getPublicListingByCode(code);
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const listing = await load(params.slug);
  if (!listing) return { title: "Property not found" };
  const title = `${listing.title} — ${listing.area}, Pokhara`;
  const description = `${listing.categoryName ?? "Property"} for rent at ${formatPrice(listing.monthlyRent)}/month in ${listing.area}, Pokhara. ${listing.bedrooms} bed · ${listing.bathrooms} bath. ${BRAND} mediated rental.`;
  return {
    title,
    description,
    alternates: { canonical: `/property/${listing.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      images: listing.coverImage ? [{ url: listing.coverImage }] : undefined,
    },
  };
}

export default async function PropertyDetailPage({ params }: { params: { slug: string } }) {
  const listing = await load(params.slug);
  if (!listing) notFound();

  // Fire-and-forget view counter + parallel data.
  const [favIds, user] = await Promise.all([getFavoriteIds(), getCurrentUser()]);
  void recordView(listing.id);
  const similar = await getSimilarListings(listing);

  const facts = [
    { icon: BedDouble, label: "Bedrooms", value: listing.bedrooms },
    { icon: Bath, label: "Bathrooms", value: listing.bathrooms },
    { icon: ChefHat, label: "Kitchens", value: listing.kitchens },
    { icon: Home, label: "Total rooms", value: listing.totalRooms },
    { icon: Layers, label: "Floor", value: listing.floorNumber ?? "—" },
    { icon: Maximize, label: "Area", value: listing.areaSqft ? `${listing.areaSqft} ft²` : "—" },
  ];

  return (
    <div className="container py-8">
      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Residence",
            name: listing.title,
            description: listing.description,
            url: `/property/${listing.slug}`,
            image: listing.coverImage ?? undefined,
            address: { "@type": "PostalAddress", addressLocality: listing.area, addressRegion: "Gandaki", addressCountry: "NP" },
          }),
        }}
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Main */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{listing.propertyCode}</Badge>
            {listing.categoryName && <Badge variant="accent">{listing.categoryName}</Badge>}
            {listing.isFeatured && <Badge>Featured</Badge>}
            {listing.isRented && <Badge variant="destructive">Rented</Badge>}
            {listing.isNegotiable && <Badge variant="accent">Negotiable</Badge>}
            <span className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
              <span>Posted {timeAgo(listing.createdAt)}</span>
              <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {listing.viewCount} views</span>
            </span>
          </div>

          <div>
            <h1 className="font-serif text-3xl font-bold text-primary">{listing.title}</h1>
            <p className="mt-1 flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-4 w-4" /> {listing.area}
              {listing.wardNumber ? `, Ward ${listing.wardNumber}` : ""}, {listing.city}
              {listing.nearbyLandmark ? ` · near ${listing.nearbyLandmark}` : ""}
            </p>
          </div>

          <ImageGallery images={listing.gallery} title={listing.title} />

          {/* Key facts */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {facts.map((f) => (
              <div key={f.label} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                <f.icon className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-xs text-muted-foreground">{f.label}</p>
                  <p className="text-sm font-semibold">{f.value}</p>
                </div>
              </div>
            ))}
          </div>

          <Section title="Description">
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">{listing.description}</p>
          </Section>

          <Section title="Pricing & terms">
            <div className="grid gap-3 sm:grid-cols-3">
              <KeyVal icon={Wallet} label="Monthly rent" value={formatPrice(listing.monthlyRent)} />
              <KeyVal icon={Wallet} label="Security deposit" value={formatPrice(listing.securityDeposit)} />
              <KeyVal icon={CalendarDays} label="Available from" value={formatDate(listing.availableFrom)} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {listing.isNegotiable && <Badge variant="accent">Rent negotiable</Badge>}
              {listing.advanceRequired && <Badge variant="warning">Advance required</Badge>}
              <Badge variant={listing.electricityIncluded ? "success" : "outline"}>
                Electricity {listing.electricityIncluded ? "included" : "extra"}
              </Badge>
              <Badge variant={listing.waterIncluded ? "success" : "outline"}>
                Water {listing.waterIncluded ? "included" : "extra"}
              </Badge>
            </div>
          </Section>

          {listing.amenities.length > 0 && (
            <Section title="Amenities">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {listing.amenities.map((a) => (
                  <span key={a} className="flex items-center gap-2 text-sm text-foreground/90">
                    <CheckCircle2 className="h-4 w-4 text-accent" /> {titleCase(a)}
                  </span>
                ))}
              </div>
            </Section>
          )}

          <Section title="Approximate location">
            <p className="mb-3 text-sm text-muted-foreground">
              Exact address is shared after our team connects you with the owner.
            </p>
            <PropertyMap lat={listing.approxLat} lng={listing.approxLng} area={listing.area} />
          </Section>
        </div>

        {/* Sidebar contact */}
        <aside>
          <PropertyContact listing={listing} user={user} favorited={favIds.has(listing.id)} />
        </aside>
      </div>

      {similar.length > 0 && (
        <div className="mt-14">
          <h2 className="mb-6 font-serif text-2xl font-bold text-primary">Similar properties in {listing.area}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((l) => (
              <ListingCard key={l.id} listing={l} isAuthed={!!user} favorited={favIds.has(l.id)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-serif text-xl font-semibold text-primary">{title}</h2>
      <Separator className="my-3" />
      {children}
    </section>
  );
}

function KeyVal({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
      <Icon className="h-5 w-5 text-accent" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}
