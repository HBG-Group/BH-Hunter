# Meino — Caching Strategy (Redis / Upstash)

**Implemented** (2026-08-03) as planned below — `src/lib/cache/redis.ts`, wired into the
six read functions in the table, with invalidation next to the `revalidatePath()` calls
that already existed. Requires `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` in
Vercel to actually cache anything — unset (e.g. local dev), `cached()` is a pass-through
and every read hits Postgres exactly as before.

## Why Redis, and why not yet

Every public read currently hits Postgres through Prisma. At VSU's scale that's fine.
Redis becomes worth it once the homepage and listing pages are read far more often than
they change. Upstash is the natural fit on Vercel: HTTP-based, serverless, no connection
pool to manage.

## Where it plugs in

The data-access layer (`src/lib/db/*`) is the single choke point for reads — components
and services never touch Prisma directly. So caching wraps those functions and nothing
above them changes:

```
service / page  →  lib/db/<x>  →  [ cache lookup → Prisma on miss ]  →  Postgres
```

A thin `src/lib/cache/redis.ts` helper (`cached(key, ttl, () => query())`) is all the
surface area needed. If `UPSTASH_REDIS_REST_URL` is unset, `cached()` just runs the
query — so local dev and Phase 1 are unaffected.

## What to cache

| Data | Source fn | Key | TTL |
|---|---|---|---|
| Homepage listings | `findPublishedBoardingHouses` | `listings:published` | 5 min |
| Listing detail | `findBoardingHouseBySlug` | `listing:{slug}` | 10 min |
| Reviews | `findReviews` | `reviews:{listingId}` | 10 min |
| Map markers | (derived from published listings) | `map:markers` | 5 min |
| Platform stats | `getPlatformStats` | `stats:platform` | 15 min |
| Owner metrics | `getOwnerAnalytics` | `metrics:owner:{ownerId}` | 5 min |

## Invalidation rules

TTL handles freshness cheaply; explicit deletes handle correctness on writes:

- Listing created / updated / status changed → delete `listings:published`, `map:markers`,
  `listing:{slug}`, and `metrics:owner:{ownerId}`.
- Review added / deleted → delete `reviews:{listingId}` and `listing:{slug}`.
- Admin verify / publish → delete `listings:published`, `map:markers`, `listing:{slug}`.
- Favorite / view / contact events → **no invalidation**; these only affect metrics,
  which are allowed to lag by their TTL.

The server actions already call `revalidatePath()` at exactly these points, so the cache
deletes go right beside those calls — one obvious place per event.

## Rollout

1. ~~Add `@upstash/redis`, set `UPSTASH_REDIS_REST_URL` / `..._TOKEN` in Vercel.~~ Done
   (2026-08-03) — package added, env vars set in Vercel. Confirm the next deploy actually
   picks them up (env var changes need a redeploy).
2. ~~Add `lib/cache/redis.ts` with a no-op fallback when env is missing.~~ Done — also
   handles Date round-tripping (Prisma rows carry `Date` objects; a plain JSON round-trip
   would turn them into strings and break every caller expecting `.toISOString()`).
3. ~~Wrap read functions in the table above, one at a time, measuring each.~~ Done for all
   six. ("Map markers" isn't a separate query — the homepage passes the same
   `findPublishedBoardingHouses()` result to the client map, so it's covered for free.)
4. ~~Add the matching deletes next to the existing `revalidatePath()` calls.~~ Done —
   `lib/owner/actions.ts` (create/update/status), `lib/admin/actions.ts` (verify/publish/
   feature/delete), `lib/student/review-actions.ts` (submit/delete review). A Redis
   failure of any kind (outage, bad token) falls back to the live query — caching can
   never take the site down. `getPlatformStats` has no invalidation rule by design; it's
   allowed to lag by its 15 min TTL like the doc always said.

Still open: reuse the same Upstash instance for the distributed rate limiter noted in
`docs/SECURITY.md` (the current limiter is per-instance memory) — not done in this pass.
