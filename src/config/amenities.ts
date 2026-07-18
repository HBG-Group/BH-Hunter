// The master list of amenities students can filter by. The `key` is what we store
// in the database; the `label` is what we show. Keeping this list here (instead of
// scattered across components) means one place to add a new amenity.

export interface AmenityDefinition {
  key: string;
  label: string;
}

export const AMENITIES: AmenityDefinition[] = [
  { key: "wifi", label: "WiFi" },
  { key: "aircon", label: "Aircon" },
  { key: "parking", label: "Parking" },
  { key: "laundry", label: "Laundry" },
  { key: "kitchen", label: "Kitchen" },
  { key: "study_area", label: "Study Area" },
  { key: "private_bathroom", label: "Private Bathroom" },
  { key: "shared_bathroom", label: "Shared Bathroom" },
  { key: "pets_allowed", label: "Pets Allowed" },
  { key: "visitors_allowed", label: "Visitors Allowed" },
];

export const AMENITY_KEYS = AMENITIES.map((amenity) => amenity.key);
