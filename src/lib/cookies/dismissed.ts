"use client";

// Tracks which dismissible notices (beta banner, pricing announcement, update
// notices) a visitor has already closed, so they don't reappear every visit.

import { hasOptionalConsent } from "@/lib/cookies/consent";
import { readJsonCookie, writeJsonCookie } from "@/lib/cookies/cookie";

export const DISMISSED_NOTICES_COOKIE = "meino_dismissed_notices";
const SIX_MONTHS = 60 * 60 * 24 * 182;
// Sanity cap — we only ever call dismissNotice with a handful of known notice
// ids, so a list past this size can only mean a tampered/corrupt cookie.
const MAX_ENTRIES = 50;

function readDismissed(): string[] {
  const raw = readJsonCookie<unknown>(DISMISSED_NOTICES_COOKIE);
  if (!Array.isArray(raw)) return [];
  return raw.filter((id): id is string => typeof id === "string").slice(0, MAX_ENTRIES);
}

export function isNoticeDismissed(noticeId: string): boolean {
  return readDismissed().includes(noticeId);
}

export function dismissNotice(noticeId: string): void {
  if (!hasOptionalConsent()) return;
  const dismissed = readDismissed();
  if (dismissed.includes(noticeId)) return;
  writeJsonCookie(DISMISSED_NOTICES_COOKIE, [...dismissed, noticeId].slice(-MAX_ENTRIES), {
    maxAgeSeconds: SIX_MONTHS,
  });
}
