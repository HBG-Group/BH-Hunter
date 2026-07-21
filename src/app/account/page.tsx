import Link from "next/link";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth/profile";
import { findFavoriteListings, getFavoriteIds } from "@/lib/db/favorites";
import { findRecentlyViewed } from "@/lib/db/recently-viewed";
import { findReviewsByStudent } from "@/lib/db/reviews";
import { findViewingRequestsByStudent } from "@/lib/db/viewing-requests";
import { getNotificationPreference, findNotifications } from "@/lib/db/notifications";
import { toListingCards } from "@/services/listings";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ListingCard } from "@/components/listing/ListingCard";
import { Avatar } from "@/components/ui/Avatar";
import { Stars } from "@/components/ui/Stars";
import { EmptyState } from "@/components/ui/EmptyState";
import { NotificationSettings } from "@/components/student/NotificationSettings";
import { NotificationList } from "@/components/student/NotificationList";

export default async function AccountPage() {
  const profile = await requireProfile("/account");
  // Owners have their own dashboard; send them there.
  if (profile.role === "OWNER") redirect("/owner");

  const [favoriteRows, recentRows, favoriteIds, reviews, viewings, preference, notifications] =
    await Promise.all([
      findFavoriteListings(profile.id),
      findRecentlyViewed(profile.id),
      getFavoriteIds(profile.id),
      findReviewsByStudent(profile.id),
      findViewingRequestsByStudent(profile.id),
      getNotificationPreference(profile.id),
      findNotifications(profile.id),
    ]);

  const favorites = toListingCards(favoriteRows);
  const recent = toListingCards(recentRows);
  const favoritedSet = new Set(favoriteIds);

  const grid = (listings: ReturnType<typeof toListingCards>) => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} isFavorited={favoritedSet.has(listing.id)} />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-canvas">
      <SiteHeader />
      <main className="mx-auto max-w-5xl space-y-8 px-4 py-6">
        <section className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5">
          <Avatar name={profile.fullName} src={profile.avatarUrl} size={56} />
          <div>
            <h1 className="text-lg font-semibold text-neutral-900">{profile.fullName}</h1>
            <p className="text-sm text-neutral-500">{profile.email}</p>
          </div>
        </section>

        <section id="favorites" className="scroll-mt-20 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-neutral-900">Places you saved</h2>
            {favorites.length >= 2 && (
              <Link href="/compare" className="text-sm text-neutral-600 hover:text-neutral-900">
                Compare →
              </Link>
            )}
          </div>
          {favorites.length === 0 ? (
            <EmptyState
              title="Nothing saved yet"
              message="Tap the heart on a place you like and it will be waiting here."
              actionLabel="Browse listings"
              actionHref="/"
            />
          ) : (
            grid(favorites)
          )}
        </section>

        {recent.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight text-neutral-900">Recently viewed</h2>
            {grid(recent)}
          </section>
        )}

        <section className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight text-neutral-900">Reviews written</h2>
          {reviews.length === 0 ? (
            <EmptyState
              title="No reviews yet"
              message="Tell other students what living somewhere was really like — it helps more than you think."
              actionLabel="Browse listings"
              actionHref="/"
            />
          ) : (
            <div className="divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-white">
              {reviews.map((review) => (
                <div key={review.id} className="flex items-center justify-between px-4 py-3">
                  <Link
                    href={`/listings/${review.boardingHouse.slug}`}
                    className="text-sm font-medium text-neutral-900 hover:underline"
                  >
                    {review.boardingHouse.name}
                  </Link>
                  <Stars value={review.overall} size={14} />
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight text-neutral-900">Notifications</h2>
          <NotificationList
            notifications={notifications.map((n) => ({
              id: n.id,
              title: n.title,
              body: n.body,
              createdAt: n.createdAt.toISOString(),
              isRead: n.readAt !== null,
            }))}
          />
        </section>

        <section id="settings" className="scroll-mt-20 space-y-3">
          <h2 className="text-lg font-semibold tracking-tight text-neutral-900">Settings</h2>
          <NotificationSettings roomAlerts={preference.roomAvailableAlerts} />
        </section>

        {viewings.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight text-neutral-900">Viewing requests</h2>
            <div className="divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-white">
              {viewings.map((viewing) => (
                <Link
                  key={viewing.id}
                  href={`/listings/${viewing.boardingHouse.slug}`}
                  className="block px-4 py-3 text-sm text-neutral-900 hover:bg-canvas"
                >
                  {viewing.boardingHouse.name}
                  <span className="ml-2 text-xs text-neutral-500">{viewing.status.toLowerCase()}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
