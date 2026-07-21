"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import { SearchHero } from "@/components/discovery/SearchHero";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { InfoPanel } from "@/components/map/InfoPanel";
import { MapSkeleton } from "@/components/map/MapSkeleton";
import { filterListings } from "@/services/filter-listings";
import { sortListings } from "@/services/sort-listings";
import { DEFAULT_SORT, type SortOption } from "@/config/sorting";
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
  const [mapExpanded, setMapExpanded] = useState(false);
  const [sort, setSort] = useState<SortOption>(DEFAULT_SORT);

  const favoritedSet = useMemo(() => new Set(favoritedIds), [favoritedIds]);

  const visibleListings = useMemo(
    () => sortListings(filterListings(listings, filters), sort),
    [listings, filters, sort],
  );

  // Reset filters (keeps the search text)
  const clearFilters = () =>
    setFilters((current) => ({
      query: current.query,
      availableOnly: undefined,
      gender: undefined,
      maxPrice: undefined,
      amenities: [],
    }));

  const selected = visibleListings.find((listing) => listing.id === selectedId) ?? null;

  const patchFilters = (patch: Partial<ListingFilters>) =>
    setFilters((current) => ({ ...current, ...patch }));

  return (
    <div className="space-y-10">
      {/* Listings first — the main thing students scan. */}
      <div id="explore" className="scroll-mt-20 space-y-5">
        <SearchHero
          filters={filters}
          onChange={patchFilters}
          resultCount={visibleListings.length}
          sort={sort}
          onSortChange={setSort}
          onClearFilters={clearFilters}
        />
        {/* Mobile: the map sits below the list, so offer a quick jump to it */}
        <a
          href="#map"
          className="flex items-center justify-between rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink sm:hidden"
        >
          <span>
            {visibleListings.length} {visibleListings.length === 1 ? "place" : "places"} · see them on the map
          </span>
          <span aria-hidden>→</span>
        </a>

        <ListingGrid
          listings={visibleListings}
          activeId={hoverId}
          favoritedSet={favoritedSet}
          isAuthenticated={isAuthenticated}
          onHover={setHoverId}
        />
      </div>

      {/* Full-width map at the bottom — scroll here to see every BH on the map. */}
      <div id="map" className="scroll-mt-20 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-ink">All boarding houses on the map</h2>
            <p className="mt-1 text-muted">Green means available, amber almost full, red fully occupied.</p>
          </div>
          {/* Mobile-only: full map is one tap away */}
          <button
            onClick={() => setMapExpanded((v) => !v)}
            className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-primary ring-1 ring-inset ring-line hover:ring-neutral-300 lg:hidden"
          >
            {mapExpanded ? "Collapse" : "Expand map"}
          </button>
        </div>
        <div
          className={`relative overflow-hidden rounded-2xl ring-1 ring-neutral-200 transition-[height] duration-300 lg:h-[70vh] ${
            mapExpanded ? "h-[80vh]" : "h-[42vh]"
          }`}
        >
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
    </div>
  );
}
