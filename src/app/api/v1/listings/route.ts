import { findPublishedBoardingHouses } from "@/lib/db/boarding-houses";
import { listingFiltersSchema } from "@/lib/validation/filters";
import { filterListings } from "@/services/filter-listings";
import { toListingCards } from "@/services/listings";
import type { ListingFilters } from "@/lib/validation/filters";
import { allow, LIMITS, RATE_LIMITED } from "@/lib/security/rate-limit";

// Reads published listings and applies the same filters as the website.
export async function GET(request: Request) {
  if (!(await allow("api-listings", LIMITS.analytics)))
    return Response.json({ error: RATE_LIMITED }, { status: 429 });
  const url = new URL(request.url);
  const filters = readFilters(url.searchParams);
  const rows = await findPublishedBoardingHouses();
  const listings = filterListings(toListingCards(rows), filters);

  return Response.json({ listings });
}

// Converts URL query values into the shared listing filter shape.
function readFilters(params: URLSearchParams): ListingFilters {
  const raw = {
    query: params.get("query") ?? undefined,
    maxPrice: params.get("maxPrice") ?? undefined,
    maxWalkingMinutes: params.get("maxWalkingMinutes") ?? undefined,
    gender: params.get("gender") ?? undefined,
    availableOnly: params.get("availableOnly") ?? undefined,
    amenities: params.get("amenities")?.split(",").filter(Boolean),
  };

  const parsed = listingFiltersSchema.safeParse(raw);
  return parsed.success ? parsed.data : {};
}
