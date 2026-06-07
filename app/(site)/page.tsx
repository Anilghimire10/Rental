import Link from "next/link";
import { redirect } from "next/navigation";
import { Search, ShieldCheck, MessageCircle, KeyRound, Star, ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ListingCard } from "@/components/shared/listing-card";
import { SearchBar } from "@/components/shared/search-bar";
import { AdBanner } from "@/components/shared/ad-banner";
import { EmptyState } from "@/components/shared/empty-state";
import { getFeaturedListings, getLatestListings } from "@/lib/services/listingService";
import { getActiveCategories } from "@/lib/services/categoryService";
import { getFavoriteIds } from "@/lib/services/favoriteService";
import { getCurrentUser } from "@/lib/auth/session";
import { POPULAR_AREAS, BRAND, AGENCY } from "@/lib/config";
import { whatsappLink } from "@/lib/utils";

export default async function HomePage() {
  // Admins go straight to their dashboard — they don't need the public landing page.
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
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-secondary/60 to-background">
        <div className="container py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <MapPin className="h-3 w-3" /> Now serving Pokhara
            </span>
            <h1 className="mt-5 text-balance font-serif text-4xl font-bold leading-tight text-primary md:text-5xl">
              Find your next home in Pokhara — without the broker runaround
            </h1>
            <p className="mt-4 text-balance text-lg text-muted-foreground">
              Browse verified rooms, flats and houses. We mediate every introduction, so your
              details stay private until you're ready.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-4xl">
            <SearchBar categories={categories} />
          </div>

          {/* Categories */}
          <div className="mx-auto mt-8 flex max-w-4xl flex-wrap justify-center gap-2">
            {categories.slice(0, 8).map((c) => (
              <Link
                key={c.id}
                href={`/search?categorySlug=${c.slug}`}
                className="rounded-full border border-border bg-card px-4 py-1.5 text-sm transition hover:border-accent hover:text-primary"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Advertisement banner (admin-managed, position: home_hero) */}
      <AdBanner position="home_hero" className="container mt-10" />

      {/* Featured */}
      <section className="container py-14">
        <SectionHeader
          title="Featured properties"
          subtitle="Hand-picked homes our team recommends"
          href="/search?sort=popular"
        />
        {featured.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((l) => (
              <ListingCard key={l.id} listing={l} isAuthed={isAuthed} favorited={favIds.has(l.id)} />
            ))}
          </div>
        ) : (
          <EmptyState title="No featured listings yet" description="Check back soon — new homes are added daily." />
        )}
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-y border-border bg-card">
        <div className="container py-16">
          <h2 className="text-center font-serif text-3xl font-bold text-primary">How {BRAND} works</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-muted-foreground">
            A safer way to rent — we sit between you and the owner.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <Step icon={<Search className="h-6 w-6" />} step="1" title="Browse listings"
              text="Search by area, price and type. See approximate locations on the map — never exact pins." />
            <Step icon={<MessageCircle className="h-6 w-6" />} step="2" title="Send an inquiry"
              text="Request a viewing or send a message. It goes to our team, not the owner." />
            <Step icon={<KeyRound className="h-6 w-6" />} step="3" title="We connect you"
              text="We mediate the introduction and help you move in — free of charge." />
          </div>
        </div>
      </section>

      {/* Latest */}
      <section className="container py-14">
        <SectionHeader title="Latest listings" subtitle="Fresh homes just added" href="/search" />
        {latest.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {latest.map((l) => (
              <ListingCard key={l.id} listing={l} isAuthed={isAuthed} favorited={favIds.has(l.id)} />
            ))}
          </div>
        ) : (
          <EmptyState title="No listings yet" />
        )}
      </section>

      {/* Popular areas */}
      <section className="container pb-14">
        <SectionHeader title="Popular areas in Pokhara" subtitle="Explore by neighborhood" />
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

      {/* Trust / Testimonials */}
      <section className="border-y border-border bg-card">
        <div className="container py-16">
          <div className="grid gap-8 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name}>
                <CardContent className="space-y-3 p-6">
                  <div className="flex gap-0.5 text-accent">
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                  </div>
                  <p className="text-sm text-foreground/90">“{t.quote}”</p>
                  <p className="text-sm font-semibold">{t.name} <span className="font-normal text-muted-foreground">· {t.role}</span></p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="container py-16">
        <div className="flex flex-col items-center gap-6 rounded-2xl bg-primary p-10 text-center text-primary-foreground md:flex-row md:justify-between md:text-left">
          <div className="max-w-xl">
            <h2 className="font-serif text-2xl font-bold">Have a property to rent out?</h2>
            <p className="mt-2 text-primary-foreground/80">
              List it free. We handle inquiries and keep your contact details private.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild variant="accent" size="lg">
              <Link href="/owner/listings/new">List your property</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
              <a href={whatsappLink(AGENCY.whatsapp)} target="_blank" rel="noreferrer">
                <ShieldCheck className="h-4 w-4" /> Talk to us
              </a>
            </Button>
          </div>
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

function Step({ icon, step, title, text }: { icon: React.ReactNode; step: string; title: string; text: string }) {
  return (
    <div className="relative rounded-lg border border-border bg-background p-6">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-primary">{icon}</div>
      <span className="absolute right-5 top-5 font-serif text-3xl font-bold text-border">{step}</span>
      <h3 className="font-serif text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

const TESTIMONIALS = [
  { name: "Anita K.", role: "Tenant, Lakeside", quote: "Found a 2BHK in three days. Loved that I didn't have to share my number with strangers." },
  { name: "Bikash T.", role: "Owner, Bagar", quote: "Listed my flat for free and the GharBhada team handled every inquiry. Rented in a week." },
  { name: "Sujata R.", role: "Student, Mahendrapool", quote: "The map only shows the area, which felt safe. The team set up my visit quickly." },
];
