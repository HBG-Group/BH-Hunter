import { SiteHeader } from "@/components/layout/SiteHeader";
import { DiscoveryView } from "@/components/discovery/DiscoveryView";
import { findPublishedBoardingHouses } from "@/lib/db/boarding-houses";
import { getFavoriteIds } from "@/lib/db/favorites";
import { getCurrentProfile } from "@/lib/auth/profile";
import { toListingCards } from "@/services/listings";

// The homepage loads listings on the server, then hands plain data to the client
// discovery view. No database code ever reaches the browser.
export default async function HomePage() {
  const rows = await findPublishedBoardingHouses();
  const listings = toListingCards(rows);

  // If someone is signed in, pre-mark their saved listings.
  const profile = await getCurrentProfile();
  const favoritedIds = profile ? await getFavoriteIds(profile.id) : [];

  return (
    <div className="min-h-screen bg-neutral-50">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <section id="explore" className="mb-6 scroll-mt-20">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
            Find your boarding house near VSU
          </h1>
          <p className="mt-1 text-neutral-500">
            Compare prices, check real vacancies, and see the walk to campus — all on one map.
          </p>
        </section>

        <div id="map" className="scroll-mt-20">
          <DiscoveryView
            listings={listings}
            favoritedIds={favoritedIds}
            isAuthenticated={profile !== null}
          />
        </div>
      </main>
    </div>
  );
}
