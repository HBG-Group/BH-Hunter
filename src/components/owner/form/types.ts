import { activeCampus } from "@/config/campus";
import type { RoomValue } from "@/components/owner/form/RoomsEditor";
import type { GenderPolicy } from "@/types/domain";
import type { ContactNumber } from "@/lib/contact/phones";

// The editable state of the listing form. Kept loose (numbers/strings) for the inputs;
// the Zod schema on the server does the real validation and coercion.
export interface ListingFormValues {
  name: string;
  addressLine: string;
  latitude: number;
  longitude: number;
  genderPolicy: GenderPolicy;
  priceMonthly: number;
  advanceMonths: number;
  depositMonths: number;
  utilitiesIncluded: boolean;
  internetIncluded: boolean;
  curfew: string;
  houseRules: string;
  contactNumbers: ContactNumber[];
  messengerUrl: string;
  contactEmail: string;
  amenityKeys: string[];
  rooms: RoomValue[];
}

// A sensible blank listing, centered on campus so the owner only nudges the pin.
export function emptyListingForm(): ListingFormValues {
  return {
    name: "",
    addressLine: "",
    latitude: activeCampus.center.latitude,
    longitude: activeCampus.center.longitude,
    genderPolicy: "MIXED",
    priceMonthly: 1500,
    advanceMonths: 1,
    depositMonths: 1,
    utilitiesIncluded: false,
    internetIncluded: false,
    curfew: "22:00",
    houseRules: "",
    contactNumbers: [{ number: "", carrier: "" }],
    messengerUrl: "",
    contactEmail: "",
    amenityKeys: [],
    rooms: [{ label: "Room 1", capacity: 4, occupied: 0 }],
  };
}
