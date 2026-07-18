import type { ListingNearbyPlace } from "@/types/listing";

interface Props {
  places: ListingNearbyPlace[];
}

const categoryLabels: Record<string, string> = {
  LAUNDRY: "Laundry",
  CONVENIENCE_STORE: "Convenience store",
  CAFE: "Café",
  WATER_REFILL: "Water refill",
  PRINTING_SHOP: "Printing shop",
  PHARMACY: "Pharmacy",
  ATM: "ATM",
  JEEPNEY_STOP: "Jeepney stop",
  CLINIC: "Clinic",
};

export function NearbyList({ places }: Props) {
  if (places.length === 0) return null;

  return (
    <ul className="divide-y divide-neutral-100">
      {places.map((place) => (
        <li key={`${place.category}-${place.name}`} className="flex items-center justify-between py-2.5">
          <div>
            <p className="text-sm font-medium text-neutral-900">{place.name}</p>
            <p className="text-xs text-neutral-500">{categoryLabels[place.category] ?? place.category}</p>
          </div>
          <span className="text-sm text-neutral-500">{place.walkMinutes} min walk</span>
        </li>
      ))}
    </ul>
  );
}
