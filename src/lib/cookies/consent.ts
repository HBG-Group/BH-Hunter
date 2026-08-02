"use client";

// Cookie consent — gates every non-essential cookie in this module. The consent
// decision itself is essential (it must persist so the banner doesn't reappear).

import { readCookie, removeCookie, writeCookie } from "@/lib/cookies/cookie";

export const CONSENT_COOKIE = "meino_cookie_consent";

export type ConsentStatus = "accepted" | "rejected";

export function getConsent(): ConsentStatus | null {
  const raw = readCookie(CONSENT_COOKIE);
  return raw === "accepted" || raw === "rejected" ? raw : null;
}

export function setConsent(status: ConsentStatus): void {
  writeCookie(CONSENT_COOKIE, status, { maxAgeSeconds: 60 * 60 * 24 * 365 });
}

/** Clears the decision so the consent banner reappears — lets a visitor change their mind. */
export function resetConsent(): void {
  removeCookie(CONSENT_COOKIE);
}

/** Non-essential cookies (preferences, filters, recent listings, notices) all check this. */
export function hasOptionalConsent(): boolean {
  return getConsent() === "accepted";
}
