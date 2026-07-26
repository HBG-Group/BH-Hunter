import { formatPeso } from "@/lib/utils/format";
import { formatCurfew } from "@/lib/utils/curfew";
import type { ListingDetail } from "@/types/listing";

interface Props {
  listing: ListingDetail;
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-neutral-50 p-3">
      <dt className="text-xs text-neutral-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-neutral-900">{value}</dd>
    </div>
  );
}

const genderLabels: Record<string, string> = {
  MALE: "Male only",
  FEMALE: "Female only",
  MIXED: "Mixed",
};

// The key numbers a student scans first: price, terms, capacity, distance.
export function FactList({ listing }: Props) {
  return (
    <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      <Fact label="Monthly rent" value={`${formatPeso(listing.priceMonthly)}/mo`} />
      <Fact label="Advance" value={`${listing.advanceMonths} month(s)`} />
      <Fact label="Deposit" value={`${listing.depositMonths} month(s)`} />
      <Fact label="Gender policy" value={genderLabels[listing.genderPolicy] ?? listing.genderPolicy} />
      <Fact label="Capacity" value={`${listing.totalCapacity} beds`} />
      <Fact label="Walk to campus" value={`${listing.walkingMinutesToCampus} min`} />
      <Fact label="Utilities" value={listing.utilitiesIncluded ? "Included" : "Separate"} />
      <Fact label="Internet" value={listing.internetIncluded ? "Included" : "Not included"} />
      <Fact label="Curfew" value={formatCurfew(listing.curfew)} />
    </dl>
  );
}
