"use client";

// Cookie consent — gates every non-essential cookie in this module. The consent
// decision itself is essential (it must persist so the banner doesn't reappear).
//
// Two layers: CONSENT_COOKIE records that *a* decision was made (so the banner
// doesn't reappear) plus a coarse accepted/rejected/custom label. CATEGORIES_COOKIE
// holds the granular per-category choice used by "Customize". Accept All and Reject
// Non-Essential are just shortcuts that set both categories at once.

import { readCookie, readJsonCookie, removeCookie, writeCookie, writeJsonCookie } from "@/lib/cookies/cookie";

export const CONSENT_COOKIE = "meino_cookie_consent";
export const CATEGORIES_COOKIE = "meino_cookie_categories";

export type ConsentStatus = "accepted" | "rejected" | "custom";

// preferences: theme, sidebar, language, map style (UI comfort settings).
// activity: search filters, recently viewed, dismissed notices (usage memory).
export type ConsentCategory = "preferences" | "activity";

export interface ConsentCategories {
  preferences: boolean;
  activity: boolean;
}

const DEFAULT_CATEGORIES: ConsentCategories = { preferences: false, activity: false };

export function getConsent(): ConsentStatus | null {
  const raw = readCookie(CONSENT_COOKIE);
  return raw === "accepted" || raw === "rejected" || raw === "custom" ? raw : null;
}

export function getConsentCategories(): ConsentCategories {
  const raw = readJsonCookie<Partial<ConsentCategories>>(CATEGORIES_COOKIE);
  return {
    preferences: raw?.preferences === true,
    activity: raw?.activity === true,
  };
}

function persistCategories(categories: ConsentCategories): void {
  writeJsonCookie(CATEGORIES_COOKIE, categories, { maxAgeSeconds: 60 * 60 * 24 * 365 });
}

export function setConsent(status: "accepted" | "rejected"): void {
  writeCookie(CONSENT_COOKIE, status, { maxAgeSeconds: 60 * 60 * 24 * 365 });
  persistCategories(
    status === "accepted" ? { preferences: true, activity: true } : DEFAULT_CATEGORIES,
  );
}

/** "Customize": an explicit per-category choice, distinct from Accept All / Reject All. */
export function setCustomConsent(categories: ConsentCategories): void {
  writeCookie(CONSENT_COOKIE, "custom", { maxAgeSeconds: 60 * 60 * 24 * 365 });
  persistCategories(categories);
}

/** Clears the decision so the consent banner reappears — lets a visitor change their mind. */
export function resetConsent(): void {
  removeCookie(CONSENT_COOKIE);
  removeCookie(CATEGORIES_COOKIE);
}

/** True once any decision has been made (accept, reject, or customize). */
export function hasOptionalConsent(): boolean {
  return getConsent() !== null;
}

export function hasCategoryConsent(category: ConsentCategory): boolean {
  return getConsentCategories()[category];
}
