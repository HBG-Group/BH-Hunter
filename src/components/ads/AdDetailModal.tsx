"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { AdCardData } from "./AdCard";

interface Props {
  ad: AdCardData;
  onClose: () => void;
}

// The full-look modal for an ad: every uploaded image in a gallery, the full
// description, and the outbound links — so a click opens the ad first instead of
// leaving the site straight away.
export function AdDetailModal({ ad, onClose }: Props) {
  const [active, setActive] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const links = [
    { href: ad.links.website, label: "Visit website" },
    { href: ad.links.facebook, label: "Facebook" },
    { href: ad.links.messenger, label: "Message" },
  ].filter((l): l is { href: string; label: string } => Boolean(l.href));

  // Escape closes; focus returns to the card that opened the modal.
  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement;
    dialogRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previouslyFocused.current?.focus();
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      >
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="ad-modal-title"
          tabIndex={-1}
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          onClick={(event) => event.stopPropagation()}
          className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
        >
          {/* Main image — all photos are stacked and preloaded, so switching is an
              instant cross-fade instead of a fresh network load. */}
          <div className="relative aspect-[4/3] w-full shrink-0 bg-neutral-100">
            {ad.imageUrls.map((url, index) => (
              <Image
                key={url}
                src={url}
                alt={index === active ? ad.title : ""}
                fill
                sizes="(max-width: 640px) 100vw, 512px"
                priority={index === 0}
                className={`object-cover transition-opacity duration-300 ease-out ${
                  index === active ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="overflow-y-auto p-5">
            {/* Thumbnail strip — only when there's more than one image */}
            {ad.imageUrls.length > 1 && (
              <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
                {ad.imageUrls.map((url, index) => (
                  <button
                    key={url}
                    onClick={() => setActive(index)}
                    aria-label={`View image ${index + 1}`}
                    aria-pressed={index === active}
                    className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg ring-2 transition ${
                      index === active ? "ring-neutral-900" : "ring-transparent"
                    }`}
                  >
                    <Image src={url} alt="" fill sizes="80px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            <h2 id="ad-modal-title" className="text-lg font-semibold text-ink">
              {ad.title}
            </h2>
            {ad.description && <p className="mt-1.5 text-sm text-muted">{ad.description}</p>}

            {links.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2.5">
                {links.map((link, index) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                      index === 0
                        ? "bg-primary text-white hover:bg-primary-hover"
                        : "border border-line text-ink hover:bg-neutral-50"
                    }`}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}

            <span className="mt-4 block text-[10px] uppercase tracking-wide text-neutral-400">Ad</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
