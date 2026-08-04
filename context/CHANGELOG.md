# Changelog — recent feature work

Newest first. This captures work done after the knowledge base was first written, so the
other `/context` docs may still describe older behavior — **this file wins on conflicts**
for anything listed here. Keep it updated as you ship.

## Sign-in lockout + clearer signup errors (2026-08-03)

- **Account lockout**: 5 wrong-password attempts for an email locks it out for 30s,
  tracked in Postgres (`lib/security/login-lockout.ts`, reusing the `rate_limit_windows`
  table) — immune to refresh/new-tab/incognito since it's keyed server-side by email, not
  client state. Layered on top of the existing IP-based `LIMITS.auth` rate limit, not a
  replacement for it. Successful sign-in clears the counter.
- Added a reminder note to the sign-in form: forgot-password isn't built yet, so
  double-check your email/password before submitting, plus the 5-attempt/30s rule
  spelled out up front (`AuthForm.tsx`).
- **Signup now explains a duplicate email clearly.** Supabase doesn't return an error for
  an already-registered email — for privacy, it returns 200 with a user object whose
  `identities` array is empty and no session, which previously looked identical to "check
  your email to confirm a new account." Now detected explicitly and returns "An account
  with this email already exists. Please sign in instead." (`lib/auth/actions.ts`).
- Considered and explicitly declined: blocking signup on a duplicate full name. Full
  names aren't unique in the schema and shouldn't be — two different students can share a
  name — so only email (the real account identifier) is checked.

Verified: `tsc`, `eslint`, `npm run build`, all 37 tests pass. The lockout state machine
(locks on the 5th failure, holds through the 6th, cleanly resets after the 30s window)
was verified directly against Postgres with a real 31-second wait, not just read from
the code.

## Redis caching implemented (2026-08-03)

Built the plan in `docs/CACHING.md` (was documented but not implemented): added
`@upstash/redis` and `src/lib/cache/redis.ts` — a `cached(key, ttlSeconds, fn)`
read-through helper with a Date-safe JSON round-trip (Prisma rows carry `Date` objects;
a plain `JSON.stringify`/`parse` would silently turn them into strings and break every
caller expecting `.toISOString()` on a cached row). No-op when
`UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` are unset — local dev and any
deploy before those are configured are unaffected — and any Redis failure at read or
write time falls back to the live query, so caching can never take the site down.

Wrapped all six reads from the plan: `findPublishedBoardingHouses`, `findBoardingHouseBySlug`
(`lib/db/boarding-houses.ts`), `findReviews` (`lib/db/reviews.ts`), `getPlatformStats`
(`lib/db/admin.ts`), `getOwnerAnalytics` (`lib/db/analytics.ts`). Added explicit
invalidation next to the write paths' existing `revalidatePath()` calls: listing create/
update/status (`lib/owner/actions.ts`), admin verify/publish/feature/delete
(`lib/admin/actions.ts`), review submit/delete (`lib/student/review-actions.ts`) — the
last of these required changing `deleteOwnReview` to return the deleted review's
`boardingHouseId` (was a bare boolean) so the caller has something to invalidate.
`getPlatformStats` has no invalidation rule, by design — it's allowed to lag by its 15
min TTL.

Still needed to see any actual effect in production: create an Upstash Redis database
and set the two env vars in Vercel (noted in `context/TODO.md`). Not done this pass:
moving the rate limiter onto the same Upstash instance (`docs/SECURITY.md` already flags
this as a follow-up).

Verified: `tsc`, `eslint`, `npm run build` (succeeds with zero Redis env vars set,
confirming the no-op path at build time too), all 37 tests pass, and live-checked in
Chrome with no env vars configured — homepage, listing detail, and admin all render
identically to before.

## Loading-time pass (2026-08-03)

No architecture or functionality changes — purely reducing redundant work per request.
- **Deduped auth lookups with React `cache()`** (`lib/auth/profile.ts`): `getCurrentUser`
  and `ensureProfileForCurrentUser` are now memoized per request. Previously every page
  paid for the Supabase Auth round trip + Prisma profile query *twice* (once directly,
  once again inside `SiteHeader`) — worse on `/admin/*`, where `admin/layout.tsx` and
  every single admin page each called it independently. Now one lookup is shared across
  the whole render.
- **Parallelized independent reads**: homepage (`app/page.tsx`) and listing detail
  (`app/listings/[slug]/page.tsx`) were awaiting the DB query and the session lookup
  sequentially even though neither depends on the other; both now run via `Promise.all`.
- **Lowered `resilientRead`'s default timeout** 5s → 3s per attempt (`lib/async/resilient-read.ts`).
  Worst case (2 attempts) drops from 10s to 6s before falling back to the error UI —
  this is what BUG-007's "blank page for 5-14 seconds" was hitting.
- Added `<link rel="preconnect">`/`dns-prefetch` to the Supabase Storage origin in the
  root layout (photos load from there) and `priority`/eager `loading` on the first 4
  listing cards' images (`ListingCard.tsx` + `ListingGrid.tsx`) so the above-the-fold
  grid doesn't lazy-load images that are visible immediately.
- Not done: the Redis caching layer already planned in `docs/CACHING.md` — that's the
  next, larger lever (removes DB round trips entirely on repeat visits) but is a bigger
  addition, left as its own follow-up.

Verified: `tsc`, `eslint`, `npm run build` (same route manifest, no new/removed routes),
all 37 tests pass, and live-checked in Chrome — homepage, listing detail, and admin all
render identically to before.

## QA bug/suggestion pass (2026-08-03)

Worked through an external QA bug tracker and suggestions list (`/QA`, deleted after this
pass — see `context/TODO.md` § "QA pass" for the full durable record). Fixed: owner
dashboard viewing-request count now matches the requests inbox (`lib/db/analytics.ts`);
owners no longer inflate their own profile-view count; mobile "List your property" is
role-aware; curfew default, PH phone format, room-availability color, and a required
(non-defaulted) review rating; `/terms` back link; added `sitemap.ts`/`robots.ts`/
`manifest.ts`; 44px touch targets on flagged controls; added
`scripts/verify-deployment-routes.mts` as a post-deploy smoke-test gate. Most of the
"missing route" bugs were the deployed Vercel build lagging the repo, not code defects —
confirmed by building and curling every route locally (all 200). Left untouched:
per-plan room-limit enforcement (BUG-019/020) — `BILLING_ENABLED` is intentionally `false`
in Phase 1, so blocking rooms by plan now would contradict the free-beta promise; do it
together with the subscription-ledger rework when Phase 2 billing turns on.

## Owner plans replace manual verification & featuring

- **Verified Owner badge and Featured listings are now plan-driven**, not manual toggles.
  An admin assigns a plan to an owner on `/admin/owners`; `setOwnerPlan` (in `lib/db/admin.ts`)
  applies the perks in one transaction:
  - Basic → no badge, not featured
  - Advance → Verified Owner badge (`profile.verified = true`, `verifiedUntil = null`)
  - Premium → badge **and** all the owner's listings `featured = true`
  Perks are read from `config/pricing.ts` (single source of truth).
- **Removed:** the owner "Be verified" request card (`OwnerVerification.tsx`, deleted), the
  admin owner-level Verify button, and the listing-row **Verify owner** + **Feature**
  buttons. The listing-level **Verify** button (gates publishing) is intentionally kept.
- The owner verification-request flow (`requestOwnerVerification` / `requestVerificationAction`)
  is now dead code — safe to remove later. `verifiedUntil` / `verificationRequestedAt`
  columns remain but are effectively unused (badge is plan-driven, no expiry).

## Pricing page (display only — NO billing)

- `/pricing` (public, in nav). Beta banner + 3 SaaS cards (Basic ₱129 / Advance ₱179,
  "Most Popular" / Premium ₱239, all "/ Semester") + comparison table + FAQ + CTA.
- Buttons are inert ("Coming After Beta"). `BILLING_ENABLED` stays `false`; nothing is
  gated or charged. Plan data + future-facing types (`Plan`, `PlanFeature`, `Subscription`)
  live in `config/pricing.ts`.
- Components in `components/pricing/`.

## Owner onboarding tutorial (DB-backed, first-run once)

- Auto-launches once per owner (flag `profile.ownerTutorialCompleted`; the DB is the
  source of truth, never localStorage). Replay button in the dashboard's Settings & Help.
- Flow: welcome → spotlight dashboard tour → **hands-off to the REAL listing form**
  (`/owner/listings/new?tutorial=first|replay`) in a sandbox — real fields, interaction
  gating, but submit is neutralized (no writes) → fake publish → confetti → checklist.
- Code in `components/tutorial/` (lazy-loaded via `next/dynamic`, `ssr:false`, so returning
  owners don't pay for it). Tutorial copy is hardcoded in `components/tutorial/steps.ts`.
- "Getting Started" checklist + friendly empty states on the dashboard.

## Admin: freeze & delete owners; self-serve account deletion

- **Freeze** (`profile.frozen`): frozen owners see a notice and lose all dashboard writes
  (`requireWritableOwner` redirects them); their listings stay public. Admin toggles it on
  `/admin/owners`.
- **Delete owner** (admin) and **Danger Zone** (self, in student + owner settings) both call
  `deleteAccountCompletely` (`lib/account/deletion.ts`): cascades all DB rows via
  `onDelete: Cascade`, removes storage photos, deletes the Supabase auth user. Self-delete
  signs out afterward.

## Admin on a separate domain (opt-in)

- `config/admin.ts` + `proxy.ts`: when env var `ADMIN_HOST` is set, `/admin` is served ONLY
  on that host and 404s on the main site; the admin host's root rewrites to `/admin`. Unset
  (local dev) → admin stays at `/admin` as before. Deployment: point a domain at the project
  (or use a 2nd Vercel project) and set `ADMIN_HOST` on it. Not yet configured in prod.

## Other UX

- **Terms gate** (`components/system/TermsGate.tsx`): blocking first-visit modal, must tick
  to proceed; skips on `/terms`. Content editable in `app/terms/page.tsx`.
- **Google onboarding**: first-time OAuth users go to `/onboarding` to set a display name
  (`ensureProfileForCurrentUser` reports `created`); existing users skip. Dedupe by id→email.
- **Sign-Up redesign**: student vs owner sign-up now use themed two-panel `SignUpLayout`
  (Sign In unchanged). Owners clicking "List your property" while logged in go to `/owner`.
- **Listing form**: curfew is a time picker (blank → "N/A"); contact is now **multiple
  numbers each with a SIM carrier**, stored as JSON in `contactPhone` (parsed by
  `lib/contact/phones.ts`, back-compatible with old single-string values).
- **Viewing requests**: owner page shows student name + email/phone, Confirm/Delete buttons,
  and Pending/Confirmed filters. Listing detail has a **viewing calendar** marking CONFIRMED
  dates in red.
- **Ad cards**: clicking opens a detail modal (all images gallery) instead of jumping out.
- **Bug reporter**: floating button (bottom-left) now links to a **Google Form** (the old
  `bug_reports` table was dropped). Watermark "HBG Production" on every page.
- Loading spinners on sign in / sign out / create listing.

## Schema deltas (all applied to Supabase, Prisma regenerated)

`Profile` gained: `verifiedUntil`, `verificationRequestedAt` (now mostly unused), `frozen`,
`plan` (`BASIC|ADVANCE|PREMIUM|null`), `ownerTutorialCompleted`. Table `bug_reports` was
created then **dropped**. No other model changes.

## Files to edit for content (no code changes needed)

- Terms text → `app/terms/page.tsx`
- Admin/support contact (shown to owners) → `config/support.ts` (**still placeholders**)
- Pricing plans → `config/pricing.ts`
- Tutorial steps → `components/tutorial/steps.ts`
- Prices → `config/billing.ts` (`EXTRA_LISTING_PRICE`, `VERIFICATION_PRICE`, …)

## Deployment gotchas

- Production deploys from `main`; recent feature work was merged there (commit `ef2a8b2`).
- Vercel must have all env vars set (`NEXT_PUBLIC_SUPABASE_URL`, keys, `DATABASE_URL`,
  `DIRECT_URL`, `NEXT_PUBLIC_SITE_URL`); a missing one fails the build at page-data collection.
- `config/support.ts` placeholders should be replaced before launch.
