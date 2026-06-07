import type { MetadataRoute } from "next";
import { getSitemapEntries } from "@/lib/services/listingService";
import { POPULAR_AREAS } from "@/lib/config";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE}/search`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE}/auth/signup`, changeFrequency: "monthly", priority: 0.3 },
  ];

  const areaRoutes: MetadataRoute.Sitemap = POPULAR_AREAS.map((area) => ({
    url: `${SITE}/search?area=${encodeURIComponent(area)}`,
    changeFrequency: "daily",
    priority: 0.6,
  }));

  let listingRoutes: MetadataRoute.Sitemap = [];
  try {
    const entries = await getSitemapEntries();
    listingRoutes = entries.map((e) => ({
      url: `${SITE}/property/${e.slug}`,
      lastModified: new Date(e.updatedAt),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch {
    // DB not reachable at build time — return static routes only.
  }

  return [...staticRoutes, ...areaRoutes, ...listingRoutes];
}
