// Pure, framework-free helpers for turning GPS coordinates into the friendly
// "7 minute walk" / "3 minute ride" strings the product wants. No React, no DB —
// just math, so these are trivial to test and reuse anywhere.

export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Average speeds in km/h. Rough but good enough for a "feel" of distance.
const WALKING_SPEED_KMH = 5;
const MOTORCYCLE_SPEED_KMH = 25;

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

// Great-circle distance between two points (Haversine formula).
export function distanceInKm(from: Coordinates, to: Coordinates): number {
  const latDelta = toRadians(to.latitude - from.latitude);
  const lngDelta = toRadians(to.longitude - from.longitude);

  const a =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(lngDelta / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.asin(Math.sqrt(a));
}

function minutesForSpeed(distanceKm: number, speedKmh: number): number {
  return Math.max(1, Math.round((distanceKm / speedKmh) * 60));
}

export interface TravelEstimate {
  distanceKm: number;
  walkingMinutes: number;
  motorcycleMinutes: number;
}

export function estimateTravel(from: Coordinates, to: Coordinates): TravelEstimate {
  const distanceKm = distanceInKm(from, to);
  return {
    distanceKm,
    walkingMinutes: minutesForSpeed(distanceKm, WALKING_SPEED_KMH),
    motorcycleMinutes: minutesForSpeed(distanceKm, MOTORCYCLE_SPEED_KMH),
  };
}
