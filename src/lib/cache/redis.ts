// Thin Upstash Redis wrapper for the read-through cache described in docs/CACHING.md.
// The data-access layer (lib/db/*) is the only place that calls `cached()`; nothing
// above it changes. When UPSTASH_REDIS_REST_URL is unset (local dev, or before the
// Vercel env vars are configured), `cached()` just runs the query — Phase 1 behavior
// is unaffected.

import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = url && token ? new Redis({ url, token }) : null;

// Prisma rows carry Date objects; JSON round-trips them to strings, which breaks any
// caller that expects `.toISOString()` on a cached row. Tag Dates on the way in and
// revive them on the way out so a cache hit is indistinguishable from a live query.
const DATE_TAG = "__date:";

function replacer(_key: string, value: unknown): unknown {
  return value instanceof Date ? `${DATE_TAG}${value.toISOString()}` : value;
}

function reviver(_key: string, value: unknown): unknown {
  return typeof value === "string" && value.startsWith(DATE_TAG) ? new Date(value.slice(DATE_TAG.length)) : value;
}

// Read-through cache: return the cached value if present, otherwise run `fn`, cache its
// result for `ttlSeconds`, and return it. A Redis failure of any kind (outage, bad
// credentials, quota) falls back to running `fn` directly — caching must never be able
// to take the site down.
export async function cached<T>(key: string, ttlSeconds: number, fn: () => Promise<T>): Promise<T> {
  if (!redis) return fn();

  try {
    const hit = await redis.get<string>(key);
    if (hit !== null && hit !== undefined) {
      return JSON.parse(hit, reviver) as T;
    }
  } catch {
    // Fall through to the live query below.
  }

  const value = await fn();

  try {
    await redis.set(key, JSON.stringify(value, replacer), { ex: ttlSeconds });
  } catch {
    // Caching is best-effort; a failed write doesn't fail the read.
  }

  return value;
}

// Explicit invalidation for the write paths listed in docs/CACHING.md. Accepts any
// number of keys (including ones built from a variable, e.g. `listing:${slug}`) and
// silently no-ops when Redis isn't configured or unreachable.
export async function invalidate(...keys: string[]): Promise<void> {
  if (!redis || keys.length === 0) return;
  try {
    await redis.del(...keys);
  } catch {
    // Stale-until-TTL is an acceptable degradation; never throw from a cache delete.
  }
}
