import Link from "next/link";
import { requireProfile } from "@/lib/auth/profile";
import { findFavoriteListings } from "@/lib/db/favorites";
import { toListingCards } from "@/services/listings";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { CompareTable } from "@/components/student/CompareTable";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function ComparePage() {
  const profile = await requireProfile("/compare");
  const favorites = toListingCards(await findFavoriteListings(profile.id));

  return (
    <div className="min-h-screen bg-canvas">
      <SiteHeader />
      <main className="mx-auto max-w-5xl space-y-4 px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Compare saved</h1>
          <Link href="/account" className="text-sm text-neutral-500 hover:text-neutral-900">
            ← Back to profile
          </Link>
        </div>

        {favorites.length < 2 ? (
          <EmptyState
            title="Save two to compare"
            message="Pick a couple of places you are torn between and see them side by side."
            actionLabel="Browse places"
            actionHref="/"
          />
        ) : (
          <CompareTable listings={favorites} />
        )}
      </main>
    </div>
  );
}
