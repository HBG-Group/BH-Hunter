import { Suspense } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { AdStrip } from "@/components/ads/AdStrip";
import { DiscoveryView } from "@/components/discovery/DiscoveryView";
import { AboutSection } from "@/components/home/AboutSection";
import { FadeIn } from "@/components/ui/FadeIn";
import { findPublishedBoardingHouses } from "@/lib/db/boarding-houses";
import { getFavoriteIds } from "@/lib/db/favorites";
import { getCurrentProfile } from "@/lib/auth/profile";
import { toListingCards } from "@/services/listings";

// Listings and the current session come from runtime services; never query them
// during `next build`, where deployment database access is intentionally absent.
export const dynamic = "force-dynamic";

async function loadHomeData() {
  try {
    const rows = await findPublishedBoardingHouses();
    const listings = toListingCards(rows);
    const profile = await getCurrentProfile();
    const favoritedIds = profile ? await getFavoriteIds(profile.id) : [];

    return { listings, favoritedIds, isAuthenticated: profile !== null };
  } catch (error) {
    // Keep the incident detail in server logs while returning a safe public fallback.
    console.error("Unable to load homepage data", error);
    return null;
  }
}

// The homepage loads listings on the server, then hands plain data to the client
// discovery view. No database code ever reaches the browser.
export default async function HomePage() {
  const data = await loadHomeData();

  if (!data) {
    return (
      <div className="min-h-screen bg-canvas">
        <SiteHeader />
        <main className="mx-auto max-w-2xl px-4 py-16 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Listings are temporarily unavailable</h1>
          <p className="mt-3 text-muted">Please try again in a moment.</p>
        </main>
      </div>
    );
  }

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

        {/* Local business ads stream in without holding up the listings. */}
        <Suspense fallback={null}>
          <AdStrip />
        </Suspense>

          <DiscoveryView
            listings={data.listings}
            favoritedIds={data.favoritedIds}
            isAuthenticated={data.isAuthenticated}
        />

        <AboutSection />
      </main>
    </div>
  );
}
