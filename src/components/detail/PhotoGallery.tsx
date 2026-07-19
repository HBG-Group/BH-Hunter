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
  // Two stacked layers; picking a thumbnail loads the new image on the hidden
  // layer, then reveals it — a cross-fade with no layers left behind.
  const [layers, setLayers] = useState({ a: 0, b: 0, showA: true });
  const activeIndex = layers.showA ? layers.a : layers.b;

  if (!images[0]) {
    return <div className="aspect-[16/9] w-full rounded-2xl bg-neutral-100" />;
  }

  const select = (index: number) => {
    if (index === activeIndex) return;
    setLayers((prev) =>
      prev.showA ? { ...prev, b: index, showA: false } : { ...prev, a: index, showA: true },
    );
  };

  const imgA = images[layers.a];
  const imgB = images[layers.b];
  const sizes = "(max-width: 1024px) 100vw, 800px";

  return (
    <div className="space-y-3">
      <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-neutral-100">
        {/* Fade image A */}
        <div
          className={`absolute inset-0 transition-opacity duration-200 ease-out ${
            layers.showA ? "opacity-100" : "opacity-0"
          }`}
        >
          {imgA && (
            <Image src={imgA.url} alt={imgA.alt ?? name} fill priority sizes={sizes} className="object-cover" />
          )}
        </div>
        {/* Fade image B */}
        <div
          className={`absolute inset-0 transition-opacity duration-200 ease-out ${
            layers.showA ? "opacity-0" : "opacity-100"
          }`}
        >
          {imgB && <Image src={imgB.url} alt={imgB.alt ?? name} fill sizes={sizes} className="object-cover" />}
        </div>
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={image.url}
              onClick={() => select(index)}
              // Active thumbnail
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
