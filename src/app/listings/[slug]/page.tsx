import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PhotoGallery } from "@/components/detail/PhotoGallery";
import { FactList } from "@/components/detail/FactList";
import { NearbyList } from "@/components/detail/NearbyList";
import { ContactPanel } from "@/components/detail/ContactPanel";
import { ViewTracker } from "@/components/detail/ViewTracker";
import { ListingLocation } from "@/components/detail/ListingLocation";
import { ReviewList } from "@/components/detail/ReviewList";
import { ReviewForm } from "@/components/detail/ReviewForm";
import { ViewingRequestForm } from "@/components/detail/ViewingRequestForm";
import { AmenityChips } from "@/components/ui/AmenityChips";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { FavoriteButton } from "@/components/student/FavoriteButton";
import { findBoardingHouseBySlug } from "@/lib/db/boarding-houses";
import { findReviews, findStudentReview, getRatingSummary } from "@/lib/db/reviews";
import { getFavoriteIds } from "@/lib/db/favorites";
import { getCurrentProfile } from "@/lib/auth/profile";
import { submitReviewAction } from "@/lib/student/review-actions";
import { requestViewingAction } from "@/lib/student/viewing-actions";
import { toListingDetail } from "@/services/listings";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const row = await findBoardingHouseBySlug(slug);
  if (!row) return { title: "Listing not found — BH Hunter" };

  return {
    title: `${row.name} — BH Hunter`,
    description: `${row.name} near VSU: ${row.addressLine}. Check vacancies, price, and amenities.`,
  };
}

// A gentle nudge shown in place of the review/viewing forms when signed out.
function SignInPrompt({ slug }: { slug: string }) {
  return (
    <p className="rounded-2xl border border-dashed border-neutral-200 bg-white p-4 text-sm text-neutral-500">
      <Link href={`/login?next=/listings/${slug}`} className="text-neutral-900 underline">
        Sign in
      </Link>{" "}
      to save this place, leave a review, or request a viewing.
    </p>
  );
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const row = await findBoardingHouseBySlug(slug);
  if (!row) notFound();

  const listing = toListingDetail(row);
  const target = { boardingHouseId: row.id, slug: row.slug };

  const profile = await getCurrentProfile();
  const [reviewRows, summary, favoriteIds, myReview] = await Promise.all([
    findReviews(row.id),
    getRatingSummary(row.id),
    profile ? getFavoriteIds(profile.id) : Promise.resolve<string[]>([]),
    profile ? findStudentReview(row.id, profile.id) : Promise.resolve(null),
  ]);

  const reviews = reviewRows.map((review) => ({
    id: review.id,
    authorName: review.author.fullName,
    overall: review.overall,
    body: review.body,
    createdAt: review.createdAt.toISOString(),
  }));
  const isFavorited = favoriteIds.includes(row.id);

  return (
    <div className="min-h-screen bg-neutral-50">
      <ViewTracker boardingHouseId={listing.id} />
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-900">
          ← Back to map
        </Link>

        <div className="mt-3 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-6">
            <PhotoGallery images={listing.images} name={listing.name} />

            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">{listing.name}</h1>
                  {listing.isVerified && <VerifiedBadge />}
                </div>
                <p className="mt-1 text-neutral-500">{listing.addressLine}</p>
              </div>
              <FavoriteButton
                boardingHouseId={row.id}
                initialFavorited={isFavorited}
                isAuthenticated={profile !== null}
                variant="inline"
              />
            </div>

            <FactList listing={listing} />

            <section>
              <h2 className="mb-2 text-sm font-semibold text-neutral-900">Amenities</h2>
              <AmenityChips amenityKeys={listing.amenityKeys} />
            </section>

            {listing.houseRules && (
              <section>
                <h2 className="mb-2 text-sm font-semibold text-neutral-900">House rules</h2>
                <p className="text-sm text-neutral-600">{listing.houseRules}</p>
              </section>
            )}

            <section>
              <h2 className="mb-2 text-sm font-semibold text-neutral-900">Location</h2>
              <ListingLocation
                latitude={listing.latitude}
                longitude={listing.longitude}
                availabilityState={listing.availabilityState}
                walkingMinutes={listing.walkingMinutesToCampus}
              />
            </section>

            {listing.nearbyPlaces.length > 0 && (
              <section>
                <h2 className="mb-1 text-sm font-semibold text-neutral-900">What&apos;s nearby</h2>
                <NearbyList places={listing.nearbyPlaces} />
              </section>
            )}

            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-neutral-900">Reviews</h2>
              <ReviewList summary={summary} reviews={reviews} />
              {profile ? (
                <ReviewForm
                  action={submitReviewAction.bind(null, target)}
                  slug={slug}
                  existing={myReview}
                />
              ) : (
                <SignInPrompt slug={slug} />
              )}
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <ContactPanel listing={listing} />
            {profile ? (
              <ViewingRequestForm action={requestViewingAction.bind(null, target)} />
            ) : (
              <SignInPrompt slug={slug} />
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
