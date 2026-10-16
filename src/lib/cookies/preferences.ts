"use client";

// UI preference cookies: theme, sidebar collapse, language, map style.
// All gated on optional-cookie consent — if the visitor rejected non-essential
// cookies, these silently no-op (app falls back to in-memory defaults).

import { hasCategoryConsent } from "@/lib/cookies/consent";
import { readCookie, removeCookie, writeCookie } from "@/lib/cookies/cookie";

const YEAR = 60 * 60 * 24 * 365;

export type Theme = "light" | "dark" | "system";
export const THEME_COOKIE = "meino_theme";

export function getTheme(): Theme {
  const raw = readCookie(THEME_COOKIE);
  return raw === "light" || raw === "dark" || raw === "system" ? raw : "system";
}

export function setTheme(theme: Theme): void {
  if (!hasCategoryConsent("preferences")) return;
  writeCookie(THEME_COOKIE, theme, { maxAgeSeconds: YEAR });
}

export const SIDEBAR_COOKIE = "meino_sidebar_collapsed";

export function getSidebarCollapsed(): boolean {
  return readCookie(SIDEBAR_COOKIE) === "1";
}

export function setSidebarCollapsed(collapsed: boolean): void {
  if (!hasCategoryConsent("preferences")) return;
  writeCookie(SIDEBAR_COOKIE, collapsed ? "1" : "0", { maxAgeSeconds: YEAR });
}

// Short allowlist token — good enough for BCP-47-style language tags ("en",
// "fil") and short style keys, and cheap insurance against a tampered cookie
// later reaching a URL/class-name/lookup key unvalidated once this is wired up.
const TOKEN_PATTERN = /^[a-zA-Z0-9_-]{1,20}$/;

// Future-ready: not wired into UI yet, but the storage contract is ready.
export const LANGUAGE_COOKIE = "meino_language";

export function getLanguage(): string | null {
  const raw = readCookie(LANGUAGE_COOKIE);
  return raw && TOKEN_PATTERN.test(raw) ? raw : null;
}

export function setLanguage(language: string): void {
  if (!hasCategoryConsent("preferences") || !TOKEN_PATTERN.test(language)) return;
  writeCookie(LANGUAGE_COOKIE, language, { maxAgeSeconds: YEAR });
}

export const MAP_STYLE_COOKIE = "meino_map_style";

export function getMapStyle(): string | null {
  const raw = readCookie(MAP_STYLE_COOKIE);
  return raw && TOKEN_PATTERN.test(raw) ? raw : null;
}

export function setMapStyle(style: string): void {
  if (!hasCategoryConsent("preferences") || !TOKEN_PATTERN.test(style)) return;
  writeCookie(MAP_STYLE_COOKIE, style, { maxAgeSeconds: YEAR });
}

export function clearAllPreferences(): void {
  removeCookie(THEME_COOKIE);
  removeCookie(SIDEBAR_COOKIE);
  removeCookie(LANGUAGE_COOKIE);
  removeCookie(MAP_STYLE_COOKIE);
}
