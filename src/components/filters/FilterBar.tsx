"use client";

import { AMENITIES } from "@/config/amenities";
import { AmenityToggle } from "@/components/filters/AmenityToggle";
import type { ListingFilters } from "@/lib/validation/filters";
import type { GenderPolicy } from "@/types/domain";

interface Props {
  filters: ListingFilters;
  onChange: (patch: Partial<ListingFilters>) => void;
  resultCount: number;
}

const genders: { value: GenderPolicy; label: string }[] = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "MIXED", label: "Mixed" },
];

// The floating glass search/filter panel that sits above the results.
export function FilterBar({ filters, onChange, resultCount }: Props) {
  const toggleAmenity = (key: string) => {
    const current = filters.amenities ?? [];
    const next = current.includes(key)
      ? current.filter((amenity) => amenity !== key)
      : [...current, key];
    onChange({ amenities: next });
  };

  return (
    <div className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm backdrop-blur-md">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          value={filters.query ?? ""}
          onChange={(event) => onChange({ query: event.target.value })}
          placeholder="Search by name or area…"
          className="flex-1 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-sm outline-none focus:border-neutral-400"
        />

        <input
          type="number"
          min={0}
          value={filters.maxPrice ?? ""}
          onChange={(event) =>
            onChange({ maxPrice: event.target.value ? Number(event.target.value) : undefined })
          }
          placeholder="Max ₱/mo"
          className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-sm outline-none focus:border-neutral-400 sm:w-32"
        />

        <label className="flex items-center gap-2 text-sm text-neutral-600">
          <input
            type="checkbox"
            checked={filters.availableOnly ?? false}
            onChange={(event) => onChange({ availableOnly: event.target.checked })}
            className="h-4 w-4 rounded border-neutral-300"
          />
          Available only
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {genders.map((gender) => (
          <AmenityToggle
            key={gender.value}
            label={gender.label}
            active={filters.gender === gender.value}
            onToggle={() =>
              onChange({ gender: filters.gender === gender.value ? undefined : gender.value })
            }
          />
        ))}
        <span className="mx-1 h-4 w-px bg-neutral-200" />
        {AMENITIES.map((amenity) => (
          <AmenityToggle
            key={amenity.key}
            label={amenity.label}
            active={(filters.amenities ?? []).includes(amenity.key)}
            onToggle={() => toggleAmenity(amenity.key)}
          />
        ))}
      </div>

      <p className="mt-3 text-xs text-neutral-500">
        {resultCount} boarding house{resultCount === 1 ? "" : "s"} shown
      </p>
    </div>
  );
}
