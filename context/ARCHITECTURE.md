# Architecture — Meino

How authentication, database, storage, routing, uploads, and security fit together.

## Layered structure

The codebase is strictly layered. Each layer only talks to the one below it.

```
app/ (routes)  +  components/ (UI)      ← never import Prisma
        │
        ▼
hooks/                                   ← client state, upload orchestration
        │
        ▼
services/                                ← view-model shaping: availability,
        │                                  distance, sorting, filtering
        ▼
lib/db/*        (Prisma — the ONLY DB access)
lib/security/*  (redirect, url, upload-ticket, rate-limit, errors)
lib/storage/*   (Supabase Storage, service role)
lib/auth/*      (Supabase session, profile, guards)
```

**Rule:** `app/` and `components/` must never import Prisma. Raw rows are turned into UI
view-models in `services/` (e.g. `toListingCards`, `toListingDetail`). This keeps
components dumb and makes reads cacheable later.

## Authentication

Supabase Auth via `@supabase/ssr`. Our `Profile` table shares its primary key with the
Supabase `auth.users` id — one identity spine. A profile is created on first access
(`getCurrentProfile`), with an email fallback so a duplicate auth user can't crash login.

Clients:
- `lib/supabase/server.ts` — server components / actions, reads+writes the cookie session.
- `lib/supabase/client.ts` — browser (anon key only).
- `lib/supabase/admin.ts` — service-role client, `import "server-only"`, used only for
  Storage. Never reaches the browser.

### Student
Browses without login. Favorites, reviews, and viewing requests call `requireProfile`,
which redirects to `/login?next=<validated path>` when signed out.

### Owner
Signs up from "List your property". Every owner data-access function is scoped by
`ownerId`, so an owner can only read/write their own listings. Pages call `requireOwner`.
`proxy.ts` also redirects signed-out visitors away from `/owner` (defence in depth).

### Admin
Promoted manually via `npm run make-admin` (no public admin sign-up). The `/admin` area
guards itself: the layout calls `getCurrentProfile`, and if the visitor isn't an ADMIN it
renders an inline sign-in form instead of the dashboard — never a redirect, never a leak.
Each admin page also re-checks `getAdminOrNull`. The old hidden `/bh-control` route was
removed; the login lives at `/admin`.

### Redirects and canonical origin
Every user-influenceable redirect target passes `safeRedirectPath` (relative-path
allowlist). OAuth `redirectTo` and the confirmation-email link are built from a canonical
origin (`config/site.ts` → `NEXT_PUBLIC_SITE_URL`, else Vercel/forwarded host) so they
never resolve to localhost or an internal host.

## Database (Prisma + Supabase Postgres)

`prisma/schema.prisma` is the source of truth. Key models: `Profile`, `BoardingHouse`,
`Room`, `Image`, `Amenity` (+ join), `NearbyPlace`, `Review`, `Favorite`,
`ViewingRequest`, `AnalyticsEvent`, `Notification`, `NotificationPreference`,
`RecentlyViewed`, `Subscription` (scaffold), `Advertisement`.

- Availability is **derived** by counting rooms — vacancy can never contradict the rooms.
- Cascades: everything under a `BoardingHouse` is `onDelete: Cascade`, so an admin delete
  cleanly removes rooms/images/amenities/reviews/favorites/requests/analytics.
- Indexes on hot paths: `status`, `ownerId`, `featured` on listings; FK indexes on
  favorites/reviews/viewing-requests; `Image.url` is **unique** (upload replay guard).
- Prisma connects as the DB owner and **bypasses RLS**. RLS is still enabled deny-all on
  every table so the public anon key can't reach the data via the REST API.
- A single shared `PrismaClient` (`lib/db/prisma.ts`) survives dev reloads.
- DB project ref: `qcrkhrhqugdyyliaevzf`. Schema changes go through `db:push` (or a
  Supabase migration). **Adding a table requires enabling RLS on it** — `db:push` won't.

## Storage

One public bucket, `listing-photos` (`config/storage.ts`). Public-read so browsers show
photos without auth; writes only happen server-side via the service role. The bucket is
created/kept with `fileSizeLimit` (5 MB) and `allowedMimeTypes` (jpeg/png/webp) so
Supabase itself rejects a bad upload. Ad images live in the same bucket under an `ads/`
folder.

## Routing

Next.js App Router. Public: `/`, `/listings/[slug]`, `/about`, `/compare`, `/login`,
`/signup`, `/list-your-property`. Student: `/account`. Owner: `/owner`, `/owner/listings/*`,
`/owner/requests`. Admin: `/admin`, `/admin/listings`, `/admin/listings/[id]`,
`/admin/reviews`, `/admin/ads`. `proxy.ts` is Next 16's middleware (guards `/owner`,
refreshes the session). `loading.tsx` files give skeletons on `/`, listing detail,
account, and owner.

## Uploads and image flow

Two-step signed-ticket flow so large files never pass through the Next server, and no
client can forge or replay a path:

1. **Prepare** (`prepareUploadsAction` for listings, `prepareAdUploadsAction` for ads):
   verify auth/ownership, validate declared files, build a **server-chosen** path
   (extension from an allowlist), get a Supabase signed upload URL, and issue an
   **HMAC-signed ticket** binding the path to the owner/admin + scope + a 15-min expiry.
2. **Browser** uploads bytes directly to Storage via `uploadToSignedUrl`. The bucket
   enforces MIME + size on the PUT.
3. **Register / create** (`registerPhotosAction`, `createAdAction`): verify the ticket
   signature and binding, confirm the object exists, **re-inspect its real MIME and size**,
   discard anything invalid, then record the public URL. `Image.url` uniqueness blocks
   replay.

Listing photos require **≥5 real images** (verified against Storage in
`services/photo-requirements.ts`) before an owner can submit for review or an admin can
publish. Displayed via `next/image` (AVIF/WebP), lazy by default.

## Security flow (summary)

Request → `proxy.ts` (session refresh, `/owner` guard) → server component/action →
`requireX` guard + Zod validation + rate-limit → `lib/db` (owner-scoped `where`) →
Postgres. Errors pass through `guarded`/`reportError`, so the client only ever sees a
generic message + reference; internals are logged server-side. Full detail in
`SECURITY.md`.
