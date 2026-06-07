import Link from "next/link";
import { getActiveAds } from "@/lib/services/advertisementService";

/**
 * Renders active advertisements for a given placement on the public site.
 * Internal link URLs ("/search…") use next/link; external ones use a plain <a>.
 * Uses a plain <img> (not next/image) since ad images can be hosted anywhere.
 */
export async function AdBanner({
  position,
  className,
}: {
  position: "home_hero" | "sidebar" | "search_top";
  className?: string;
}) {
  const ads = await getActiveAds(position);
  if (ads.length === 0) return null;

  return (
    <div className={className}>
      {ads.map((ad) => {
        const img = (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={ad.image}
            alt={ad.title}
            className="h-full w-full rounded-lg object-cover shadow-card"
          />
        );
        const wrapper = "relative block aspect-[16/5] w-full overflow-hidden rounded-lg";

        if (!ad.linkUrl) {
          return <div key={ad.id} className={wrapper}>{img}</div>;
        }
        const isInternal = ad.linkUrl.startsWith("/");
        return isInternal ? (
          <Link key={ad.id} href={ad.linkUrl} className={wrapper}>{img}</Link>
        ) : (
          <a key={ad.id} href={ad.linkUrl} target="_blank" rel="noreferrer" className={wrapper}>{img}</a>
        );
      })}
    </div>
  );
}
