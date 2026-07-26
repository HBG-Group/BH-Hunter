"use client";

import Image from "next/image";
import { useState } from "react";
import { AdDetailModal } from "./AdDetailModal";

// Sanitized, serializable ad data handed down from the server component. URLs are
// already run through the security allowlist in AdStrip, so the client only renders.
export interface AdCardData {
  id: string;
  title: string;
  description: string | null;
  imageUrls: string[];
  links: {
    website: string | null;
    facebook: string | null;
    messenger: string | null;
  };
}

// A clickable ad card. Clicking opens the detail modal (all images + info) rather
// than jumping straight to the advertiser's site.
export function AdCard({ ad }: { ad: AdCardData }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block w-full rounded-2xl border border-line bg-white p-3 text-left transition-shadow hover:shadow-sm"
      >
        <div className="relative h-32 w-full overflow-hidden rounded-xl bg-neutral-100">
          <Image src={ad.imageUrls[0]} alt="" fill sizes="(max-width: 640px) 100vw, 360px" className="object-cover" />
          {ad.imageUrls.length > 1 && (
            <span className="absolute bottom-2 right-2 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-white">
              {ad.imageUrls.length} photos
            </span>
          )}
        </div>
        <div className="mt-2.5">
          <p className="text-sm font-medium text-ink">{ad.title}</p>
          {ad.description && <p className="mt-0.5 line-clamp-1 text-xs text-muted">{ad.description}</p>}
        </div>
        <span className="mt-1 block text-[10px] uppercase tracking-wide text-neutral-400">Ad</span>
      </button>

      {open && <AdDetailModal ad={ad} onClose={() => setOpen(false)} />}
    </>
  );
}
