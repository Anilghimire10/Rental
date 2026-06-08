"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Sliding image carousel for listing cards. Lives inside the card's <Link>, so
 * the arrow/dot clicks call preventDefault to change the image without
 * navigating to the property page.
 */
export function CardImageCarousel({ images, title }: { images: string[]; title: string }) {
  const [i, setI] = useState(0);
  const photos = images.length ? images : [];

  if (photos.length === 0) {
    return <div className="flex h-full items-center justify-center text-muted-foreground">No photo</div>;
  }

  const go = (dir: 1 | -1) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setI((p) => (p + dir + photos.length) % photos.length);
  };
  const jump = (idx: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setI(idx);
  };

  return (
    <div className="group/carousel relative h-full w-full">
      <Image
        src={photos[i]}
        alt={`${title} — photo ${i + 1}`}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={go(-1)}
            aria-label="Previous photo"
            className="absolute left-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-card/90 text-foreground opacity-0 shadow-card transition group-hover/carousel:opacity-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={go(1)}
            aria-label="Next photo"
            className="absolute right-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-card/90 text-foreground opacity-0 shadow-card transition group-hover/carousel:opacity-100"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1">
            {photos.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={jump(idx)}
                aria-label={`Go to photo ${idx + 1}`}
                className={cn(
                  "h-1.5 rounded-full bg-white/70 transition-all",
                  idx === i ? "w-4 bg-white" : "w-1.5",
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
