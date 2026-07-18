import Link from "next/link";
import { AVAILABILITY_STYLES } from "@/config/availability";
import { formatPeso } from "@/lib/utils/format";
import type { ListingCard } from "@/types/listing";

interface Props {
  listings: ListingCard[];
}

const genderLabels: Record<string, string> = { MALE: "Male", FEMALE: "Female", MIXED: "Mixed" };

// Rows of the comparison, each reading one value off a listing.
const rows: { label: string; value: (listing: ListingCard) => string }[] = [
  { label: "Monthly rent", value: (l) => `${formatPeso(l.priceMonthly)}/mo` },
  { label: "Availability", value: (l) => `${l.remainingVacancies} of ${l.totalCapacity} free` },
  { label: "Walk to campus", value: (l) => `${l.walkingMinutesToCampus} min` },
  { label: "Gender", value: (l) => genderLabels[l.genderPolicy] ?? l.genderPolicy },
  { label: "Amenities", value: (l) => `${l.amenityKeys.length} listed` },
  { label: "Verified", value: (l) => (l.isVerified ? "Yes" : "—") },
];

export function CompareTable({ listings }: Props) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="border-b border-neutral-100">
            <th className="p-3 text-left font-medium text-neutral-500">Compare</th>
            {listings.map((listing) => (
              <th key={listing.id} className="p-3 text-left">
                <Link href={`/listings/${listing.slug}`} className="font-medium text-neutral-900 hover:underline">
                  {listing.name}
                </Link>
                <span
                  className="mt-1 block h-1.5 w-8 rounded-full"
                  style={{ backgroundColor: AVAILABILITY_STYLES[listing.availabilityState].color }}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-neutral-50 last:border-0">
              <td className="p-3 text-neutral-500">{row.label}</td>
              {listings.map((listing) => (
                <td key={listing.id} className="p-3 text-neutral-900">
                  {row.value(listing)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
