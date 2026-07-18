"use client";

import { useState } from "react";
import { AMENITIES } from "@/config/amenities";
import { Pill } from "@/components/ui/Pill";
import { FilterSheet } from "@/components/discovery/FilterSheet";
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

// Large floating search bar plus filter controls — the hero of the home page.
export function SearchHero({ filters, onChange, resultCount }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const amenities = filters.amenities ?? [];

  const toggleAmenity = (key: string) =>
    onChange({
      amenities: amenities.includes(key) ? amenities.filter((a) => a !== key) : [...amenities, key],
    });

  // Active filter count for the mobile "Filters" button badge.
  const activeCount =
    (filters.availableOnly ? 1 : 0) + (filters.gender ? 1 : 0) + (filters.maxPrice ? 1 : 0) + amenities.length;

  return (
    <div className="space-y-4">
      {/* Search state */}
      <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-sm ring-1 ring-line transition-shadow duration-200 focus-within:shadow-md focus-within:ring-primary">
        <svg className="h-5 w-5 shrink-0 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={filters.query ?? ""}
          onChange={(event) => onChange({ query: event.target.value })}
          placeholder="Search by name or area near VSU…"
          className="w-full bg-transparent text-base text-ink outline-none placeholder:text-muted"
        />
        <span className="hidden shrink-0 text-sm text-muted sm:block">{resultCount} places</span>
      </div>

      {/* Desktop: all filters inline */}
      <div className="hidden flex-wrap items-center gap-2 sm:flex">
        <Pill
          label="Available now"
          active={filters.availableOnly ?? false}
          onClick={() => onChange({ availableOnly: !filters.availableOnly })}
        />
        {genders.map((gender) => (
          <Pill
            key={gender.value}
            label={gender.label}
            active={filters.gender === gender.value}
            onClick={() => onChange({ gender: filters.gender === gender.value ? undefined : gender.value })}
          />
        ))}
        <input
          type="number"
          min={0}
          value={filters.maxPrice ?? ""}
          onChange={(e) => onChange({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
          placeholder="Max ₱"
          className="w-24 rounded-full bg-white px-3.5 py-1.5 text-sm outline-none ring-1 ring-inset ring-line focus:ring-primary"
        />
        <span className="mx-1 w-px self-stretch bg-line" />
        {AMENITIES.map((amenity) => (
          <Pill
            key={amenity.key}
            label={amenity.label}
            active={amenities.includes(amenity.key)}
            onClick={() => toggleAmenity(amenity.key)}
          />
        ))}
      </div>

      {/* Mobile: one quick pill + a Filters button that opens the sheet */}
      <div className="flex items-center gap-2 sm:hidden">
        <Pill
          label="Available now"
          active={filters.availableOnly ?? false}
          onClick={() => onChange({ availableOnly: !filters.availableOnly })}
        />
        <button
          onClick={() => setSheetOpen(true)}
          className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-sm font-medium text-ink ring-1 ring-inset ring-line"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M3 6h18M6 12h12M10 18h4" strokeLinecap="round" />
          </svg>
          Filters
          {activeCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs text-white">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      <FilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        filters={filters}
        onChange={onChange}
        resultCount={resultCount}
      />
    </div>
  );
}
