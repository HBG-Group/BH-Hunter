"use client";

import dynamic from "next/dynamic";
import type { AvailabilityState } from "@/types/domain";

interface Props {
  latitude: number;
  longitude: number;
  availabilityState: AvailabilityState;
  walkingMinutes: number;
}

// Leaflet is browser-only, so the map loads client-side.
const ListingLocationMap = dynamic(
  () => import("@/components/detail/ListingLocationMap").then((m) => m.ListingLocationMap),
  {
    ssr: false,
    loading: () => <div className="h-full w-full animate-pulse bg-neutral-100" />,
  },
);

// Compact location card for the detail page: where the BH is + the walk to campus.
export function ListingLocation({ latitude, longitude, availabilityState, walkingMinutes }: Props) {
  return (
    <div className="space-y-2">
      <div className="h-64 w-full overflow-hidden rounded-2xl border border-neutral-200">
        <ListingLocationMap
          latitude={latitude}
          longitude={longitude}
          availabilityState={availabilityState}
        />
      </div>
      <p className="text-xs text-neutral-500">{walkingMinutes} minute walk to VSU main gate.</p>
    </div>
  );
}
