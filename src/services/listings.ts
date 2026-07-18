// Service layer: turns raw boarding-house rows into the view models the UI renders.
// This is where availability and travel time get computed, so components never do it.

import { activeCampus } from "@/config/campus";
import type { BoardingHouseWithRelations } from "@/lib/db/boarding-houses";
import { estimateTravel } from "@/lib/utils/distance";
import {
  isAvailabilityStale,
  summarizeAvailability,
} from "@/services/availability";
import type { ListingCard, ListingDetail } from "@/types/listing";

function toCard(row: BoardingHouseWithRelations): ListingCard {
  const availability = summarizeAvailability(row.rooms);
  const travel = estimateTravel(
    { latitude: row.latitude, longitude: row.longitude },
    activeCampus.mainGate,
  );

  const reviewCount = row.reviews.length;
  const averageRating =
    reviewCount > 0 ? row.reviews.reduce((sum, r) => sum + r.overall, 0) / reviewCount : 0;

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    addressLine: row.addressLine,
    latitude: row.latitude,
    longitude: row.longitude,
    genderPolicy: row.genderPolicy,
    priceMonthly: row.priceMonthly,
    coverImage: row.images[0]?.url ?? null,
    amenityKeys: row.amenities.map((link) => link.amenity.key),
    remainingVacancies: availability.remainingVacancies,
    totalCapacity: availability.totalCapacity,
    availabilityState: availability.state,
    isAvailabilityStale: isAvailabilityStale(row.lastConfirmedAt),
    isVerified: row.verifiedAt !== null,
    averageRating,
    reviewCount,
    walkingMinutesToCampus: travel.walkingMinutes,
    motorcycleMinutesToCampus: travel.motorcycleMinutes,
    lastConfirmedAt: row.lastConfirmedAt?.toISOString() ?? null,
  };
}

export function toListingCards(rows: BoardingHouseWithRelations[]): ListingCard[] {
  return rows.map(toCard);
}

export function toListingDetail(row: BoardingHouseWithRelations): ListingDetail {
  return {
    ...toCard(row),
    advanceMonths: row.advanceMonths,
    depositMonths: row.depositMonths,
    utilitiesIncluded: row.utilitiesIncluded,
    internetIncluded: row.internetIncluded,
    curfew: row.curfew,
    houseRules: row.houseRules,
    contactPhone: row.contactPhone,
    messengerUrl: row.messengerUrl,
    contactEmail: row.contactEmail,
    images: row.images.map((image) => ({
      url: image.url,
      alt: image.alt,
      type: image.type,
    })),
    nearbyPlaces: row.nearbyPlaces.map((place) => ({
      category: place.category,
      name: place.name,
      walkMinutes: place.walkMinutes,
    })),
  };
}
