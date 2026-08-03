"use client";

import { AnimatePresence } from "framer-motion";
import { ListingCard } from "@/components/listing/ListingCard";
import { EmptyState } from "@/components/ui/EmptyState";
import type { ListingCard as ListingCardModel } from "@/types/listing";

interface Props {
  listings: ListingCardModel[];
  activeId: string | null;
  favoritedSet: Set<string>;
  isAuthenticated: boolean;
  onHover: (id: string | null) => void;
}

export function ListingGrid({ listings, activeId, favoritedSet, isAuthenticated, onHover }: Props) {
  if (listings.length === 0) {
    return (
      <EmptyState
        title="No boarding houses match"
        message="Try widening your price range or removing a filter."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <AnimatePresence mode="popLayout">
        {listings.map((listing, index) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            isActive={activeId === listing.id}
            isFavorited={favoritedSet.has(listing.id)}
            isAuthenticated={isAuthenticated}
            onHover={onHover}
            priority={index < 4}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
