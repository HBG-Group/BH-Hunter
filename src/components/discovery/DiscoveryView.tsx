"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { SearchHero } from "@/components/discovery/SearchHero";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { InfoPanel } from "@/components/map/InfoPanel";
import { MapSkeleton } from "@/components/map/MapSkeleton";
import { filterListings } from "@/services/filter-listings";
import { sortListings } from "@/services/sort-listings";
import { DEFAULT_SORT, type SortOption } from "@/config/sorting";
import {
  clearRememberedFilters,
  getRememberedFilters,
  rememberFilters,
} from "@/lib/cookies/searchFilters";
import type { ListingFilters } from "@/lib/validation/filters";
import type { ListingCard } from "@/types/listing";

// How many cards to render before the "Load more" button. The map still gets every
// listing, so no pins are lost — this only limits how many cards are in the DOM.
const PAGE_SIZE = 20;

// Leaflet touches `window`, so the map is loaded client-only, never server-rendered.
const MapView = dynamic(
  () => import("@/components/map/MapView").then((m) => m.MapView),
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

export function DiscoveryView({
  listings,
  favoritedIds,
  isAuthenticated,
}: Props) {
  const [filters, setFilters] = useState<ListingFilters>({});
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mapExpanded, setMapExpanded] = useState(false);
  const [sort, setSort] = useState<SortOption>(DEFAULT_SORT);
  const [shownCount, setShownCount] = useState(PAGE_SIZE);
  const loadedRemembered = useRef(false);

  // Load remembered filters once on mount (after consent, if any was given).
  useEffect(() => {
    if (loadedRemembered.current) return;
    loadedRemembered.current = true;
    const remembered = getRememberedFilters();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (remembered) setFilters((current) => ({ ...current, ...remembered }));
  }, []);

  // Persist filter changes (skips the initial mount so we don't immediately
  // overwrite what was just loaded).
  useEffect(() => {
    if (!loadedRemembered.current) return;
    rememberFilters(filters);
  }, [filters]);

  const favoritedSet = useMemo(() => new Set(favoritedIds), [favoritedIds]);

  const visibleListings = useMemo(
    () => sortListings(filterListings(listings, filters), sort),
    [listings, filters, sort],
  );

  // The cards actually rendered; the map always receives the full set.
  const shownListings = visibleListings.slice(0, shownCount);
  const hasMore = shownCount < visibleListings.length;

  // Any change to the result set starts the list back at the first page.
  const resetPaging = () => setShownCount(PAGE_SIZE);

  // Reset filters (keeps the search text)
  const clearFilters = () => {
    resetPaging();
    clearRememberedFilters();
    setFilters((current) => ({
      query: current.query,
      availableOnly: undefined,
      gender: undefined,
      maxPrice: undefined,
      amenities: [],
    }));
  };

  const selected =
    visibleListings.find((listing) => listing.id === selectedId) ?? null;

  const patchFilters = (patch: Partial<ListingFilters>) => {
    resetPaging();
    setFilters((current) => ({ ...current, ...patch }));
  };

  const changeSort = (next: SortOption) => {
    resetPaging();
    setSort(next);
  };

  return (
    <div className="space-y-10">
      {/* Listings first — the main thing students scan. */}
      <div id="explore" className="scroll-mt-20 space-y-5">
        <SearchHero
          filters={filters}
          onChange={patchFilters}
          resultCount={visibleListings.length}
          sort={sort}
          onSortChange={changeSort}
          onClearFilters={clearFilters}
        />
        {/* Mobile: the map sits below the list, so offer a quick jump to it */}
        <a
          href="#map"
          className="flex items-center justify-between rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink sm:hidden"
        >
          <span>
            {visibleListings.length}{" "}
            {visibleListings.length === 1 ? "place" : "places"} · see them on
            the map
          </span>
          <span aria-hidden>→</span>
        </a>

        <ListingGrid
          listings={shownListings}
          activeId={hoverId}
          favoritedSet={favoritedSet}
          isAuthenticated={isAuthenticated}
          onHover={setHoverId}
        />

        {hasMore && (
          <div className="flex justify-center pt-2">
            <button
              onClick={() => setShownCount((c) => c + PAGE_SIZE)}
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-ink ring-1 ring-inset ring-line hover:ring-neutral-300"
            >
              Load more ({visibleListings.length - shownCount} left)
            </button>
          </div>
        )}
      </div>

      {/* Full-width map at the bottom — scroll here to see every BH on the map. */}
      <div id="map" className="scroll-mt-20 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-ink">
              All boarding houses on the map
            </h2>
            <p className="mt-1 text-muted">
              Green means available, amber almost full, red fully occupied.
            </p>
          </div>
          {/* Mobile-only: full map is one tap away */}
          <div className="flex shrink-0 gap-2">
            <button
              onClick={() => setMapExpanded((v) => !v)}
              className="min-h-11 rounded-lg px-3 text-sm font-medium text-primary ring-1 ring-inset ring-line hover:ring-neutral-300 lg:hidden"
            >
              {mapExpanded ? "Collapse" : "Expand map"}
            </button>
            <Link
              href="/map"
              className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-primary ring-1 ring-inset ring-line hover:ring-neutral-300"
            >
              Open full map
            </Link>
          </div>
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
