"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { activeCampus } from "@/config/campus";
import { activeTileProvider } from "@/lib/map/provider";
import { GestureHandler } from "@/components/map/GestureHandler";
import { AutoResize } from "@/components/map/AutoResize";
import { buildMarkerIcon } from "@/components/map/markerIcon";
import { CampusMarker } from "@/components/map/CampusMarker";
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
  return (
    <MapContainer
      center={[activeCampus.center.latitude, activeCampus.center.longitude]}
      zoom={activeCampus.defaultZoom}
      className="h-full w-full"
    >
      <GestureHandler />
      <AutoResize />
      <TileLayer
        url={activeTileProvider.urlTemplate}
        attribution={activeTileProvider.attribution}
        maxZoom={activeTileProvider.maxZoom}
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
  );
}
