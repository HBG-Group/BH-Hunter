import { SiteHeader } from "@/components/layout/SiteHeader";
import { DiscoveryView } from "@/components/discovery/DiscoveryView";
import { AboutSection } from "@/components/home/AboutSection";
import { FadeIn } from "@/components/ui/FadeIn";
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
    <div className="min-h-screen bg-canvas">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <FadeIn className="mb-8 max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Find your place near VSU
          </h1>
          <p className="mt-3 text-lg text-muted">
            Every boarding house around campus on one map — real vacancies, honest walk times, and no sign-in needed to look around.
          </p>
        </FadeIn>

        <DiscoveryView
          listings={listings}
          favoritedIds={favoritedIds}
          isAuthenticated={profile !== null}
        />

        <AboutSection />
      </main>
    </div>
  );
}
