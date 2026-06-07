"use client";

import { useMemo } from "react";
import Map, { Source, Layer } from "react-map-gl";
import type { CircleLayer } from "react-map-gl";
import { MapPin } from "lucide-react";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

/**
 * Approximate-location map for a single property. Renders a translucent CIRCLE
 * around the (already jittered) approximate coordinates — never an exact pin.
 * This is the only geographic info a tenant ever sees.
 */
export function PropertyMap({
  lat,
  lng,
  area,
}: {
  lat: number;
  lng: number;
  area: string;
}) {
  const circle = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: [
        {
          type: "Feature" as const,
          geometry: { type: "Point" as const, coordinates: [lng, lat] },
          properties: {},
        },
      ],
    }),
    [lat, lng],
  );

  if (!TOKEN) {
    return (
      <div className="flex aspect-[16/8] w-full items-center justify-center rounded-lg border border-dashed border-border bg-secondary text-sm text-muted-foreground">
        <MapPin className="mr-2 h-4 w-4" /> Approximate area: {area} (set NEXT_PUBLIC_MAPBOX_TOKEN to show the map)
      </div>
    );
  }

  const layer: CircleLayer = {
    id: "approx-circle",
    type: "circle",
    source: "approx",
    paint: {
      "circle-radius": 60,
      "circle-color": "#1A3C34",
      "circle-opacity": 0.15,
      "circle-stroke-color": "#1A3C34",
      "circle-stroke-width": 1.5,
      "circle-stroke-opacity": 0.4,
    },
  };

  return (
    <div className="aspect-[16/8] w-full overflow-hidden rounded-lg border border-border">
      <Map
        mapboxAccessToken={TOKEN}
        initialViewState={{ longitude: lng, latitude: lat, zoom: 13.5 }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        scrollZoom={false}
        attributionControl={false}
      >
        <Source id="approx" type="geojson" data={circle}>
          <Layer {...layer} />
        </Source>
      </Map>
    </div>
  );
}
