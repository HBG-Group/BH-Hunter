"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import { FilterBar } from "@/components/filters/FilterBar";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { InfoPanel } from "@/components/map/InfoPanel";
import { MapSkeleton } from "@/components/map/MapSkeleton";
import { filterListings } from "@/services/filter-listings";
import type { ListingFilters } from "@/lib/validation/filters";
import type { ListingCard } from "@/types/listing";

// Leaflet touches `window`, so the map is loaded client-only, never server-rendered.
const MapView = dynamic(() => import("@/components/map/MapView").then((m) => m.MapView), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

interface Props {
  listings: ListingCard[];
  favoritedIds: string[];
  isAuthenticated: boolean;
}

export function DiscoveryView({ listings, favoritedIds, isAuthenticated }: Props) {
  const [filters, setFilters] = useState<ListingFilters>({});
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const favoritedSet = useMemo(() => new Set(favoritedIds), [favoritedIds]);

  const visibleListings = useMemo(
    () => filterListings(listings, filters),
    [listings, filters],
  );

  const selected = visibleListings.find((listing) => listing.id === selectedId) ?? null;

  const patchFilters = (patch: Partial<ListingFilters>) =>
    setFilters((current) => ({ ...current, ...patch }));

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="space-y-4">
        <FilterBar filters={filters} onChange={patchFilters} resultCount={visibleListings.length} />
        <ListingGrid
          listings={visibleListings}
          activeId={hoverId}
          favoritedSet={favoritedSet}
          isAuthenticated={isAuthenticated}
          onHover={setHoverId}
        />
      </div>

      <div className="relative h-[60vh] overflow-hidden rounded-2xl ring-1 ring-neutral-200 lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
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
