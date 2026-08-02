"use client";

// Single place that knows about every optional cookie this app sets, so the
// consent-reject and manage-preferences flows can't drift out of sync with
// each other as new cookie types are added.

import { removeCookie } from "@/lib/cookies/cookie";
import { clearAllPreferences } from "@/lib/cookies/preferences";
import { SEARCH_FILTERS_COOKIE } from "@/lib/cookies/searchFilters";
import { RECENT_LISTINGS_COOKIE } from "@/lib/cookies/recentListings";
import { DISMISSED_NOTICES_COOKIE } from "@/lib/cookies/dismissed";

export function clearAllOptionalCookies(): void {
  clearAllPreferences();
  removeCookie(SEARCH_FILTERS_COOKIE);
  removeCookie(RECENT_LISTINGS_COOKIE);
  removeCookie(DISMISSED_NOTICES_COOKIE);
}
