"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { AvailabilityBadge } from "@/components/ui/AvailabilityBadge";
import { AmenityChips } from "@/components/ui/AmenityChips";
import { FavoriteButton } from "@/components/student/FavoriteButton";
import { formatPeso, formatRelativeTime } from "@/lib/utils/format";
import type { ListingCard } from "@/types/listing";

interface Props {
  listing: ListingCard;
  isFavorited: boolean;
  isAuthenticated: boolean;
  onClose: () => void;
}

// The floating card that appears over the map when a pin is clicked.
export function InfoPanel({ listing, isFavorited, isAuthenticated, onClose }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
      className="pointer-events-auto absolute bottom-4 left-4 right-4 z-[1000] mx-auto max-w-sm overflow-hidden rounded-2xl bg-white/90 shadow-xl ring-1 ring-black/5 backdrop-blur-md sm:left-4 sm:right-auto"
    >
      <div className="relative aspect-[16/9] bg-neutral-100">
        {listing.coverImage && (
          <Image src={listing.coverImage} alt={listing.name} fill className="object-cover" sizes="384px" />
        )}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-neutral-700 backdrop-blur hover:bg-white"
        >
          ✕
        </button>
        <div className="absolute left-3 top-3">
          <AvailabilityBadge state={listing.availabilityState} remaining={listing.remainingVacancies} />
        </div>
        <div className="absolute right-12 top-3">
          <FavoriteButton
            boardingHouseId={listing.id}
            initialFavorited={isFavorited}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </div>

      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-neutral-900">{listing.name}</h3>
          <p className="shrink-0 font-semibold">{formatPeso(listing.priceMonthly)}</p>
        </div>
        <p className="text-sm text-neutral-500">
          {listing.walkingMinutesToCampus} min walk · {listing.motorcycleMinutesToCampus} min ride
        </p>
        <AmenityChips amenityKeys={listing.amenityKeys} limit={4} />
        <p className="text-xs text-neutral-400">{formatRelativeTime(listing.lastConfirmedAt)}</p>

        <Link
          href={`/listings/${listing.slug}`}
          className="mt-1 block rounded-xl bg-primary py-2 text-center text-sm font-medium text-white hover:bg-primary-hover"
        >
          View details
        </Link>
      </div>
    </motion.div>
  );
}
