"use client";

// Centralized client-side cookie primitives. Only ever used for lightweight
// preference data — never for anything sensitive (see SECURITY.md). Supabase
// Auth manages its own session cookies through @supabase/ssr; this module
// never touches those.

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

// Browsers cap a single cookie at ~4096 bytes including name+attributes; stay
// well under that so we never silently get truncated or rejected by the browser.
const MAX_COOKIE_VALUE_LENGTH = 3800;

interface CookieOptions {
  /** Seconds until expiry. Omit for a session cookie. */
  maxAgeSeconds?: number;
  path?: string;
  sameSite?: "Lax" | "Strict";
}

export function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${escapeName(name)}=([^;]*)`));
  if (!match) return null;
  // Cookie values are attacker/user-editable (devtools, prior bugs, stale format).
  // decodeURIComponent throws on malformed input — never let that crash the caller.
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

export function writeCookie(name: string, value: string, options: CookieOptions = {}): void {
  if (typeof document === "undefined") return;
  const { maxAgeSeconds = ONE_YEAR_SECONDS, path = "/", sameSite = "Lax" } = options;
  const encoded = encodeURIComponent(value);
  if (encoded.length > MAX_COOKIE_VALUE_LENGTH) return;
  const secure = typeof location !== "undefined" && location.protocol === "https:" ? "; Secure" : "";
  document.cookie =
    `${name}=${encoded}; Max-Age=${maxAgeSeconds}; Path=${path}; SameSite=${sameSite}${secure}`;
}

export function removeCookie(name: string, path = "/"): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; Max-Age=0; Path=${path}; SameSite=Lax`;
}

export function readJsonCookie<T>(name: string): T | null {
  const raw = readCookie(name);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeJsonCookie<T>(name: string, value: T, options?: CookieOptions): void {
  writeCookie(name, JSON.stringify(value), options);
}

function escapeName(name: string): string {
  return name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
