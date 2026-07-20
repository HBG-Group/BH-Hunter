"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { activeCampus } from "@/config/campus";
import { activeTileProvider } from "@/lib/map/provider";
import { GestureHandler } from "@/components/map/GestureHandler";

interface Props {
  latitude: number;
  longitude: number;
  onChange: (latitude: number, longitude: number) => void;
}

const pinIcon = L.divIcon({
  className: "bh-pick-pin",
  html: `<div class="bh-pick-dot"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

// Moves the pin to wherever the owner taps on the map.
function ClickToPlace({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

// Leaflet measures the container on init. Inside a form it can mount before the box
// has its final size, which breaks rendering and where clicks land. Recomputing the
// size after mount fixes it.
function FixMapSize() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const timer = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

export function LocationPickerMap({ latitude, longitude, onChange }: Props) {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={activeCampus.defaultZoom}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        url={activeTileProvider.urlTemplate}
        attribution={activeTileProvider.attribution}
        maxZoom={activeTileProvider.maxZoom}
      />
      <GestureHandler />
      <FixMapSize />
      <ClickToPlace onPick={onChange} />
      <Marker
        position={[latitude, longitude]}
        icon={pinIcon}
        draggable
        eventHandlers={{
          dragend(event) {
            const marker = event.target as L.Marker;
            const position = marker.getLatLng();
            onChange(position.lat, position.lng);
          },
        }}
      />
    </MapContainer>
  );
}
