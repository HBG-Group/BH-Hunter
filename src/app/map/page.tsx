import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MapDiscovery } from "@/components/discovery/MapDiscovery";
import { findPublishedBoardingHouses } from "@/lib/db/boarding-houses";
import { getFavoriteIds } from "@/lib/db/favorites";
import { getCurrentProfile } from "@/lib/auth/profile";
import { resilientRead } from "@/lib/async/resilient-read";
import { toListingCards } from "@/services/listings";

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const [rows, profile] = await resilientRead(() =>
    Promise.all([findPublishedBoardingHouses(), getCurrentProfile()]),
  );
  const listings = toListingCards(rows);
  const favoritedIds = profile ? await getFavoriteIds(profile.id) : [];

  return (
    <div className="min-h-screen bg-canvas">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center text-sm text-primary underline"
        >
          ← Back to listings
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
          Explore the campus map
        </h1>
        <p className="mb-6 mt-2 text-muted">
          Filter every published boarding house and open a place directly from
          its marker.
        </p>
        <MapDiscovery
          listings={listings}
          favoritedIds={favoritedIds}
          isAuthenticated={profile !== null}
        />
      </main>
    </div>
  );
}
