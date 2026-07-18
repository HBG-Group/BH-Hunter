// How each availability state looks and reads. Shared by the map pins and the card
// badges so a "green pin" and a "green badge" always mean the same thing.

import type { AvailabilityState } from "@/types/domain";

export interface AvailabilityStyle {
  label: string;
  // Hex colours (used by the Leaflet pins, which can't read Tailwind classes).
  color: string;
  // Tailwind classes for badges in the React tree.
  badgeClass: string;
}

export const AVAILABILITY_STYLES: Record<AvailabilityState, AvailabilityStyle> = {
  AVAILABLE: {
    label: "Available",
    color: "#16a34a",
    badgeClass: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  },
  ALMOST_FULL: {
    label: "Almost full",
    color: "#d97706",
    badgeClass: "bg-amber-50 text-amber-700 ring-amber-600/20",
  },
  FULL: {
    label: "Fully occupied",
    color: "#dc2626",
    badgeClass: "bg-rose-50 text-rose-700 ring-rose-600/20",
  },
};
