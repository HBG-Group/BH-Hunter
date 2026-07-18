"use client";

import Image from "next/image";
import Link from "next/link";
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

// One boarding house in the grid. Hovering highlights its pin on the map.
export function ListingCard({ listing, isActive, isFavorited, isAuthenticated, onHover }: Props) {
  return (
    <motion.article
      layout
      onMouseEnter={() => onHover?.(listing.id)}
      onMouseLeave={() => onHover?.(null)}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={`group overflow-hidden rounded-2xl bg-white ring-1 transition-shadow ${
        isActive ? "ring-neutral-900/20 shadow-lg" : "ring-neutral-200/70 shadow-sm"
      }`}
    >
      <Link href={`/listings/${listing.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
          {listing.coverImage && (
            <Image
              src={listing.coverImage}
              alt={listing.name}
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
          <div className="absolute left-3 top-3">
            <AvailabilityBadge
              state={listing.availabilityState}
              remaining={listing.remainingVacancies}
            />
          </div>
          <div className="absolute right-3 top-3">
            <FavoriteButton
              boardingHouseId={listing.id}
              initialFavorited={isFavorited ?? false}
              isAuthenticated={isAuthenticated}
            />
          </div>
        </div>

        <div className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-neutral-900">{listing.name}</h3>
            <p className="shrink-0 font-semibold text-neutral-900">
              {formatPeso(listing.priceMonthly)}
              <span className="text-xs font-normal text-neutral-500">/mo</span>
            </p>
          </div>

          <p className="text-sm text-neutral-500">
            {listing.walkingMinutesToCampus} min walk to campus · {listing.addressLine}
          </p>

          <AmenityChips amenityKeys={listing.amenityKeys} limit={4} />
        </div>
      </Link>
    </motion.article>
  );
}
