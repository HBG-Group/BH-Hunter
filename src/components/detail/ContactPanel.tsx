import { AvailabilityBadge } from "@/components/ui/AvailabilityBadge";
import { SafetyReminder } from "@/components/ui/SafetyReminder";
import { ContactButtons } from "@/components/detail/ContactButtons";
import { formatPeso, formatRelativeTime } from "@/lib/utils/format";
import type { ListingDetail } from "@/types/listing";

interface Props {
  listing: ListingDetail;
}

// Sticky "contact the owner" card. Links are real (tel:/mailto:/messenger); tracking
// these clicks as analytics events is wired up alongside the owner dashboard (M2).
export function ContactPanel({ listing }: Props) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-baseline justify-between">
        <p className="text-2xl font-semibold text-neutral-900">
          {formatPeso(listing.priceMonthly)}
          <span className="text-sm font-normal text-neutral-500">/mo</span>
        </p>
        <AvailabilityBadge state={listing.availabilityState} remaining={listing.remainingVacancies} />
      </div>

      <p className="mt-1 text-xs text-neutral-400">{formatRelativeTime(listing.lastConfirmedAt)}</p>
      {listing.isAvailabilityStale && (
        <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Availability not confirmed recently — please verify with the owner.
        </p>
      )}

      <ContactButtons
        boardingHouseId={listing.id}
        contactPhone={listing.contactPhone}
        messengerUrl={listing.messengerUrl}
        contactEmail={listing.contactEmail}
      />

      <SafetyReminder
        className="mt-3 border-t border-line pt-3"
        message="Never send a deposit before viewing the property in person. Meino doesn't process payments."
      />
    </div>
  );
}
