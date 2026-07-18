"use client";

import Image from "next/image";
import { useState } from "react";
import type { ListingImage } from "@/types/listing";

interface Props {
  images: ListingImage[];
  name: string;
}

// A simple lead image + thumbnail strip. 360° tours come in M4; for now these are
// standard photos, ordered by the sortOrder we stored.
export function PhotoGallery({ images, name }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex];

  if (!active) {
    return <div className="aspect-[16/9] w-full rounded-2xl bg-neutral-100" />;
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-neutral-100">
        <Image
          src={active.url}
          alt={active.alt ?? name}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 800px"
          className="object-cover"
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={image.url}
              onClick={() => setActiveIndex(index)}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg ring-2 transition ${
                index === activeIndex ? "ring-neutral-900" : "ring-transparent"
              }`}
            >
              <Image src={image.url} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
