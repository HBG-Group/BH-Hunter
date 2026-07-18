// Turns validated form input into the shape the data-access layer stores. Keeping
// this mapping here (not in the action or the component) means the slug rule and the
// empty-string-to-null normalisation live in exactly one place.

import type { ListingWriteData, findOwnerListing } from "@/lib/db/owner";
import type { ListingInput } from "@/lib/validation/listing";
import type { ListingFormValues } from "@/components/owner/form/types";
import { slugify } from "@/lib/utils/slug";

type OwnerListingRow = NonNullable<Awaited<ReturnType<typeof findOwnerListing>>>;

// Pre-fills the edit form from a stored listing.
export function toFormValues(row: OwnerListingRow): ListingFormValues {
  return {
    name: row.name,
    addressLine: row.addressLine,
    latitude: row.latitude,
    longitude: row.longitude,
    genderPolicy: row.genderPolicy,
    priceMonthly: row.priceMonthly,
    advanceMonths: row.advanceMonths,
    depositMonths: row.depositMonths,
    utilitiesIncluded: row.utilitiesIncluded,
    internetIncluded: row.internetIncluded,
    curfew: row.curfew ?? "",
    houseRules: row.houseRules ?? "",
    contactPhone: row.contactPhone,
    messengerUrl: row.messengerUrl ?? "",
    contactEmail: row.contactEmail ?? "",
    amenityKeys: row.amenities.map((link) => link.amenity.key),
    rooms: row.rooms.map((room) => ({
      label: room.label,
      capacity: room.capacity,
      occupied: room.occupied,
      priceMonthly: room.priceMonthly ?? undefined,
    })),
  };
}

function emptyToNull(value: string | undefined): string | null {
  return value && value.trim() !== "" ? value : null;
}

export function toWriteData(input: ListingInput): ListingWriteData {
  return {
    name: input.name,
    slug: slugify(input.name),
    addressLine: input.addressLine,
    latitude: input.latitude,
    longitude: input.longitude,
    genderPolicy: input.genderPolicy,
    priceMonthly: input.priceMonthly,
    advanceMonths: input.advanceMonths,
    depositMonths: input.depositMonths,
    utilitiesIncluded: input.utilitiesIncluded,
    internetIncluded: input.internetIncluded,
    curfew: emptyToNull(input.curfew),
    houseRules: emptyToNull(input.houseRules),
    contactPhone: input.contactPhone,
    messengerUrl: emptyToNull(input.messengerUrl),
    contactEmail: emptyToNull(input.contactEmail),
    amenityKeys: input.amenityKeys,
    rooms: input.rooms.map((room) => ({
      label: room.label,
      capacity: room.capacity,
      occupied: room.occupied,
      priceMonthly: room.priceMonthly,
    })),
  };
}
