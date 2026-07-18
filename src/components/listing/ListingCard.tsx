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

  return (
    <motion.article
      // `layout` slides remaining cards into place when the list is filtered;
      // exit fades removed ones. Entrance runs once on mount (not on scroll).
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, layout: { type: "spring", stiffness: 350, damping: 32 } }}
      onMouseEnter={() => onHover?.(listing.id)}
      onMouseLeave={() => onHover?.(null)}
      className={`group overflow-hidden rounded-2xl bg-white ring-1 transition-shadow duration-200 [will-change:transform] ${
        isActive ? "ring-primary/30 shadow-md" : "ring-line hover:shadow-md"
      }`}
    >
      <Link href={`/listings/${listing.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
          {listing.coverImage && (
            <Image
              src={listing.coverImage}
              alt={listing.name}
              fill
              sizes="(max-width: 768px) 100vw, 320px"
              onLoad={() => setLoaded(true)}
              className={`object-cover transition-all duration-500 group-hover:scale-105 ${
                loaded ? "opacity-100" : "opacity-0"
              }`}
            />
          )}
          <div className="absolute left-3 top-3">
            <AvailabilityBadge state={listing.availabilityState} remaining={listing.remainingVacancies} />
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
