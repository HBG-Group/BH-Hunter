import { AvailabilityBadge } from "@/components/ui/AvailabilityBadge";
import { formatRelativeTime } from "@/lib/utils/format";
import type { ListingDetail } from "@/types/listing";

// Headline availability card: how many beds are open, and how fresh the number is.
export function AvailabilitySummary({ listing }: { listing: ListingDetail }) {
  const occupied = listing.totalCapacity - listing.remainingVacancies;

  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-3xl font-semibold text-ink">
            {listing.remainingVacancies}
            <span className="text-lg font-normal text-muted"> of {listing.totalCapacity} beds open</span>
          </p>
          <p className="mt-1 text-sm text-muted">
            {occupied} occupied · {formatRelativeTime(listing.lastConfirmedAt)}
          </p>
        </div>
        <AvailabilityBadge state={listing.availabilityState} remaining={listing.remainingVacancies} />
      </div>

      {listing.isAvailabilityStale && (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Availability hasn&apos;t been confirmed recently — double-check with the owner.
        </p>
      )}
    </div>
  );
}
