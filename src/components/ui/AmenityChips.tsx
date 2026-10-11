import { AMENITIES } from "@/config/amenities";

const labelByKey = new Map(AMENITIES.map((amenity) => [amenity.key, amenity.label]));

interface Props {
  amenityKeys: string[];
  limit?: number;
  variant?: "compact" | "detail";
}

// A compact row of amenity tags, optionally capped with a "+N more".
export function AmenityChips({ amenityKeys, limit, variant = "compact" }: Props) {
  const shown = limit ? amenityKeys.slice(0, limit) : amenityKeys;
  const hidden = limit ? amenityKeys.length - shown.length : 0;
  const isDetail = variant === "detail";

  return (
    <div className={isDetail ? "grid grid-cols-2 gap-3 sm:grid-cols-3" : "flex flex-wrap gap-1.5"}>
      {shown.map((key) => (
        <span
          key={key}
          className={isDetail
            ? "flex min-h-14 items-center justify-center rounded-2xl border border-line bg-white px-3 py-3 text-center text-sm font-medium text-ink shadow-sm"
            : "rounded-md bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600"}
        >
          {labelByKey.get(key) ?? key}
        </span>
      ))}
      {hidden > 0 && (
        <span className={isDetail
          ? "flex min-h-14 items-center justify-center rounded-2xl border border-dashed border-line bg-neutral-50 px-3 py-3 text-center text-sm text-muted"
          : "rounded-md bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500"}
        >
          +{hidden} more
        </span>
      )}
    </div>
  );
}
