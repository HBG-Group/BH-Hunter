import Link from "next/link";
import { requireOwner } from "@/lib/auth/profile";
import { findListingsByOwner } from "@/lib/db/owner";
import { getOwnerAnalytics } from "@/lib/db/analytics";
import { toOwnerListingViews } from "@/services/owner-dashboard";
import { StatCards } from "@/components/owner/StatCards";
import { OwnerListingCard } from "@/components/owner/OwnerListingCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { VerifiedOwnerBadge } from "@/components/ui/VerifiedOwnerBadge";
import { OwnerOnboarding } from "@/components/owner/OwnerOnboarding";
import { TutorialChecklist } from "@/components/tutorial/TutorialChecklist";
import { DangerZone } from "@/components/account/DangerZone";
import { isVerified } from "@/lib/owner/verification";

export default async function OwnerDashboardPage() {
  const owner = await requireOwner();
  const [rows, analytics] = await Promise.all([
    findListingsByOwner(owner.id),
    getOwnerAnalytics(owner.id),
  ]);
  const listings = toOwnerListingViews(rows);

  const ownerVerified = isVerified(owner);

  // Getting-started checklist, computed from real data.
  const totals = rows.reduce(
    (acc, row) => ({
      photos: acc.photos + row._count.images,
      requests: acc.requests + row._count.viewingRequests,
      favorites: acc.favorites + row._count.favorites,
    }),
    { photos: 0, requests: 0, favorites: 0 },
  );
  const checklist = {
    tutorial: owner.ownerTutorialCompleted,
    listing: rows.length > 0,
    photos: totals.photos >= 5,
    profile: Boolean(owner.phone?.trim()),
    request: totals.requests > 0,
    favorite: totals.favorites > 0,
  };

  return (
    <div className="space-y-6" data-tour="dashboard">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Your listings</h1>
            {ownerVerified && <VerifiedOwnerBadge compact />}
          </div>
          <Link
            href="/owner/requests"
            data-tour="requests"
            className="text-sm text-neutral-600 hover:text-neutral-900"
          >
            Viewing requests
          </Link>
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

      <TutorialChecklist done={checklist} />

      <div data-tour="analytics">
        <StatCards summary={analytics} />
      </div>

      <div data-tour="listings">
        {listings.length === 0 ? (
          <EmptyState
            title="No listings yet"
            message="Create your first boarding house to start receiving student inquiries."
            actionLabel="Create Listing"
            actionHref="/owner/listings/new"
          />
        ) : (
          <div className="space-y-3">
            {listings.map((listing) => (
              <OwnerListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>

      <section id="settings" data-tour="settings" className="scroll-mt-20 space-y-3 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-neutral-900">Settings &amp; Help</h2>
          <OwnerOnboarding autoLaunch={!owner.ownerTutorialCompleted} />
        </div>
        <DangerZone />
      </section>
    </div>
  );
}
