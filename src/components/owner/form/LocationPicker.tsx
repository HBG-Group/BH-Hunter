"use client";

import dynamic from "next/dynamic";

interface Props {
  latitude: number;
  longitude: number;
  onChange: (latitude: number, longitude: number) => void;
}

// Leaflet needs the browser, so the actual map is loaded client-only.
const LocationPickerMap = dynamic(
  () => import("@/components/owner/form/LocationPickerMap").then((m) => m.LocationPickerMap),
  {
    ssr: false,
    loading: () => <div className="h-full w-full animate-pulse bg-neutral-100" />,
  },
);

export function LocationPicker({ latitude, longitude, onChange }: Props) {
  return (
    <div className="space-y-2">
      {/* The map needs an explicitly-sized parent — the global .leaflet-container
          rule forces height:100%, so without this the map collapses to nothing. */}
      {/* isolate + z-0 traps Leaflet's internal z-indexes (panes go up to 700) so the
          map can't paint over the sticky submit bar while scrolling. */}
      <div className="isolate z-0 h-72 w-full overflow-hidden rounded-xl border border-neutral-200">
        <LocationPickerMap latitude={latitude} longitude={longitude} onChange={onChange} />
      </div>
      <p className="text-xs text-neutral-500">
        <strong className="font-medium text-neutral-700">Tap anywhere on the map</strong> (or drag the
        pin) to mark exactly where your boarding house is.{" "}
        <span className="text-neutral-400">
          Pin at {latitude.toFixed(5)}, {longitude.toFixed(5)}
        </span>
      </p>
    </div>
  );
}
