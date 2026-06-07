"use client";

import Map, { Marker } from "react-map-gl";
import { MapPin } from "lucide-react";
import { CITY_CENTER } from "@/lib/config";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

/**
 * Owner-side EXACT location picker (admin/owner only context). Click or drag the
 * pin to set precise coordinates. These are stored privately; the public site
 * only ever shows a jittered approximate circle.
 */
export function LocationPicker({
  lat,
  lng,
  onChange,
}: {
  lat: number;
  lng: number;
  onChange: (coords: { lat: number; lng: number }) => void;
}) {
  if (!TOKEN) {
    return (
      <p className="rounded-md border border-dashed border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
        <MapPin className="mr-1 inline h-3 w-3" /> Map disabled (no Mapbox token). Enter latitude/longitude manually below.
      </p>
    );
  }

  const valid = Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0);
  const center = valid ? { lat, lng } : { lat: CITY_CENTER.lat, lng: CITY_CENTER.lng };

  return (
    <div className="h-64 w-full overflow-hidden rounded-lg border border-border">
      <Map
        mapboxAccessToken={TOKEN}
        initialViewState={{ longitude: center.lng, latitude: center.lat, zoom: 13 }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        onClick={(e) => onChange({ lat: e.lngLat.lat, lng: e.lngLat.lng })}
      >
        {valid && (
          <Marker
            longitude={lng}
            latitude={lat}
            draggable
            onDragEnd={(e) => onChange({ lat: e.lngLat.lat, lng: e.lngLat.lng })}
          >
            <MapPin className="h-7 w-7 -translate-y-1 fill-accent text-primary" />
          </Marker>
        )}
      </Map>
    </div>
  );
}
