"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AMENITIES } from "@/config/amenities";
import { Pill } from "@/components/ui/Pill";
import type { ListingFilters } from "@/lib/validation/filters";
import type { GenderPolicy } from "@/types/domain";

interface Props {
  open: boolean;
  onClose: () => void;
  filters: ListingFilters;
  onChange: (patch: Partial<ListingFilters>) => void;
  resultCount: number;
}

const genders: { value: GenderPolicy; label: string }[] = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "MIXED", label: "Mixed" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

// Mobile filter bottom sheet — thumb-reachable, categorized, and scalable.
export function FilterSheet({ open, onClose, filters, onChange, resultCount }: Props) {
  const amenities = filters.amenities ?? [];

  // Close on Escape and lock background scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const toggleAmenity = (key: string) =>
    onChange({
      amenities: amenities.includes(key) ? amenities.filter((a) => a !== key) : [...amenities, key],
    });

  const clearAll = () =>
    onChange({ availableOnly: undefined, gender: undefined, maxPrice: undefined, amenities: [] });

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[1500] sm:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/30"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-5 pb-8"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" />
            <div className="space-y-5">
              <Section title="Availability">
                <Pill
                  label="Available now"
                  active={filters.availableOnly ?? false}
                  onClick={() => onChange({ availableOnly: !filters.availableOnly })}
                />
              </Section>

              <Section title="Gender">
                {genders.map((g) => (
                  <Pill
                    key={g.value}
                    label={g.label}
                    active={filters.gender === g.value}
                    onClick={() => onChange({ gender: filters.gender === g.value ? undefined : g.value })}
                  />
                ))}
              </Section>

              <Section title="Budget">
                <input
                  type="number"
                  min={0}
                  value={filters.maxPrice ?? ""}
                  onChange={(e) => onChange({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="Max ₱ / month"
                  className="w-40 rounded-full bg-white px-4 py-2 text-sm outline-none ring-1 ring-inset ring-line focus:ring-primary"
                />
              </Section>

              <Section title="Amenities">
                {AMENITIES.map((a) => (
                  <Pill
                    key={a.key}
                    label={a.label}
                    active={amenities.includes(a.key)}
                    onClick={() => toggleAmenity(a.key)}
                  />
                ))}
              </Section>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button onClick={clearAll} className="text-sm font-medium text-muted hover:text-ink">
                Clear all
              </button>
              <button
                onClick={onClose}
                className="flex-1 rounded-xl bg-primary py-3 text-sm font-medium text-white hover:bg-primary-hover"
              >
                Show {resultCount} places
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
