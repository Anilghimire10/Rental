import Link from "next/link";
import { List, Map as MapIcon } from "lucide-react";
import { ListingCard } from "@/components/shared/listing-card";
import { SearchFilters } from "@/components/shared/search-filters";
import { ListingsMap } from "@/components/shared/listings-map";
import { AdBanner } from "@/components/shared/ad-banner";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { searchPublicListings, getMapPoints } from "@/lib/services/listingService";
import { getActiveCategories } from "@/lib/services/categoryService";
import { getFavoriteIds } from "@/lib/services/favoriteService";
import { getCurrentUser } from "@/lib/auth/session";
import { searchParamsSchema } from "@/lib/validation/listing.schema";
import { cn } from "@/lib/utils";
import type { ListingSearchParams } from "@/lib/types";

export const metadata = {
  title: "Browse rentals in Pokhara",
  description: "Search rooms, flats, apartments and houses for rent in Pokhara. Filter by area, price, category and amenities.",
};

type SP = Record<string, string | string[] | undefined>;

function flatten(sp: SP): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(sp)) out[k] = Array.isArray(v) ? v[0] : v;
  return out;
}

export default async function SearchPage({ searchParams }: { searchParams: SP }) {
  const flat = flatten(searchParams);
  const isMap = flat.view === "map";

  const parsed = searchParamsSchema.safeParse(flat);
  const params: ListingSearchParams = parsed.success ? parsed.data : { page: 1, pageSize: 12 };

  const [categories, favIds, user] = await Promise.all([
    getActiveCategories(),
    getFavoriteIds(),
    getCurrentUser(),
  ]);
  const isAuthed = !!user;

  const toggleHref = (view: "list" | "map") => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(flat)) if (v && k !== "view") sp.set(k, v);
    if (view === "map") sp.set("view", "map");
    return `/search?${sp.toString()}`;
  };

  return (
    <div className="container py-8">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-serif text-2xl font-bold text-primary md:text-3xl">Properties for rent in Pokhara</h1>
          <p className="text-sm text-muted-foreground">Approximate locations shown — your privacy is protected.</p>
        </div>
        <div className="flex rounded-md border border-border p-1">
          <Link href={toggleHref("list")} className={cn("flex items-center gap-1.5 rounded px-3 py-1.5 text-sm", !isMap ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
            <List className="h-4 w-4" /> List
          </Link>
          <Link href={toggleHref("map")} className={cn("flex items-center gap-1.5 rounded px-3 py-1.5 text-sm", isMap ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
            <MapIcon className="h-4 w-4" /> Map
          </Link>
        </div>
      </div>

      <AdBanner position="search_top" className="mb-6" />

      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <SearchFilters categories={categories} />
        </aside>

        <div>
          {isMap ? (
            <MapView params={params} />
          ) : (
            <ListView params={params} flat={flat} isAuthed={isAuthed} favIds={favIds} />
          )}
        </div>
      </div>
    </div>
  );
}

async function ListView({
  params,
  flat,
  isAuthed,
  favIds,
}: {
  params: ListingSearchParams;
  flat: Record<string, string | undefined>;
  isAuthed: boolean;
  favIds: Set<string>;
}) {
  const result = await searchPublicListings(params);
  if (result.items.length === 0) {
    return <EmptyState title="No properties match" description="Try widening your filters or searching a different area." />;
  }
  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground">{result.total} properties found</p>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {result.items.map((l) => (
          <ListingCard key={l.id} listing={l} isAuthed={isAuthed} favorited={favIds.has(l.id)} />
        ))}
      </div>
      <Pagination page={result.page} totalPages={result.totalPages} params={{ ...flat, page: undefined }} />
    </>
  );
}

async function MapView({ params }: { params: ListingSearchParams }) {
  const points = await getMapPoints(params);
  return <ListingsMap points={points} />;
}
