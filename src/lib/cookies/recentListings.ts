"use client";

// Guest-side "recently viewed" trail: only listing IDs, capped at 10, oldest
// dropped first. This is separate from the DB-backed RecentlyViewed table used
// for signed-in students (lib/student) — this one works without an account.

import { hasCategoryConsent } from "@/lib/cookies/consent";
import { readJsonCookie, removeCookie, writeJsonCookie } from "@/lib/cookies/cookie";

export const RECENT_LISTINGS_COOKIE = "meino_recent_listings";
const MAX_ENTRIES = 10;
const NINETY_DAYS = 60 * 60 * 24 * 90;

// Cookie values are client-editable — never trust the shape without checking.
// Non-strings are dropped and the list is re-capped, so a tampered cookie can
// only ever hand back a bounded array of strings.
export function getRecentListingIds(): string[] {
  const raw = readJsonCookie<unknown>(RECENT_LISTINGS_COOKIE);
  if (!Array.isArray(raw)) return [];
  return raw.filter((id): id is string => typeof id === "string").slice(0, MAX_ENTRIES);
}

export function recordRecentListing(listingId: string): void {
  if (!hasCategoryConsent("activity")) return;
  const current = getRecentListingIds().filter((id) => id !== listingId);
  const next = [listingId, ...current].slice(0, MAX_ENTRIES);
  writeJsonCookie(RECENT_LISTINGS_COOKIE, next, { maxAgeSeconds: NINETY_DAYS });
}

export function clearRecentListings(): void {
  removeCookie(RECENT_LISTINGS_COOKIE);
}
