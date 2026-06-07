"use client";

import { useState } from "react";
import Link from "next/link";
import Map, { Marker, Popup } from "react-map-gl";
import { MapPin } from "lucide-react";
import { CITY_CENTER } from "@/lib/config";
import { formatPrice } from "@/lib/utils";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export interface MapPoint {
  id: string;
  slug: string;
  title: string;
  monthlyRent: number;
  area: string;
  approxLat: number;
  approxLng: number;
  coverImage: string | null;
}

/** Search "map view" — approximate markers only (coords already jittered). */
export function ListingsMap({ points }: { points: MapPoint[] }) {
  const [active, setActive] = useState<MapPoint | null>(null);

  if (!TOKEN) {
    return (
      <div className="flex h-[70vh] w-full items-center justify-center rounded-lg border border-dashed border-border bg-secondary text-sm text-muted-foreground">
        <MapPin className="mr-2 h-4 w-4" /> Set NEXT_PUBLIC_MAPBOX_TOKEN to enable the map view.
      </div>
    );
  }

  return (
    <div className="h-[70vh] w-full overflow-hidden rounded-lg border border-border">
      <Map
        mapboxAccessToken={TOKEN}
        initialViewState={{ longitude: CITY_CENTER.lng, latitude: CITY_CENTER.lat, zoom: CITY_CENTER.zoom }}
        mapStyle="mapbox://styles/mapbox/light-v11"
      >
        {points.map((p) => (
          <Marker
            key={p.id}
            longitude={p.approxLng}
            latitude={p.approxLat}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setActive(p);
            }}
          >
            <span className="cursor-pointer rounded-full bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground shadow-card">
              {formatPrice(p.monthlyRent)}
            </span>
          </Marker>
        ))}

        {active && (
          <Popup
            longitude={active.approxLng}
            latitude={active.approxLat}
            anchor="top"
            onClose={() => setActive(null)}
            closeButton={false}
            offset={12}
          >
            <Link href={`/property/${active.slug}`} className="block w-44">
              {active.coverImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={active.coverImage} alt={active.title} className="mb-1 h-24 w-full rounded object-cover" />
              )}
              <p className="line-clamp-1 text-sm font-semibold text-primary">{active.title}</p>
              <p className="text-xs text-muted-foreground">{active.area}</p>
            </Link>
          </Popup>
        )}
      </Map>
    </div>
  );
}
