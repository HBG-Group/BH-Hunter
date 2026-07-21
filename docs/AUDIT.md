# Meino — Final Engineering Audit

Pre-production audit of the whole repository: structure, security, database, Supabase,
server actions, forms, uploads, performance, accessibility, dependencies, deployment.

Scope: 152 source files, ~7,250 lines. Verified against the actual code, not assumed.
Baseline: `npx tsc --noEmit` clean, `npx eslint src` clean, `npm run build` succeeds.

---

## CRITICAL

### C1 — Open redirect in `signInAction`

**Description.** The sign-in form carries a hidden `next` field populated from the
`?next=` query string. The action passes it straight to `redirect(next)` without
checking that it is a relative path.

**Risk.** `/login?next=https://evil-vsu-bh.com` renders a legitimate Meino login
page and, on successful sign-in, drops the student on an attacker's site. This is the
classic credential-phishing chain: the victim sees the real domain, signs in for real,
and lands on a cloned page asking them to "sign in again". Also usable to bounce users
to malware.

**Root cause.** User-controlled input flows into a redirect target with no allowlist.

**Files.** `src/lib/auth/actions.ts:19,27` — also reachable via
`src/app/login/page.tsx`, `src/components/auth/AuthForm.tsx:29`, `src/proxy.ts:35`.

**Recommended solution.** Reject anything that is not a same-site relative path:
accept only values matching `^/(?!/)` (leading slash, not `//`), otherwise fall back to
the role-based default. Apply the same guard in `src/app/auth/callback/route.ts:10`,
which concatenates `origin + next`.

**Complexity.** Low — one helper, two call sites. **Regression risk.** Very low.

---

### C2 — Signed upload URLs are issued without server-enforced type or size limits

**Description.** `prepareUploadsAction` validates the *claimed* filename, MIME type and
byte size sent by the browser, then returns a signed Storage upload ticket. The browser
then PUTs the actual bytes directly to Supabase. Nothing re-checks the real file. The
bucket is created with `{ public: true }` and no `allowedMimeTypes` or `fileSizeLimit`.

**Risk.** Any authenticated owner can upload arbitrary content of arbitrary size to a
public bucket by lying in the metadata: a 500 MB file, an `.exe`, or an HTML/SVG file
that is then served from your Supabase domain. Storage-quota exhaustion is a cost
attack; hosting arbitrary HTML is a phishing/defacement vector on a domain associated
with your project.

**Root cause.** Validation happens on the untrusted description of the file, not on the
file, and the storage layer itself has no constraints to fall back on.

**Files.** `src/lib/owner/photo-actions.ts:32-62`, `src/lib/storage/photos.ts:10-14,26-42`,
`src/hooks/usePhotoUpload.ts`.

**Recommended solution.** Set the constraints where they cannot be bypassed — on the
bucket: `createBucket(PHOTO_BUCKET, { public: true, fileSizeLimit: 5 * 1024 * 1024,
allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"] })`. Supabase then rejects
the signed PUT itself. Note the bucket already exists, so it must be updated via
`updateBucket` or the dashboard, not just changed in code.

**Complexity.** Low in code, requires one dashboard/migration step.
**Regression risk.** Low — but confirm existing photos are all under the new limits.

---

### C3 — `registerPhotosAction` trusts client-supplied storage paths

**Description.** After uploading, the browser calls
`registerPhotosAction(boardingHouseId, paths)` with the object paths to record. The
action verifies the caller is *an* owner and that they own the listing, but never
verifies that the supplied paths are the ones it just issued tickets for, or that they
even belong to that listing's folder.

**Risk.** An owner can POST arbitrary strings as paths: register another listing's
photos as their own, register hundreds of `Image` rows without uploading anything (and
so satisfy the 5-photo publish gate with broken URLs), or point rows at any object in
the bucket. This is an IDOR that also defeats the photo-minimum business rule.

**Root cause.** The two-step upload split ownership checking from path provenance;
step 2 has no memory of what step 1 authorised.

**Files.** `src/lib/owner/photo-actions.ts:64-78`.

**Recommended solution.** Cheap fix: require every path to start with
`${boardingHouseId}/` and to resolve to an object that actually exists
(`storage.from(bucket).list(boardingHouseId)` or a `HEAD`). Stronger fix: sign the
issued paths into a short-lived HMAC token returned by step 1 and verify it in step 2.

**Complexity.** Low (prefix + existence check) to Medium (signed tokens).
**Regression risk.** Low.

---

### C4 — Stored XSS via `messengerUrl` (unvalidated URL scheme)

**Description.** `listingSchema.messengerUrl` uses Zod's `.url()`, which accepts *any*
scheme. Verified locally: `javascript:alert(1)` and `data:text/html,...` both pass. The
value is rendered directly as an `href` on the public listing page.

**Risk.** An owner can store `javascript:` in their contact link. Any student who taps
"Message on Messenger" executes attacker script in their authenticated Meino
session — session-scoped actions, favorites manipulation, or a convincing fake login
overlay. Listings are admin-verified, which reduces but does not remove exposure: the
field is editable *after* verification.

**Root cause.** `.url()` validates syntax, not scheme.

**Files.** `src/lib/validation/listing.ts:52`, rendered at
`src/components/detail/ContactButtons.tsx:27-29`.

**Recommended solution.** Add `.refine()` restricting the protocol to `http:`/`https:`
(`new URL(v).protocol`). Defence in depth: also check the scheme at render time before
emitting the anchor.

**Complexity.** Very low. **Regression risk.** None for legitimate links.

---

## HIGH

### H1 — Unauthenticated, unthrottled analytics writes

**Description.** `logContactClickAction` and `logProfileViewAction` are exported
server actions with **no authentication and no rate limiting**. Each call inserts a row.

**Risk.** Anyone who reads the client bundle can find the action IDs and hammer them:
unbounded row growth in `analytics_events` (Supabase free tier has a hard storage cap —
this can take the whole database down), and arbitrary inflation of any owner's view and
contact-click stats, making the dashboard numbers meaningless. A competitor could also
suppress trust by spamming a rival's metrics.

**Root cause.** Analytics were designed as fire-and-forget with no abuse model.

**Files.** `src/lib/analytics/actions.ts`, `src/lib/db/analytics.ts:6`,
`src/components/detail/ViewTracker.tsx`, `src/components/detail/ContactButtons.tsx`.

**Recommended solution.** At minimum, de-duplicate per session (one VIEW per listing
per user/IP per hour) and add an IP-keyed rate limit. Consider making the events
`Promise.allSettled`-style best-effort writes behind a lightweight in-memory bucket, and
add a scheduled cleanup for events older than N months.

**Complexity.** Medium. **Regression risk.** Low; stats will legitimately drop.

---

### H2 — No rate limiting anywhere (reviews, viewing requests, favorites, auth)

**Description.** No throttling exists on any action or route. `submitReviewAction`,
`requestViewingAction`, `toggleFavoriteAction`, and the sign-in/sign-up actions are all
unbounded.

**Risk.** Credential stuffing against `signInAction` (Supabase has some built-in
protection, but the action itself has none); viewing-request spam flooding an owner's
inbox; favorite-toggle loops generating analytics rows (H1) and notification fan-out.

**Root cause.** Not implemented.

**Files.** `src/lib/auth/actions.ts`, `src/lib/student/*.ts`.

**Recommended solution.** A single shared limiter used by every mutating action, keyed
on profile id (or IP for anonymous). For Vercel, `@upstash/ratelimit` is the low-effort
option; an in-memory limiter is worthless on serverless.

**Complexity.** Medium. **Regression risk.** Low.

---

### H3 — Reviews and viewing requests accept arbitrary listing IDs

**Description.** `submitReviewAction` and `requestViewingAction` receive
`boardingHouseId` from the bound client payload and write with no check that the listing
exists, is `PUBLISHED`, or that the student has any relationship to it.
`toggleFavoriteAction` is the same.

**Risk.** Reviews can be planted on DRAFT/ARCHIVED listings and on listings the student
has never seen; a competitor can write reviews for every listing on the platform. An
invalid ID produces a raw Prisma foreign-key error, which surfaces as the generic
"something went wrong" boundary (see M4). There is also no "has actually stayed here"
signal, so ratings are trivially gameable — this directly undermines the trust the
verify-before-publish rule was built for.

**Root cause.** The ID is treated as trusted because it originated from a server render.

**Files.** `src/lib/student/review-actions.ts:39`, `src/lib/student/viewing-actions.ts:35`,
`src/lib/student/actions.ts:13`.

**Recommended solution.** Look the listing up and require `status === "PUBLISHED"`
before writing; return a clean error otherwise. Longer term, consider gating reviews on
a completed viewing request.

**Complexity.** Low. **Regression risk.** Low.

---

### H4 — Missing database indexes on hot foreign keys

**Description.** `BoardingHouse.ownerId` has no index, yet every owner-dashboard query
filters on it. `Favorite` is keyed `[studentId, boardingHouseId]`, so lookups by
`boardingHouseId` alone (the room-available notification fan-out) cannot use the primary
key. `Review.authorId` and `ViewingRequest.studentId` are likewise unindexed.

**Risk.** Sequential scans that grow linearly with the table. Fine at 20 listings,
visibly slow at 5,000 favorites — and the notification fan-out runs inside the owner's
"save listing" request, so the owner feels the latency directly.

**Root cause.** Indexes were added for the read paths that were profiled, not the
write/fan-out paths.

**Files.** `prisma/schema.prisma:121-165, 237-270, 272-286`.

**Recommended solution.** Add `@@index([ownerId])` on `BoardingHouse`,
`@@index([boardingHouseId])` on `Favorite`, `@@index([authorId])` on `Review`,
`@@index([studentId])` on `ViewingRequest`. One migration, no code changes.

**Complexity.** Very low. **Regression risk.** None.

---

### H5 — Slug generation can collide and crash the create flow

**Description.** `slugify()` appends 5 characters of `Math.random().toString(36)`.
`BoardingHouse.slug` is `@unique`. There is no collision retry.

**Risk.** A duplicate slug throws a Prisma `P2002` inside `createListingAction`, which
does not catch it — the owner loses the entire form they just filled in and sees a
generic error. `Math.random()` is also not cryptographically distributed; two listings
created in the same millisecond are a realistic collision source.

**Root cause.** Uniqueness is delegated to randomness with no fallback.

**Files.** `src/lib/utils/slug.ts:10`, `src/lib/owner/actions.ts:49`,
`src/lib/db/owner.ts:58`.

**Recommended solution.** Use `crypto.randomUUID().slice(0, 8)`, and wrap the create in
a retry that regenerates the suffix on `P2002` (2–3 attempts). Return a friendly error
rather than throwing.

**Complexity.** Low. **Regression risk.** Low.

---

## MEDIUM

### M1 — Admin actions throw on missing rows

`setListingVerified`, `setListingStatusAsAdmin` and `deleteReviewById` use Prisma
`update`/`delete`, which throw `P2025` if the record is gone. Two admins working the
queue simultaneously, or a stale tab, produces an unhandled exception instead of a
message.
**Files.** `src/lib/db/admin.ts:70-82,95`. **Fix.** Use `updateMany`/`deleteMany` and
report a "no longer exists" error when `count === 0`. **Complexity.** Low.

### M2 — `setStatusAction` reports success even when nothing was updated

`setListingStatus` returns a boolean the action discards, so submitting a listing you do
not own silently "succeeds". It also calls `countImages(id)` before any ownership check,
leaking whether an arbitrary listing meets the photo minimum.
**Files.** `src/lib/owner/actions.ts:86-101`. **Fix.** Check ownership first, return the
boolean. **Complexity.** Very low.

### M3 — Homepage ships every published listing to the browser

`findPublishedBoardingHouses()` loads all listings with rooms, images, amenities, nearby
places and reviews, and serialises the whole set into the client bundle for
`DiscoveryView`. Filtering and sorting are entirely client-side.
**Risk.** Payload and hydration time grow linearly. At ~500 listings this is a multi-
megabyte HTML document on the mobile connections VSU students actually use.
**Files.** `src/app/page.tsx:13`, `src/lib/db/boarding-houses.ts:16`,
`src/components/discovery/DiscoveryView.tsx`. **Fix.** Trim the payload to card fields
only (drop `nearbyPlaces`, full review rows), then paginate or move filtering server-side
once the catalogue passes ~200. **Complexity.** Medium. **Regression risk.** Medium —
touches the main discovery flow.

### M4 — No `not-found.tsx` and no `global-error.tsx`

`notFound()` is called in two routes but there is no custom 404, and there is no
top-level error boundary for failures in the root layout.
**Files.** `src/app/`. **Fix.** Add both; keep them consistent with `error.tsx`.
**Complexity.** Very low.

### M5 — Missing loading states outside `/owner`

Only `src/app/owner/loading.tsx` exists. `/listings/[slug]`, `/account`, `/compare` and
`/admin` all perform multiple awaited queries with no skeleton, so navigation appears
frozen on a slow connection. The `RouteProgress` bar mitigates this but does not replace
per-route fallbacks.
**Fix.** Add `loading.tsx` to those segments. **Complexity.** Low.

### M6 — Double-submit protection is inconsistent

`ListingForm`, `ReviewForm` and `PhotoManager` disable on pending. `OwnerListingCard`
and `AdminListingRow` guard with local state, but `FavoriteButton` toggles optimistically
and re-enables on every render — rapid clicking queues multiple server actions and can
leave the heart out of sync with the database.
**Files.** `src/components/student/FavoriteButton.tsx:37-41`. **Fix.** Ignore clicks
while `pending`. **Complexity.** Very low.

### M7 — Prisma query logging enabled in development only, but no production error context

`log: ["error"]` in production gives no request correlation. Not a leak (good — no
`console.log` anywhere in `src/`, verified), but production incidents will be hard to
diagnose.
**Files.** `src/lib/db/prisma.ts:14`. **Fix.** Wire an error reporter (Sentry or Vercel
log drain). **Complexity.** Low.

### M8 — `.env.example` is gitignored and therefore not distributed

`.gitignore` line 34 is `.env*`, which matches `.env.example`. `git ls-files` confirms it
is untracked. A new collaborator cloning the repo gets no template and no list of
required variables — this already cost time once this project.
**Fix.** Add `!.env.example` after the `.env*` rule and commit it.
**Complexity.** Trivial. **Regression risk.** None — verify no real secret is inside
first (currently it contains only placeholders).

### M9 — No Row Level Security posture documented or enforced

The app connects via Prisma as the database owner and therefore bypasses RLS entirely;
all authorization lives in the action layer (`requireOwner`, `requireAdmin`, and
owner-scoped `where` clauses). That design is sound and consistently applied — every
owner write is scoped by `ownerId`, verified across `src/lib/db/owner.ts`. But the anon
key is public, so if RLS is not enabled on the public tables, anyone can read and write
them directly through the Supabase REST endpoint, completely bypassing the app.
**Risk.** Total data exposure if RLS is off. This is an infrastructure setting the audit
cannot verify from the code.
**Fix.** Confirm in the Supabase dashboard that every table in `public` has RLS
**enabled with no permissive policies** (deny-all). Prisma is unaffected. Treat this as a
release blocker until visually confirmed.
**Complexity.** Low. **Regression risk.** None if Prisma is the only writer.

### M10 — Photo deletion loop is not transactional

`deletePhotosAction` deletes DB rows and storage objects one at a time in a loop. A
mid-loop failure leaves orphaned storage objects (billed, unreferenced) or rows pointing
at deleted files.
**Files.** `src/lib/owner/photo-actions.ts:88-97`. **Fix.** Collect URLs, delete rows in
one transaction, then remove files best-effort. **Complexity.** Low.

---

## LOW

### L1 — Dead code

Confirmed unreferenced (each has exactly one occurrence — its own definition):

| Symbol | File |
|---|---|
| `isAllowedStudentEmail`, `STUDENT_EMAIL_HINT`, `ALLOWED_STUDENT_EMAIL_DOMAINS` | `src/config/auth.ts` |
| `uploadListingPhoto` | `src/lib/storage/photos.ts` |
| `deletePhotoAction` | `src/lib/owner/photo-actions.ts` |
| `markNotificationsReadAction` | `src/lib/student/notification-actions.ts` |
| `listingFiltersSchema` (only its inferred *type* is used) | `src/lib/validation/filters.ts` |

The VSU-domain helpers are leftovers from the abandoned domain restriction; the upload
helper and single-photo delete are leftovers from the pre-signed-upload architecture.
**Fix.** Delete, except `listingFiltersSchema` — keep it, it is the source of the type
and will be needed if filtering moves server-side (M3). **Complexity.** Trivial.

### L2 — `PhotoManager.tsx` is 221 lines

The only file over the project's 200-line rule. It mixes the progress card, the
drop-zone, the selection grid and the confirm dialog.
**Fix.** Extract `PhotoDropZone` and `PhotoGrid`. **Complexity.** Low.
**Regression risk.** Low, but it is working code — defer unless it needs changes anyway.

### L3 — Accessibility gaps

Generally strong: `ConfirmDialog` and `SignInModal` both trap focus, restore it, and
handle Escape; `prefers-reduced-motion` is respected globally; all seven `next/image`
uses have `alt`; `FavoriteButton` and the alerts toggle use correct `aria-pressed` /
`role="switch"`. Remaining gaps:
- `AdminListingRow` and `OwnerListingCard` surface errors in a plain `<p>` with no
  `role="alert"`, so screen readers miss them (`PhotoManager` does this correctly).
- The listing-detail `SectionTabs` are anchor links, not a `tablist`; acceptable, but
  `aria-current` on the active tab would help.
- Colour contrast of `--color-muted` `#6B7280` on `--color-canvas` `#FAFAFA` is 4.83:1 —
  passes AA for body text, fails AA for the several places it is used at `text-xs`.
**Complexity.** Low.

### L4 — Two moderate npm advisories (transitive, unfixable)

`npm audit --omit=dev` reports PostCSS `<8.5.10` (GHSA-qx2v-qp2m-jg93, XSS via
unescaped `</style>` in stringify output) reached only through `next@16.2.10`. The
suggested fix downgrades Next to 9.3.3 and must not be applied.
**Assessment.** Not exploitable here — the vulnerable path is build-time CSS
stringification of untrusted CSS, which this project never does.
**Fix.** Accept, and re-check on the next Next.js patch release.

### L5 — Dependency review

No unused runtime dependencies. All twelve are load-bearing: `geist` (fonts),
`leaflet` + `react-leaflet` + `leaflet-gesture-handling` (maps), `framer-motion`
(animation system), `server-only` (the guard on `supabase/admin.ts`), `zod` (all
validation), both Supabase packages, Prisma, Next/React. `framer-motion` is the largest
at ~110 KB gzipped and is used on nearly every page, so it cannot be trimmed to a
subpath without reworking the animation layer — not worth it now.

### L6 — Minor correctness notes

- `updateOwnerListing` intentionally preserves the original slug, so a renamed listing
  keeps a stale URL. Documented in the code; acceptable, but the owner has no way to see
  why their URL doesn't match the name.
- `slugify` truncates to 60 chars *before* adding the suffix, so the real cap is 66.
- `Notification.type` is a free-form `String` while every other status field is an enum.
- `getRatingSummary` and the per-card average computed in `services/listings.ts` derive
  the same number two different ways; they agree today but can drift.

---

## Verification performed

- `npx tsc --noEmit` — clean.
- `npx eslint src` — clean.
- `npm run build` — succeeds, all 18 routes compile.
- `grep` for `dangerouslySetInnerHTML`, `eval(`, `console.log`, `: any` — **zero hits**
  across `src/`. No unsafe HTML rendering anywhere in the project.
- Zod URL scheme behaviour confirmed empirically (C4) rather than assumed.
- Dead-code claims confirmed by reference counting, not inspection.
- `git ls-files` confirmed `.env` and `scripts/seed-qa-users.ts` (which contains QA
  passwords) are **not** tracked. No secret is committed.

## Recommended order of work

1. **C1, C4** — one-line-class fixes, highest risk-reduction per unit effort.
2. **M9** — verify RLS in the dashboard. Release blocker, zero code.
3. **C2, C3** — closes the upload bypass; C2 needs a bucket update as well as code.
4. **H4** — one migration, immediate and permanent performance win.
5. **H3, H5, M1, M2, M6** — a batch of small correctness fixes.
6. **H1, H2** — rate limiting; the largest single piece of new work.
7. **M4, M5, M8, L1** — polish and hygiene.
8. **M3** — revisit when the catalogue approaches ~200 listings.

Items C1–C4, M9 and H4 should be treated as gating for a public launch. Everything else
is safe to ship behind.
