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
import { ViewingCalendar } from "@/components/detail/ViewingCalendar";
import { ListingDetailTabs } from "@/components/detail/ListingDetailTabs";
import { AvailabilitySummary } from "@/components/detail/AvailabilitySummary";
import { AmenityChips } from "@/components/ui/AmenityChips";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { VerifiedOwnerBadge } from "@/components/ui/VerifiedOwnerBadge";
import { Stars } from "@/components/ui/Stars";
import { FavoriteButton } from "@/components/student/FavoriteButton";
import { findBoardingHouseBySlug } from "@/lib/db/boarding-houses";
import {
  findReviews,
  findStudentReview,
  getRatingSummary,
  hasConfirmedViewingRequest,
} from "@/lib/db/reviews";
import { findConfirmedViewingDates } from "@/lib/db/viewing-requests";
import { getFavoriteIds } from "@/lib/db/favorites";
import { getCurrentProfile } from "@/lib/auth/profile";
import { submitReviewAction } from "@/lib/student/review-actions";
import { requestViewingAction } from "@/lib/student/viewing-actions";
import { toListingDetail } from "@/services/listings";
import { resilientRead } from "@/lib/async/resilient-read";
import { ADMIN_CONTACT } from "@/config/support";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const row = await resilientRead(() => findBoardingHouseBySlug(slug));
  if (!row) return { title: "Listing not found — Meino" };

  return {
    title: `${row.name} — Meino`,
    description: `${row.name} near VSU: ${row.addressLine}. Check vacancies, price, and amenities.`,
  };
}

// A gentle nudge shown in place of the review/viewing forms when signed out.
function SignInPrompt({ slug }: { slug: string }) {
  return (
    <p className="rounded-2xl border border-dashed border-line bg-white p-4 text-sm text-muted">
      <Link
        href={`/login?next=/listings/${slug}`}
        className="text-primary underline"
      >
        Sign in
      </Link>{" "}
      to save this place, leave a review, or request a viewing.
    </p>
  );
}

// Consistent section heading + scroll offset for the sticky header + tabs.
function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-32 space-y-3">
      <h2 className="text-xl font-semibold tracking-tight text-ink">{title}</h2>
      {children}
    </section>
  );
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { slug } = await params;
  // The listing lookup and the current session are independent — run them together
  // instead of waiting on one before starting the other.
  const [row, profile] = await Promise.all([
    resilientRead(() => findBoardingHouseBySlug(slug), {
      timeoutMs: 8_000,
      timeoutMessage: "Listing data did not respond in time",
    }),
    getCurrentProfile(),
  ]);
  if (!row) notFound();

  const listing = toListingDetail(row);
  const target = { boardingHouseId: row.id, slug: row.slug };

  const [
    reviewRows,
    summary,
    favoriteIds,
    myReview,
    hasConfirmedViewing,
    viewingDates,
  ] = await resilientRead(() =>
    Promise.all([
      findReviews(row.id),
      getRatingSummary(row.id),
      profile ? getFavoriteIds(profile.id) : Promise.resolve<string[]>([]),
      profile ? findStudentReview(row.id, profile.id) : Promise.resolve(null),
      profile?.role === "STUDENT"
        ? hasConfirmedViewingRequest(profile.id, row.id)
        : Promise.resolve(null),
      findConfirmedViewingDates(row.id),
    ]),
    {
      timeoutMs: 8_000,
      timeoutMessage: "Listing details did not respond in time",
    },
  );

  // Local yyyy-mm-dd keys so the calendar marks the right day regardless of timezone.
  const bookedDays = viewingDates.map((date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  });

  const reviews = reviewRows.map((review) => ({
    id: review.id,
    authorName: review.author.fullName,
    overall: review.overall,
    body: review.body,
    createdAt: review.createdAt.toISOString(),
  }));
  const isFavorited = favoriteIds.includes(row.id);

  return (
    <div className="min-h-screen bg-canvas">
      <ViewTracker boardingHouseId={listing.id} />
      <SiteHeader />
      <main className="mx-auto max-w-6xl overflow-x-clip px-4 py-6">
        <Link href="/" className="text-sm text-muted hover:text-ink">
          ← Back to map
        </Link>

        {/* Gallery first */}
        <div className="mt-3">
          <PhotoGallery images={listing.images} name={listing.name} />
        </div>

        {/* Title block */}
        <div className="mt-5 flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-semibold tracking-tight text-ink">
                {listing.name}
              </h1>
              {listing.isVerified && <VerifiedBadge />}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
              <span className="flex items-center gap-1">
                <Stars value={summary.average} size={14} />
                {summary.count > 0
                  ? `${summary.average.toFixed(1)} (${summary.count})`
                  : "No reviews yet"}
              </span>
              <span>·</span>
              <span>{listing.addressLine}</span>
            </div>
          </div>
          <FavoriteButton
            boardingHouseId={row.id}
            initialFavorited={isFavorited}
            isAuthenticated={profile !== null}
            variant="inline"
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="mt-5 min-w-0">
            <ListingDetailTabs
              tabs={[
                { id: "overview", label: "Overview", content: <Section id="overview" title="Overview">
              <FactList listing={listing} />
              {listing.houseRules && (
                <div className="rounded-2xl border border-line bg-white p-4">
                  <p className="text-sm font-medium text-ink">House rules</p>
                  <p className="mt-1 text-sm text-muted">
                    {listing.houseRules}
                  </p>
                </div>
              )}
                </Section> },
                { id: "amenities", label: "Amenities", content: <Section id="amenities" title="Amenities">
              <AmenityChips amenityKeys={listing.amenityKeys} variant="detail" />
                </Section> },
                { id: "availability", label: "Availability", content: <Section id="availability" title="Availability">
              <AvailabilitySummary listing={listing} />
                </Section> },
                { id: "reviews", label: "Reviews", content: <Section id="reviews" title="Reviews">
              <ReviewList summary={summary} reviews={reviews} />
              {profile ? (
                <ReviewForm
                  action={submitReviewAction.bind(null, target)}
                  slug={slug}
                  existing={myReview}
                  eligible={Boolean(myReview || hasConfirmedViewing)}
                />
              ) : (
                <SignInPrompt slug={slug} />
              )}
                </Section> },
                { id: "location", label: "Location", content: <Section id="location" title="Location">
              <ListingLocation
                latitude={listing.latitude}
                longitude={listing.longitude}
                availabilityState={listing.availabilityState}
                walkingMinutes={listing.walkingMinutesToCampus}
              />
              {listing.nearbyPlaces.length > 0 && (
                <div className="pt-2">
                  <p className="mb-1 text-sm font-medium text-ink">
                    What&apos;s nearby
                  </p>
                  <NearbyList places={listing.nearbyPlaces} />
                </div>
              )}
                </Section> },
                { id: "owner", label: "Owner", content: <section id="owner" className="scroll-mt-32 space-y-4"><h2 className="text-xl font-semibold tracking-tight text-ink">Owner</h2><ContactPanel listing={listing} /></section> },
              ]}
            />
          </div>

          <aside
            className="hidden scroll-mt-32 space-y-4 lg:sticky lg:top-24 lg:block lg:self-start"
          >
            <div className="flex items-center justify-between gap-2 rounded-2xl border border-line bg-white px-4 py-3">
              <span className="text-sm text-muted">
                Listed by{" "}
                <span className="font-medium text-ink">
                  {listing.ownerName}
                </span>
              </span>
              {listing.ownerVerified && <VerifiedOwnerBadge compact />}
            </div>
            <ContactPanel listing={listing} />
            <a
              href={`mailto:${ADMIN_CONTACT.email}?subject=${encodeURIComponent(`Report listing: ${listing.name}`)}&body=${encodeURIComponent(`Please describe the issue with this listing:\n\nListing: ${listing.name}\nURL: /listings/${slug}\n\nIssue:`)}`}
              className="block text-center text-xs text-muted underline hover:text-ink"
            >
              Report an incorrect or unsafe listing
            </a>
            {profile ? (
              <ViewingRequestForm
                action={requestViewingAction.bind(null, target)}
              />
            ) : (
              <Link
                href={`/login?next=/listings/${slug}`}
                className="block rounded-2xl border border-line bg-white p-4 text-center text-sm text-muted hover:text-ink"
              >
                Sign in to request a viewing →
              </Link>
            )}
            <ViewingCalendar bookedDays={bookedDays} />
          </aside>
        </div>
      </main>
    </div>
  );
}
