import "server-only";
import { headers } from "next/headers";

// Fixed-window rate limiter. This is a per-instance in-memory counter: on serverless
// it limits per warm instance, not globally, so treat it as abuse dampening rather
// than a hard guarantee. Swap the store for Redis if traffic ever justifies it.

interface Window {
  count: number;
  resetAt: number;
}

const windows = new Map<string, Window>();
let lastSweep = Date.now();

// Drop expired windows occasionally so the map can't grow without bound.
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, window] of windows) {
    if (window.resetAt <= now) windows.delete(key);
  }
}

export interface Limit {
  /** Requests allowed per window. */
  max: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

export const LIMITS = {
  auth: { max: 8, windowMs: 60_000 },
  write: { max: 20, windowMs: 60_000 },
  review: { max: 5, windowMs: 60_000 },
  viewing: { max: 5, windowMs: 300_000 },
  favorite: { max: 60, windowMs: 60_000 },
  analytics: { max: 40, windowMs: 60_000 },
  upload: { max: 30, windowMs: 300_000 },
} as const satisfies Record<string, Limit>;

export function checkLimit(key: string, limit: Limit): boolean {
  const now = Date.now();
  sweep(now);

  const existing = windows.get(key);
  if (!existing || existing.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + limit.windowMs });
    return true;
  }
  if (existing.count >= limit.max) return false;

  existing.count += 1;
  return true;
}

// Best-effort client identity for anonymous actions.
export async function clientKey(): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || headerList.get("x-real-ip") || "unknown";
  return `ip:${ip}`;
}

export const RATE_LIMITED = "Too many requests. Please wait a moment and try again.";

/** Throws nothing — returns false when the caller should stop. */
export async function allow(action: string, limit: Limit, identity?: string): Promise<boolean> {
  const who = identity ?? (await clientKey());
  return checkLimit(`${action}:${who}`, limit);
}
