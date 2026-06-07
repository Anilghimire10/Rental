"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function ImageGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const photos = images.length ? images : [];

  if (photos.length === 0) {
    return (
      <div className="flex aspect-[16/10] w-full items-center justify-center rounded-lg bg-secondary text-muted-foreground">
        <ImageOff className="mr-2 h-5 w-5" /> No photos
      </div>
    );
  }

  const go = (dir: 1 | -1) => setActive((a) => (a + dir + photos.length) % photos.length);

  return (
    <div className="space-y-3">
      <div className="group relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-secondary">
        <Image
          src={photos[active]}
          alt={`${title} — photo ${active + 1}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 66vw"
          className="object-cover"
        />
        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-card/90 shadow-card opacity-0 transition group-hover:opacity-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-card/90 shadow-card opacity-0 transition group-hover:opacity-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white">
              {active + 1} / {photos.length}
            </div>
          </>
        )}
      </div>

      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {photos.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "relative h-16 w-24 shrink-0 overflow-hidden rounded-md border-2 transition",
                i === active ? "border-accent" : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              <Image src={src} alt={`Thumbnail ${i + 1}`} fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
