import L from "leaflet";
import { AVAILABILITY_STYLES } from "@/config/availability";
import type { AvailabilityState } from "@/types/domain";

// Build a coloured pin as an HTML divIcon. Using divIcon (instead of Leaflet's
// default image marker) avoids the classic bundler broken-image bug and lets us
// colour by availability and add a subtle pulse for active pins.
export function buildMarkerIcon(state: AvailabilityState, isActive: boolean): L.DivIcon {
  const color = AVAILABILITY_STYLES[state].color;
  const scale = isActive ? 1.25 : 1;
  const pulse =
    state === "AVAILABLE"
      ? `<span class="bh-pin-pulse" style="background:${color}"></span>`
      : "";

  return L.divIcon({
    className: "bh-pin",
    html: `
      <div class="bh-pin-wrap" style="transform:scale(${scale})">
        ${pulse}
        <span class="bh-pin-dot" style="background:${color}"></span>
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}
