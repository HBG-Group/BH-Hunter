import Link from "next/link";
import { requireOwner } from "@/lib/auth/profile";
import { findListingsByOwner } from "@/lib/db/owner";
import { getOwnerAnalytics } from "@/lib/db/analytics";
import { toOwnerListingViews } from "@/services/owner-dashboard";
import { StatCards } from "@/components/owner/StatCards";
import { OwnerListingCard } from "@/components/owner/OwnerListingCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { VerifiedOwnerBadge } from "@/components/ui/VerifiedOwnerBadge";

export default async function OwnerDashboardPage() {
  const owner = await requireOwner();
  const [rows, analytics] = await Promise.all([
    findListingsByOwner(owner.id),
    getOwnerAnalytics(owner.id),
  ]);
  const listings = toOwnerListingViews(rows);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Your listings</h1>
            {owner.verified && <VerifiedOwnerBadge compact />}
          </div>
          <Link
            href="/owner/requests"
            className="text-sm text-neutral-600 hover:text-neutral-900"
          >
            Viewing requests
          </Link>
          <p className="text-sm text-neutral-600">
            <Link href="/account/privacy" className="hover:text-neutral-900">
              Privacy controls
            </Link>
          </p>
        </div>
        <Link
          href="/owner/listings/new"
          aria-label="Add listing"
          className="flex h-9 items-center gap-1.5 rounded-full bg-primary pl-3 pr-4 text-sm font-medium text-white hover:bg-primary-hover"
        >
          <span aria-hidden className="text-base leading-none">
            +
          </span>
          Add
        </Link>
      </div>

      <StatCards summary={analytics} />

      {listings.length === 0 ? (
        <EmptyState
          title="No listings yet"
          message="Add your first boarding house and students will find it on the map."
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
