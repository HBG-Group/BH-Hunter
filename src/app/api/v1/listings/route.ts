import { findPublishedBoardingHouses } from "@/lib/db/boarding-houses";
import { listingFiltersSchema } from "@/lib/validation/filters";
import { filterListings } from "@/services/filter-listings";
import { toListingCards } from "@/services/listings";
import { allow, LIMITS } from "@/lib/security/rate-limit";

const RATE_LIMIT_MESSAGE = "Too many API requests. Please try again in a minute.";

// Reads published listings and applies the same filters as the website.
export async function GET(request: Request) {
  try {
    if (!(await allow("mobile-api", LIMITS.mobileApi))) {
      return Response.json(
        { error: RATE_LIMIT_MESSAGE },
        { status: 429, headers: { "Retry-After": "60" } },
      );
    }
  } catch {
    return Response.json({ error: "API temporarily unavailable" }, { status: 503 });
  }

  const url = new URL(request.url);
  const parsed = listingFiltersSchema.safeParse(readRawFilters(url.searchParams));
  if (!parsed.success) {
    return Response.json({ error: "Invalid listing filters" }, { status: 400 });
  }

  const filters = parsed.data;
  const rows = await findPublishedBoardingHouses();
  const listings = filterListings(toListingCards(rows), filters);

  return Response.json({ listings });
}

// Converts URL query values into the shared listing filter shape.
function readRawFilters(params: URLSearchParams): Record<string, unknown> {
  return {
    query: params.get("query") ?? undefined,
    maxPrice: params.get("maxPrice") ?? undefined,
    maxWalkingMinutes: params.get("maxWalkingMinutes") ?? undefined,
    gender: params.get("gender") ?? undefined,
    availableOnly: params.get("availableOnly") ?? undefined,
    amenities: params.get("amenities")?.split(",").filter(Boolean),
  };

}
