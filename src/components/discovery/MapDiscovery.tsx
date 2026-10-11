"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import { SearchHero } from "@/components/discovery/SearchHero";
import { InfoPanel } from "@/components/map/InfoPanel";
import { MapSkeleton } from "@/components/map/MapSkeleton";
import { filterListings } from "@/services/filter-listings";
import { sortListings } from "@/services/sort-listings";
import { DEFAULT_SORT, type SortOption } from "@/config/sorting";
import type { ListingFilters } from "@/lib/validation/filters";
import type { ListingCard } from "@/types/listing";

const MapView = dynamic(
  () => import("@/components/map/MapView").then((module) => module.MapView),
  {
    ssr: false,
    loading: () => <MapSkeleton />,
  },
);

interface Props {
  listings: ListingCard[];
  favoritedIds: string[];
  isAuthenticated: boolean;
}

export function MapDiscovery({
  listings,
  favoritedIds,
  isAuthenticated,
}: Props) {
  const [filters, setFilters] = useState<ListingFilters>({});
  const [sort, setSort] = useState<SortOption>(DEFAULT_SORT);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const visibleListings = useMemo(
    () => sortListings(filterListings(listings, filters), sort),
    [filters, listings, sort],
  );
  const selected =
    visibleListings.find((listing) => listing.id === selectedId) ?? null;
  const favoritedSet = useMemo(() => new Set(favoritedIds), [favoritedIds]);

  return (
    <div className="space-y-5">
      <SearchHero
        filters={filters}
        onChange={(patch) =>
          setFilters((current) => ({ ...current, ...patch }))
        }
        resultCount={visibleListings.length}
        sort={sort}
        onSortChange={setSort}
        onClearFilters={() => setFilters({})}
      />
      <p className="text-sm text-muted">
        Green means available, amber means almost full, and red means fully
        occupied.
      </p>
      <div className="relative h-[calc(100dvh-18rem)] min-h-[32rem] overflow-hidden rounded-2xl ring-1 ring-line">
        <MapView
          listings={visibleListings}
          activeId={hoverId ?? selectedId}
          onSelect={setSelectedId}
          onHover={setHoverId}
        />
        <AnimatePresence>
          {selected && (
            <InfoPanel
              listing={selected}
              isFavorited={favoritedSet.has(selected.id)}
              isAuthenticated={isAuthenticated}
              onClose={() => setSelectedId(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
