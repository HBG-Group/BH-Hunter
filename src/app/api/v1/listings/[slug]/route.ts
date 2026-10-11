import { findBoardingHouseBySlug } from "@/lib/db/boarding-houses";
import { toListingDetail } from "@/services/listings";
import { allow, LIMITS } from "@/lib/security/rate-limit";

const RATE_LIMIT_MESSAGE = "Too many API requests. Please try again in a minute.";

// Returns one published listing by its public slug.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
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

  const { slug } = await params;
  const listing = await findBoardingHouseBySlug(slug);

  if (!listing) {
    return Response.json({ error: "Listing not found" }, { status: 404 });
  }

  return Response.json(toListingDetail(listing));
}
