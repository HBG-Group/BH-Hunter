import { AMENITIES } from "@/config/amenities";

const labelByKey = new Map(AMENITIES.map((amenity) => [amenity.key, amenity.label]));

interface Props {
  amenityKeys: string[];
  limit?: number;
}

// A compact row of amenity tags, optionally capped with a "+N more".
export function AmenityChips({ amenityKeys, limit }: Props) {
  const shown = limit ? amenityKeys.slice(0, limit) : amenityKeys;
  const hidden = limit ? amenityKeys.length - shown.length : 0;

  return (
    <div className="flex flex-wrap gap-1.5">
      {shown.map((key) => (
        <span
          key={key}
          className="rounded-md bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600"
        >
          {labelByKey.get(key) ?? key}
        </span>
      ))}
      {hidden > 0 && (
        <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
          +{hidden} more
        </span>
      )}
    </div>
  );
}
