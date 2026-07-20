"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { activeCampus } from "@/config/campus";
import { activeTileProvider } from "@/lib/map/provider";
import { GestureHandler } from "@/components/map/GestureHandler";
import { AutoResize } from "@/components/map/AutoResize";
import { MapFallback } from "@/components/map/MapFallback";
import { buildMarkerIcon } from "@/components/map/markerIcon";
import { CampusMarker } from "@/components/map/CampusMarker";
import { useTileFailure } from "@/hooks/useTileFailure";
import type { ListingCard } from "@/types/listing";

interface Props {
  listings: ListingCard[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}

// The Leaflet map itself. Rendered client-only (see DiscoveryView's dynamic import)
// because Leaflet needs the browser `window`.
export function MapView({ listings, activeId, onSelect, onHover }: Props) {
  const { failed, retryKey, retry, handlers } = useTileFailure();
  const campus = activeCampus.center;
  const googleMapsUrl = `https://www.google.com/maps?q=${campus.latitude},${campus.longitude}`;

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[campus.latitude, campus.longitude]}
        zoom={activeCampus.defaultZoom}
        className="h-full w-full"
      >
        <GestureHandler />
        <AutoResize />
        <TileLayer
          key={retryKey}
          url={activeTileProvider.urlTemplate}
          attribution={activeTileProvider.attribution}
          maxZoom={activeTileProvider.maxZoom}
          eventHandlers={handlers}
        />

        <CampusMarker />

        {listings.map((listing) => (
          <Marker
            key={listing.id}
            position={[listing.latitude, listing.longitude]}
            icon={buildMarkerIcon(listing.availabilityState, activeId === listing.id)}
            eventHandlers={{
              click: () => onSelect(listing.id),
              mouseover: () => onHover(listing.id),
              mouseout: () => onHover(null),
            }}
          />
        ))}
      </MapContainer>

      {failed && <MapFallback onRetry={retry} googleMapsUrl={googleMapsUrl} />}
    </div>
  );
}
