// Pure filtering logic. Given the listing cards and the active filters, return the
// subset that matches. No React, no DB — just a predicate, so it's easy to reason
// about and reuse (client grid today, API endpoint tomorrow).

import type { ListingFilters } from "@/lib/validation/filters";
import type { ListingCard } from "@/types/listing";

function matches(listing: ListingCard, filters: ListingFilters): boolean {
  if (filters.query) {
    const haystack = `${listing.name} ${listing.addressLine}`.toLowerCase();
    if (!haystack.includes(filters.query.toLowerCase())) return false;
  }

  if (filters.maxPrice && listing.priceMonthly > filters.maxPrice) return false;

  if (filters.maxWalkingMinutes && listing.walkingMinutesToCampus > filters.maxWalkingMinutes) {
    return false;
  }

  if (filters.gender && listing.genderPolicy !== filters.gender) return false;

  if (filters.availableOnly && listing.availabilityState === "FULL") return false;

  if (filters.amenities?.length) {
    const hasEvery = filters.amenities.every((key) => listing.amenityKeys.includes(key));
    if (!hasEvery) return false;
  }

  return true;
}

export function filterListings(
  listings: ListingCard[],
  filters: ListingFilters,
): ListingCard[] {
  return listings.filter((listing) => matches(listing, filters));
}
