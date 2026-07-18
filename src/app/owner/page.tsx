import Link from "next/link";
import { requireOwner } from "@/lib/auth/profile";
import { findListingsByOwner } from "@/lib/db/owner";
import { getOwnerAnalytics } from "@/lib/db/analytics";
import { toOwnerListingViews } from "@/services/owner-dashboard";
import { StatCards } from "@/components/owner/StatCards";
import { OwnerListingCard } from "@/components/owner/OwnerListingCard";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function OwnerDashboardPage() {
  const owner = await requireOwner();
  const [rows, analytics] = await Promise.all([
    findListingsByOwner(owner.id),
    getOwnerAnalytics(owner.id),
  ]);
  const listings = toOwnerListingViews(rows);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Your listings</h1>
        <div className="flex items-center gap-3">
          <Link href="/owner/requests" className="text-sm text-neutral-600 hover:text-neutral-900">
            Viewing requests
          </Link>
          <Link
            href="/owner/listings/new"
            className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Add listing
          </Link>
        </div>
      </div>

      <p className="text-sm text-neutral-500">
        Submit a listing for review — an admin verifies and publishes it before it appears on the map.
      </p>

      <StatCards summary={analytics} />

      {listings.length === 0 ? (
        <EmptyState
          title="No listings yet"
          message="Add your first boarding house to put it on the map."
        />
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => (
            <OwnerListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
