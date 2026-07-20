"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { activeTileProvider } from "@/lib/map/provider";
import { buildMarkerIcon } from "@/components/map/markerIcon";
import { CampusMarker } from "@/components/map/CampusMarker";
import { GestureHandler } from "@/components/map/GestureHandler";
import { MapFallback } from "@/components/map/MapFallback";
import { useTileFailure } from "@/hooks/useTileFailure";
import type { AvailabilityState } from "@/types/domain";

interface Props {
  latitude: number;
  longitude: number;
  availabilityState: AvailabilityState;
}

// Recompute size once mounted (the container animates in), so tiles render fully.
function FixMapSize() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

// A read-only map showing where the boarding house sits relative to campus.
export function ListingLocationMap({ latitude, longitude, availabilityState }: Props) {
  const { failed, retryKey, retry, handlers } = useTileFailure();
  const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

  return (
    <div className="relative h-full w-full">
      <MapContainer center={[latitude, longitude]} zoom={16} className="h-full w-full">
        <GestureHandler />
        <TileLayer
          key={retryKey}
          url={activeTileProvider.urlTemplate}
          attribution={activeTileProvider.attribution}
          maxZoom={activeTileProvider.maxZoom}
          eventHandlers={handlers}
        />
        <FixMapSize />
        <CampusMarker />
        <Marker position={[latitude, longitude]} icon={buildMarkerIcon(availabilityState, true)} />
      </MapContainer>

      {failed && <MapFallback onRetry={retry} googleMapsUrl={googleMapsUrl} />}
    </div>
  );
}
