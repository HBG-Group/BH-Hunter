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
    loading: () => <div className="h-64 w-full animate-pulse rounded-xl bg-neutral-100" />,
  },
);

export function LocationPicker({ latitude, longitude, onChange }: Props) {
  return (
    <div className="space-y-2">
      <LocationPickerMap latitude={latitude} longitude={longitude} onChange={onChange} />
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
