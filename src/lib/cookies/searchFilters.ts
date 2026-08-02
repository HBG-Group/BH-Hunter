"use client";

// Remembers the student's last search filters so they don't reconfigure them
// every visit. Gated on optional-cookie consent; user can clear explicitly.

import { hasOptionalConsent } from "@/lib/cookies/consent";
import { readJsonCookie, removeCookie, writeJsonCookie } from "@/lib/cookies/cookie";
import { listingFiltersSchema, type ListingFilters } from "@/lib/validation/filters";

export const SEARCH_FILTERS_COOKIE = "meino_search_filters";

const THIRTY_DAYS = 60 * 60 * 24 * 30;

// Cookie values are client-editable, so re-validate through the same Zod
// schema used for server input before trusting the shape into app state.
export function getRememberedFilters(): ListingFilters | null {
  const raw = readJsonCookie<unknown>(SEARCH_FILTERS_COOKIE);
  if (!raw) return null;
  const parsed = listingFiltersSchema.partial().safeParse(raw);
  if (!parsed.success) return null;
  // Belt and suspenders: query is never persisted, even if a tampered cookie has one.
  const rest = { ...parsed.data };
  delete rest.query;
  return rest;
}

export function rememberFilters(filters: ListingFilters): void {
  if (!hasOptionalConsent()) return;
  // Free-text search is intentionally not remembered — only the reusable filters.
  const persistable = { ...filters };
  delete persistable.query;
  writeJsonCookie(SEARCH_FILTERS_COOKIE, persistable, { maxAgeSeconds: THIRTY_DAYS });
}

export function clearRememberedFilters(): void {
  removeCookie(SEARCH_FILTERS_COOKIE);
}
