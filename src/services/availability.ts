// Business rules for "how full is this boarding house?" and "can we still trust
// this number?". This lives in a service (not a component) because it is logic,
// not UI — and because the same rule is used on the map, the cards, and the API.

import type { AvailabilityState } from "@/types/domain";

export interface RoomOccupancy {
  capacity: number;
  occupied: number;
}

export interface AvailabilitySummary {
  totalCapacity: number;
  totalOccupied: number;
  remainingVacancies: number;
  state: AvailabilityState;
}

// Vacancy is always derived from the rooms so it can never contradict them.
export function summarizeAvailability(rooms: RoomOccupancy[]): AvailabilitySummary {
  const totalCapacity = rooms.reduce((sum, room) => sum + room.capacity, 0);
  const totalOccupied = rooms.reduce((sum, room) => sum + room.occupied, 0);
  const remainingVacancies = Math.max(0, totalCapacity - totalOccupied);

  return {
    totalCapacity,
    totalOccupied,
    remainingVacancies,
    state: deriveState(totalCapacity, remainingVacancies),
  };
}

// Green when there is comfortable room, yellow when it's nearly full, red when full.
function deriveState(totalCapacity: number, remaining: number): AvailabilityState {
  if (remaining <= 0) return "FULL";
  if (totalCapacity > 0 && remaining / totalCapacity <= 0.2) return "ALMOST_FULL";
  return "AVAILABLE";
}

// The whole product promise is "not outdated info". After a while without an owner
// confirming, we stop trusting a green pin. Tune this as we learn owner behavior.
const STALE_AFTER_HOURS = 72;

export function isAvailabilityStale(lastConfirmedAt: Date | null, now: Date = new Date()): boolean {
  if (!lastConfirmedAt) return true;
  const hoursSince = (now.getTime() - lastConfirmedAt.getTime()) / (1000 * 60 * 60);
  return hoursSince > STALE_AFTER_HOURS;
}
