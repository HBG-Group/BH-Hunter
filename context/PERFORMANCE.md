# Performance — Meino

Current performance work and the plan. The guiding principle (see `VISION.md`): perceived
speed on the phones and slow connections VSU students actually use.

## Current (implemented)

### Lazy loading
- The Leaflet map is a `dynamic(() => …, { ssr: false })` import — it touches `window`,
  and it's heavy, so it's never server-rendered and loads only client-side with a
  skeleton fallback.
- `next/image` lazy-loads images by default (off-screen photos don't block first paint).

### Image optimization
- `next.config.ts` enables **AVIF and WebP**; Next negotiates the best format per browser
  and falls back automatically. Listing and ad images serve through `/_next/image`.
- Uploads are capped at 5 MB and served from Supabase Storage (in `remotePatterns`).

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

## Future (planned)

### Redis / Upstash Redis — caching
Detailed plan in `docs/CACHING.md`. Because all reads funnel through `lib/db`, caching
wraps those functions with no change to the UI layer. A `cached(key, ttl, fn)` helper with
a no-op fallback when the env var is unset keeps local dev unaffected.

Recommended cache targets and TTLs:

| Data | TTL |
|---|---|
| Homepage listings | 5 min |
| Listing details | 10 min |
| Reviews | 10 min |
| Map markers | 5 min |
| Platform statistics | 15 min |
| Owner dashboard metrics | 5 min |

Invalidation is explicit on writes, placed next to the existing `revalidatePath()` calls
(listing create/update/status, review add/delete, admin verify/publish/feature/delete).

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
