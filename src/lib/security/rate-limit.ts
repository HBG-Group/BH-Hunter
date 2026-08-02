import "server-only";
import { headers } from "next/headers";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

// Fixed-window limiter stored in Postgres so every Vercel instance shares the same
// counter. The SQL upsert increments atomically and resets an expired window.

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
  report: { max: 10, windowMs: 300_000 },
} as const satisfies Record<string, Limit>;

export async function checkLimit(key: string, limit: Limit): Promise<boolean> {
  const now = Date.now();
  const resetAt = new Date(now + limit.windowMs);
  const result = await prisma.$queryRaw<{ allowed: boolean }[]>(Prisma.sql`
    INSERT INTO rate_limit_windows ("key", "count", reset_at)
    VALUES (${key}, 1, ${resetAt})
    ON CONFLICT ("key") DO UPDATE
    SET
      "count" = CASE
        WHEN rate_limit_windows.reset_at <= NOW() THEN 1
        ELSE rate_limit_windows."count" + 1
      END,
      reset_at = CASE
        WHEN rate_limit_windows.reset_at <= NOW() THEN EXCLUDED.reset_at
        ELSE rate_limit_windows.reset_at
      END
    RETURNING "count" <= ${limit.max} AS allowed
  `);
  return result[0]?.allowed === true;
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
