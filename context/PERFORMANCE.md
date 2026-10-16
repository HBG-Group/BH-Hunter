# Performance — Meino

Current performance work and the plan. The guiding principle (see `VISION.md`): perceived
speed on the phones and slow connections VSU students actually use.

## Current (implemented)

### Request dedup & fewer round trips
- `getCurrentUser` / `ensureProfileForCurrentUser` (`lib/auth/profile.ts`) are wrapped in
  React's `cache()` so the Supabase Auth + Prisma profile lookup runs once per request no
  matter how many components call `getCurrentProfile()`/`requireAdmin()`/etc — previously
  every page paid for it at least twice (page + `SiteHeader`; worse on `/admin/*`, where
  the layout and every page each looked it up independently).
- Homepage and listing-detail pages run their DB query and session lookup in parallel via
  `Promise.all` instead of awaiting one before starting the other.
- `resilientRead`'s default per-attempt timeout is 3s (was 5s), so a slow dependency falls
  back to the error UI in at most 6s instead of 10s.

### Lazy loading
- The Leaflet map is a `dynamic(() => …, { ssr: false })` import — it touches `window`,
  and it's heavy, so it's never server-rendered and loads only client-side with a
  skeleton fallback.
- `next/image` lazy-loads images by default (off-screen photos don't block first paint).

### Image optimization
- `next.config.ts` enables **AVIF and WebP**; Next negotiates the best format per browser
  and falls back automatically. Listing and ad images serve through `/_next/image`.
- Uploads are capped at 5 MB and served from Supabase Storage (in `remotePatterns`).
- Root layout preconnects/dns-prefetches the Supabase Storage origin so the first photo
  request doesn't pay DNS+TLS setup cost.
- The first 4 cards in the homepage grid (`ListingGrid.tsx`) render their image with
  `priority`/eager loading — they're above the fold, so treating them as lazy just delays
  first paint for no benefit.

### Skeleton loading
- Reusable primitives in `components/ui/Skeleton.tsx` (`Skeleton`,
  `ListingCardSkeleton`, `ListingGridSkeleton`).
- `loading.tsx` files for `/` (homepage), `/listings/[slug]`, `/account`, and `/owner`
  show a layout-matched skeleton instead of a blank pause during navigation.

### Pagination ("Load more")
- The homepage grid renders **20 cards at a time** with a "Load more" button; paging
  resets when filters/sort change. The **map still receives every listing**, so no pins
  are lost — this trims DOM/render cost without breaking discovery. (Addresses audit M3.)

### Optimistic UI
- Favorites toggle immediately and reconcile to the server's returned truth; repeat
  clicks are ignored while a toggle is in flight.
- A global route-progress bar and page-transition fade give immediate navigation feedback.

### Query hygiene
- Reads happen once in `lib/db` with the relations needed (no N+1); services shape them
  into lean view-models. Ancillary reads (ads) are wrapped so a failure can't break the
  page.

### Redis / Upstash Redis — caching (implemented 2026-08-03)
`src/lib/cache/redis.ts` — a read-through `cached(key, ttlSeconds, fn)` helper wrapping
the read functions below. No-op (runs `fn` directly) when `UPSTASH_REDIS_REST_URL` /
`UPSTASH_REDIS_REST_TOKEN` aren't set, so local dev and any deploy before those are
configured in Vercel are unaffected. A Redis failure at read or write time falls back to
the live query rather than erroring. Full detail and invalidation rules in `docs/CACHING.md`.

| Data | Source fn | TTL |
|---|---|---|
| Homepage listings (also the map's marker set) | `findPublishedBoardingHouses` | 5 min |
| Listing detail | `findBoardingHouseBySlug` | 10 min |
| Reviews | `findReviews` | 10 min |
| Platform statistics | `getPlatformStats` | 15 min |
| Owner dashboard metrics | `getOwnerAnalytics` | 5 min |

Invalidated explicitly on writes (next to the existing `revalidatePath()` calls): listing
create/update/status (`lib/owner/actions.ts`), admin verify/publish/feature/delete
(`lib/admin/actions.ts`), review submit/delete (`lib/student/review-actions.ts`).
Platform stats has no invalidation rule by design — allowed to lag by its TTL.

## Future (planned)

### Caching strategy & CDN
- Static assets and images already benefit from Vercel's CDN + Next image cache.
- Consider `stale-while-revalidate` semantics for the homepage once Redis is in.

### Better image compression
- Evaluate generating thumbnails on upload and serving smaller derivatives for cards vs
  the full image for the detail gallery.

### Prefetching
- Prefetch listing detail data on card hover/focus for instant navigation.

### Infinite scrolling
- Optionally upgrade "Load more" to intersection-observer infinite scroll, keeping the
  map-gets-everything model and smooth animation.

### Shared rate-limit store
- The in-memory rate limiter becomes a Redis-backed one at the same time (see
  `SECURITY.md`), making limits global across serverless instances.
