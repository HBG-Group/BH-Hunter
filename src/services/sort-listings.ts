// Pure sorting for the discovery list. Returns a new array so React sees a change.

import type { SortOption } from "@/config/sorting";
import type { ListingCard } from "@/types/listing";

export function sortListings(listings: ListingCard[], sort: SortOption): ListingCard[] {
  const items = [...listings];

  switch (sort) {
    case "price":
      return items.sort((a, b) => a.priceMonthly - b.priceMonthly);
    case "distance":
      return items.sort((a, b) => a.walkingMinutesToCampus - b.walkingMinutesToCampus);
    case "availability":
      return items.sort((a, b) => b.remainingVacancies - a.remainingVacancies);
    case "rating":
      return items.sort((a, b) => b.averageRating - a.averageRating);
    case "newest":
      return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    default:
      // Recommended = the server order, but featured listings float to the top.
      return items.sort((a, b) => Number(b.featured) - Number(a.featured));
  }
}
