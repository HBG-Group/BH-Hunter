import { findBoardingHouseBySlug } from "@/lib/db/boarding-houses";
import { toListingDetail } from "@/services/listings";

// Returns one published listing by its public slug.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const listing = await findBoardingHouseBySlug(slug);

  if (!listing) {
    return Response.json({ error: "Listing not found" }, { status: 404 });
  }

  return Response.json(toListingDetail(listing));
}
