"use client";

import L from "leaflet";
import { Marker, Tooltip } from "react-leaflet";
import { activeCampus } from "@/config/campus";

// A distinct marker for the campus gate — the reference point for walking distance.
const campusIcon = L.divIcon({
  className: "bh-campus-pin",
  html: `<div class="bh-campus-dot">★</div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

export function CampusMarker() {
  return (
    <Marker
      position={[activeCampus.mainGate.latitude, activeCampus.mainGate.longitude]}
      icon={campusIcon}
    >
      <Tooltip direction="top" offset={[0, -12]}>
        {activeCampus.shortName}
      </Tooltip>
    </Marker>
  );
}
