"use client";

import Image from "next/image";
import Link from "next/link";
import { memo, useState } from "react";
import { motion } from "framer-motion";
import { AvailabilityBadge } from "@/components/ui/AvailabilityBadge";
import { AmenityChips } from "@/components/ui/AmenityChips";
import { FavoriteButton } from "@/components/student/FavoriteButton";
import { formatPeso } from "@/lib/utils/format";
import type { ListingCard as ListingCardModel } from "@/types/listing";

interface Props {
  listing: ListingCardModel;
  isActive?: boolean;
  isFavorited?: boolean;
  isAuthenticated?: boolean;
  onHover?: (id: string | null) => void;
}

const genderLabels: Record<string, string> = { MALE: "Male", FEMALE: "Female", MIXED: "Mixed" };

// One boarding house in the grid. Hovering highlights its pin on the map.
function ListingCardBase({ listing, isActive, isFavorited, isAuthenticated, onHover }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <motion.article
      // `layout` slides remaining cards into place when the list is filtered;
      // exit fades removed ones. Entrance runs once on mount (not on scroll).
      layout
      // Do not hide listings while hydration or a client-side dependency is unavailable.
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, layout: { type: "spring", stiffness: 350, damping: 32 } }}
      onMouseEnter={() => onHover?.(listing.id)}
      onMouseLeave={() => onHover?.(null)}
      className={`group overflow-hidden rounded-2xl bg-white ring-1 transition-shadow duration-200 [will-change:transform] ${
        isActive ? "ring-primary/30 shadow-md" : "ring-line hover:shadow-md"
      } ${listing.isPublished ? "" : "opacity-75 grayscale"}`}
    >
      <Link href={`/listings/${listing.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
          {listing.coverImage && !failed && (
            <Image
              src={listing.coverImage}
              alt={listing.name}
              fill
              sizes="(max-width: 768px) 100vw, 320px"
              onLoad={() => setLoaded(true)}
              onError={() => setFailed(true)}
              className={`object-cover transition-all duration-500 group-hover:scale-105 ${
                loaded ? "opacity-100" : "opacity-0"
              }`}
            />
          )}
          {/* Never show a broken image area */}
          {(!listing.coverImage || failed) && (
            <div className="flex h-full w-full items-center justify-center text-neutral-300">
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M18 9h.008v.008H18V9Zm.75 12H5.25A2.25 2.25 0 0 1 3 18.75V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25v13.5A2.25 2.25 0 0 1 18.75 21Z" />
              </svg>
            </div>
          )}
          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {listing.isPublished ? (
              <AvailabilityBadge state={listing.availabilityState} remaining={listing.remainingVacancies} />
            ) : (
              <span className="rounded-full bg-neutral-900/85 px-2.5 py-1 text-xs font-medium text-white">
                Unpublished
              </span>
            )}
            {listing.featured && listing.isPublished && (
              <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-white shadow-sm">
                ★ Featured
              </span>
            )}
          </div>
          <div className="absolute right-3 top-3">
            <FavoriteButton
              boardingHouseId={listing.id}
              initialFavorited={isFavorited ?? false}
              isAuthenticated={isAuthenticated}
            />
          </div>
        </div>

        <div className="space-y-1.5 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-ink">{listing.name}</h3>
            <span className="flex shrink-0 items-center gap-1 text-sm text-ink">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#f59e0b">
                <path d="M12 2l2.9 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 7.1-1.01L12 2z" />
              </svg>
              {listing.reviewCount > 0 ? listing.averageRating.toFixed(1) : "New"}
            </span>
          </div>

          <p className="text-sm text-muted">
            {listing.walkingMinutesToCampus} min walk · {genderLabels[listing.genderPolicy]}
          </p>

          <AmenityChips amenityKeys={listing.amenityKeys} limit={3} />

          <div className="flex items-center justify-between pt-1">
            <p className="font-semibold text-ink">
              {formatPeso(listing.priceMonthly)}
              <span className="text-sm font-normal text-muted">/mo</span>
            </p>
            <span className="text-muted transition-transform duration-200 group-hover:translate-x-0.5">→</span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

// Memoized so hovering one card doesn't re-render the whole grid.
export const ListingCard = memo(ListingCardBase);
