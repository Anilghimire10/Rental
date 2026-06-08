import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { ListingCard } from "@/components/shared/listing-card";
import { SearchBar } from "@/components/shared/search-bar";
import { AdBanner } from "@/components/shared/ad-banner";
import { EmptyState } from "@/components/shared/empty-state";
import { getFeaturedListings, getLatestListings } from "@/lib/services/listingService";
import { getActiveCategories } from "@/lib/services/categoryService";
import { getFavoriteIds } from "@/lib/services/favoriteService";
import { getCurrentUser } from "@/lib/auth/session";
import { POPULAR_AREAS, BRAND } from "@/lib/config";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1920&q=80";

export default async function HomePage() {
  const current = await getCurrentUser();
  if (current?.role === "admin") redirect("/admin");

  const [featured, latest, categories, favIds, user] = await Promise.all([
    getFeaturedListings(6),
    getLatestListings(8),
    getActiveCategories(),
    getFavoriteIds(),
    getCurrentUser(),
  ]);
  const isAuthed = !!user;

  return (
    <>
      {/* Search hero with background house image */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-cover bg-center" style={{ backgroundImage: `url(${HERO_IMAGE})` }} />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/80 via-primary/65 to-primary/85" />

        <div className="w-full px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
          <div className="mx-auto max-w-4xl text-center text-primary-foreground">
            <h1 className="text-balance font-serif text-4xl font-bold leading-tight md:text-5xl">
              {BRAND} — find your next home in Pokhara
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-balance text-lg text-primary-foreground/85">
              Rooms, flats, houses, office spaces and more — without the broker runaround.
            </p>
          </div>

          {/* Search card on top of the image */}
          <div className="mx-auto mt-8 w-full max-w-5xl rounded-2xl bg-card/95 p-4 shadow-soft ring-1 ring-black/5 backdrop-blur">
            <SearchBar categories={categories} />
          </div>
        </div>
      </section>

      <AdBanner position="home_hero" className="w-full px-4 pt-8 sm:px-6 lg:px-10" />

      {/* Latest properties right below the search */}
      <section className="w-full px-4 py-10 sm:px-6 lg:px-10">
        <SectionHeader title="Latest properties" subtitle="Freshly listed homes" href="/search" />
        {latest.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {latest.map((l) => (
              <ListingCard key={l.id} listing={l} isAuthed={isAuthed} favorited={favIds.has(l.id)} />
            ))}
          </div>
        ) : (
          <EmptyState title="No listings yet" description="Be the first to list a property." />
        )}
      </section>

      {featured.length > 0 && (
        <section className="w-full px-4 py-6 sm:px-6 lg:px-10">
          <SectionHeader title="Featured properties" subtitle="Hand-picked homes" href="/search?sort=popular" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((l) => (
              <ListingCard key={l.id} listing={l} isAuthed={isAuthed} favorited={favIds.has(l.id)} />
            ))}
          </div>
        </section>
      )}

      {/* Popular areas */}
      <section className="w-full px-4 py-10 sm:px-6 lg:px-10">
        <SectionHeader title="Popular areas" subtitle="Explore by neighborhood" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {POPULAR_AREAS.map((area) => (
            <Link
              key={area}
              href={`/search?area=${encodeURIComponent(area)}`}
              className="group flex items-center justify-between rounded-lg border border-border bg-card p-4 text-sm font-medium shadow-card transition hover:border-accent"
            >
              {area}
              <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-accent" />
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

function SectionHeader({ title, subtitle, href }: { title: string; subtitle?: string; href?: string }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className="font-serif text-2xl font-bold text-primary md:text-3xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {href && (
        <Link href={href} className="flex shrink-0 items-center gap-1 text-sm font-medium text-accent hover:underline">
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
