// One Zod schema for search filters, used by both the client (form) and the server
// (API/query). Validating in a single shared place means the two can never drift.

import { z } from "zod";
import { AMENITY_KEYS } from "@/config/amenities";

export const genderFilterValues = ["MALE", "FEMALE", "MIXED"] as const;

export const listingFiltersSchema = z.object({
  // Free-text search over name / address.
  query: z.string().trim().max(120).optional(),

  maxPrice: z.coerce.number().int().positive().optional(),
  maxWalkingMinutes: z.coerce.number().int().positive().optional(),

  gender: z.enum(genderFilterValues).optional(),
  availableOnly: z.coerce.boolean().optional(),

  // Amenity keys must come from our known catalog — anything else is rejected.
  amenities: z.array(z.enum(AMENITY_KEYS as [string, ...string[]])).optional(),
});

export type ListingFilters = z.infer<typeof listingFiltersSchema>;
