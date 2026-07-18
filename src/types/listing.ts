// The shape the UI actually consumes. It is deliberately NOT the raw database row:
// it already has availability and travel time computed, so components stay dumb.

import type {
  AvailabilityState,
  GenderPolicy,
  ImageType,
  NearbyCategory,
} from "@/types/domain";

export interface ListingImage {
  url: string;
  alt: string | null;
  type: ImageType;
}

export interface ListingNearbyPlace {
  category: NearbyCategory;
  name: string;
  walkMinutes: number;
}

export interface ListingCard {
  id: string;
  slug: string;
  name: string;
  addressLine: string;
  latitude: number;
  longitude: number;
  genderPolicy: GenderPolicy;
  priceMonthly: number;
  coverImage: string | null;
  amenityKeys: string[];

  // Derived fields (computed in the service layer, never stored raw).
  remainingVacancies: number;
  totalCapacity: number;
  availabilityState: AvailabilityState;
  isAvailabilityStale: boolean;
  isVerified: boolean;
  walkingMinutesToCampus: number;
  motorcycleMinutesToCampus: number;
  lastConfirmedAt: string | null;
}

export interface ListingDetail extends ListingCard {
  advanceMonths: number;
  depositMonths: number;
  utilitiesIncluded: boolean;
  internetIncluded: boolean;
  curfew: string | null;
  houseRules: string | null;
  contactPhone: string;
  messengerUrl: string | null;
  contactEmail: string | null;
  images: ListingImage[];
  nearbyPlaces: ListingNearbyPlace[];
}
