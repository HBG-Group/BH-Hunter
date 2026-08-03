# TODO — Meino

Living development tracker. Update this when you finish or add work. Grouped by priority.

## QA pass — 2026-08-03 (from `/QA` bug tracker + suggestions, now deleted)

The QA folder contained a bug tracker (23 items) and a suggestions list (26 items) from
external testing against the deployed commit `18391bc`. Findings below; the two source
PDFs are gone (per the request that created them) — this section is the durable record.

**Stale-deployment false positives (routes already exist in this codebase — not a code
bug, just meant the live Vercel deployment was behind the repo):** BUG-003 (`/privacy`),
BUG-004 (footer — `SiteFooter` is wired into root layout), BUG-007 (loading states —
`listings/[slug]/loading.tsx` and `owner/loading.tsx` both exist), BUG-008 (`/cookies`),
BUG-009 (`/security`), BUG-010 (`/onboarding`), BUG-011 (`/account/privacy`), BUG-012
(`/pricing`, `/subscribe/[plan]`), BUG-015 (`/admin/owners` + nav link). Verified by
building and curling every route locally — all 200. Root cause fix: added
`scripts/verify-deployment-routes.mts` (`npm run verify:routes`, SUG-006) as a release
gate so a future deploy that drops a route fails CI instead of shipping silently.
BUG-013 (missing security headers in prod) is the same class — `next.config.ts` already
sets them via `securityHeaders()`; nothing to fix in code, just a deploy to re-verify with
`npm run security:verify-deployment`. BUG-005 (location capitalization) and BUG-014/018
(admin login / sign-in stuck on "Please wait") were not reproducible in the current code
either — no lowercase string, no un-resolved promise path found.

**Fixed this session:**
- BUG-006: owner dashboard "Viewing requests" tile counted an append-only
  `AnalyticsEvent` log instead of the real `ViewingRequest` table, so it never agreed
  with `/owner/requests`. `getOwnerAnalytics` (`src/lib/db/analytics.ts`) now counts the
  same table the inbox reads.
- BUG-016: an owner viewing their own listing incremented their own "profile views."
  `logProfileViewAction` (`src/lib/analytics/actions.ts`) now skips logging when the
  viewer owns the listing.
- BUG-017 / BUG-023: `MobileMenu` showed "List your property" to every signed-in role.
  It's now role-aware (`src/components/layout/MobileMenu.tsx` + `SiteHeader.tsx` passes
  `role`): guests see the pitch, owners see "Manage your listings" → `/owner`, students/
  admins see neither — matching what the desktop header already did.
- SUG-001: curfew time input had no default; now defaults to 22:00 (still editable/clearable).
- SUG-002: phone validation only checked digit count; now enforces PH mobile format
  `09XXXXXXXXX` (`src/lib/validation/listing.ts`).
- SUG-003: room availability had no color cue; `RoomsEditor` now shows green "N available"
  or red "Full".
- SUG-005: review form pre-selected 5 stars on every aspect, making an accidental 5-star
  submission one click away. Now requires an explicit rating (no default) when leaving a
  new review; editing an existing review still prefills the saved values.
- SUG-007: `/terms` only had a "back to home" link at the very bottom; added the same
  link at the top too. (The consent gate already opens Terms in a new tab, so the
  original tab keeps the dialog open — this just gives Terms itself a visible way back.)
- SUG-009: added `src/app/sitemap.ts`, `robots.ts`, `manifest.ts` (all missing).
- SUG-011: bumped touch targets to a 44px minimum on the ones QA measured: mobile menu
  button, sign-in button, favorite button, filter chips (`Pill`), "Clear all" in
  `FilterSheet`.
- SUG-006 / SUG-008: added `scripts/verify-deployment-routes.mts` as described above.
  (SUG-008's admin-specific variant is not built — the same script covers the same class
  of failure; a dedicated authenticated admin smoke test is still open, see below.)

**Deliberately not changed — conflicts with the current business model
(`context/BUSINESS_MODEL.md`, `config/billing.ts`):**
- BUG-019 / BUG-020 / SUG-023 (server-side per-plan room limits + entitlement UI):
  `BILLING_ENABLED = false` — Phase 1 is intentionally free and unlimited so the product
  can be tested without payment friction (this is also what the new owner-dashboard beta
  banner tells owners). Enforcing a Basic/Advance room cap now would silently break that
  promise. This is real, correctly-scoped work for when `BILLING_ENABLED` flips on — do
  it together with SUG-024 (subscription ledger) so entitlements and payment history land
  as one coherent Phase 2 change, not two half-finished ones.

**Out of scope for a single pass — real, sized as their own project work, not skipped by
oversight:**
- SUG-021: brand identity / design-system pass (logo, type scale, spacing grid) — a
  design decision, not something to improvise inside a bug-fix session.
- SUG-024 / BUG-021: subscription ledger (`SubscriptionPayment`/`SubscriptionEvent`
  history instead of one mutable `Subscription` row) — needs a schema migration and
  touches every plan-change code path; do with SUG-023 above.
- SUG-025 / BUG-022: admin notification center (bell, `/admin/notifications`, event
  feed) — new model + UI surface, sized as its own feature.
- SUG-013: consolidated Account & Settings hub — mostly exists piecemeal (`/account`,
  `/account/privacy`); a "hub" page that links them together is a small follow-up, not
  done here.
- SUG-014 / SUG-016 / SUG-019 / SUG-020: form-validation hardening, auth/rate-limit
  audit, and input-boundary/XSS test matrix — these are audit checklists more than single
  bugs; `docs/SECURITY.md` and `tests/security/` already cover a meaningful chunk of this
  (CSRF via server actions, rate limits, upload validation, redirect/XSS tests) — worth a
  dedicated pass to check the list item-by-item against what's already there before
  writing new code.
- SUG-017: standardized loading/error/empty-state pattern — real but cross-cutting;
  loading states already exist per-route (see above), a shared component is a refactor.
- SUG-018: dedicated full-page `/map` — new route + nav entry, a scoped feature.
- SUG-004 / SUG-010 / SUG-012: footer already exists with legal links (`SiteFooter.tsx`)
  — worth a quick manual check that Privacy/Contact/report-listing links are all present
  and reachable from it now that the footer itself is confirmed wired in; if something's
  missing it's a small addition to that one file, not new architecture.

Only the two source PDFs (`Meino - QA - Bug Tracker.pdf`, `Meino - QA - Suggestions.pdf`)
were deleted, per the instruction that created this section — everything else above is
the record of what they contained.

## High priority

- [ ] **Fill `config/support.ts`** — admin/support contact shown to owners is still
      placeholder text.
- [ ] **Set env vars in Vercel** for both branches/projects (Supabase URL + keys,
      `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SITE_URL`) — a missing one fails the build.
      `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` are set in Vercel (2026-08-03)
      — confirm the next deploy picks them up (env var changes need a redeploy to apply)
      and that `getOwnerAnalytics`/`findPublishedBoardingHouses` etc. are actually hitting
      Redis, not falling through silently.
- [ ] **(Optional) Separate admin domain** — point a domain at the project and set
      `ADMIN_HOST` to it (see `config/admin.ts` / `CHANGELOG.md`).
- [ ] **Manual QA of new owner/admin flows** (auth-gated, tooling can't drive): plan
      assignment → badge/featured; freeze/delete owner; Danger Zone self-delete; onboarding
      tutorial (first-run + replay); viewing calendar (confirm a request → red date).
- [ ] **Ship the current work.** Recent features were merged to `main` (`ef2a8b2`); confirm
      the production deploy succeeded after env vars are set.
- [ ] **Manual end-to-end verification** by an admin (needs a logged-in session, which
      tooling can't drive):
  - Create an ad from `/admin/ads` (gallery upload, multiple images) → appears on the
    homepage "From local businesses" strip.
  - Feature a listing → it floats to the top of the homepage.
  - Delete a listing → gone from DB and its photos cleared from Storage.
  - Open a PENDING listing at `/admin/listings/[id]` → full info + photos show.
- [ ] **Custom SMTP for auth emails.** Supabase's built-in email is ~2/hour (testing
      only). Configure Resend/SendGrid/SES before real sign-ups. See `docs/SECURITY.md`.
- [ ] Confirm `NEXT_PUBLIC_SITE_URL` is set in Vercel so OAuth/confirmation links resolve
      to production, not localhost.

## Medium priority

- [ ] Move the rate limiter to the shared Redis store (global limits vs per-instance) —
      reuse the same Upstash instance the cache now uses (`lib/cache/redis.ts`).
- [ ] Owner detail page from delete flow: after deleting from `/admin/listings/[id]`,
      redirect back to the listings list (currently leaves a stale page).
- [ ] Richer owner analytics beyond view/contact/favorite/request counts.
- [ ] When the catalogue passes ~200 listings, move filtering/sorting server-side while
      keeping the map's full marker set (fuller fix for audit M3).

## Low priority

- [ ] Generate thumbnails on upload; serve smaller derivatives for cards.
- [ ] Prefetch listing detail on card hover/focus.
- [ ] Optional: upgrade "Load more" to intersection-observer infinite scroll.
- [ ] `role="alert"` on the admin row error text (accessibility parity with PhotoManager).
- [ ] Extract `PhotoManager.tsx` sub-pieces if it needs changes (slightly over 200 lines).

## Future ideas

- [ ] **Phase 2 monetization**: flip `BILLING_ENABLED`, integrate a PH payment gateway
      (Maya/GCash/PayMongo) at the points marked in `lib/owner/billing.ts`.
- [ ] Owner subscription enforcement (`Subscription` model already scaffolded).
- [ ] Multi-campus support: add a `Campus` model + `campusId` on `BoardingHouse`.
- [ ] Consider gating reviews on a completed viewing request (trust).
- [ ] Periodic cleanup of old `analytics_events`; per-session view de-dup.

## Completed

**Loading-time pass (2026-08-03, see `CHANGELOG.md` for detail):**
- [x] Redis (Upstash) read-through caching implemented per `docs/CACHING.md` — safe
      no-op until `UPSTASH_REDIS_REST_URL`/`..._TOKEN` are set in Vercel (see High
      priority above).
- [x] Deduped auth lookups with React `cache()` (was hit twice per page, more on `/admin/*`).
- [x] Parallelized independent DB/session reads on homepage and listing detail.
- [x] Lowered `resilientRead` timeout 5s → 3s per attempt.
- [x] Preconnect to Supabase Storage; priority loading on above-the-fold listing images.

**Recent feature session (see `CHANGELOG.md` for detail):**
- [x] Owner **plans** (Basic/Advance/Premium) assigned by admin, auto-applying Verified
      badge + Featured; removed manual owner-verify / feature / "Be verified" request.
- [x] **Pricing page** `/pricing` (display only, no billing) + nav item.
- [x] DB-backed **owner onboarding tutorial** (first-run once, replay), practices on the
      real listing form in a sandbox; Getting-Started checklist; empty states.
- [x] Admin **freeze/unfreeze** + **delete owner**; self-serve **Danger Zone** deletion
      (cascade + storage + auth user).
- [x] **Admin domain** routing via `ADMIN_HOST` (`config/admin.ts` + `proxy.ts`).
- [x] **Terms gate** + editable `/terms`; **Google onboarding** display-name step; sign-up
      redesign (student vs owner); owner "List your property" → dashboard fix.
- [x] Listing form: **curfew time picker** (blank → N/A), **multiple contact numbers with
      SIM carrier** (JSON in `contactPhone`, back-compatible).
- [x] Viewing requests: contact info, Confirm/Delete, Pending/Confirmed filters; **viewing
      calendar** on listing detail (CONFIRMED dates in red).
- [x] Ad detail modal (image gallery); **bug reporter → Google Form** (dropped
      `bug_reports` table); "HBG Production" watermark; auth/create loading spinners.

**Earlier:**
- [x] Milestones M0–M4: foundation, discovery map, owner side, student accounts, admin.
- [x] Rebrand BH Hunter → **Meino** (name, terracotta palette, doorway logo, warmer copy).
- [x] Full engineering audit (`docs/AUDIT.md`) + security hardening pass (`docs/SECURITY.md`).
- [x] **RLS enabled on all tables**, including `subscriptions` and `advertisements`.
- [x] Security: validated redirects, https URL allowlist, HMAC upload tickets, bucket
      MIME/size + server re-inspection, unique image URLs, rate limiting, safe errors,
      server-only secrets.
- [x] Google OAuth / confirmation-email redirect fix (canonical site origin).
- [x] Admin login moved to `/admin` (inline gate); hidden `/bh-control` removed.
- [x] Admin listing **detail page** (`/admin/listings/[id]`) — full info + all photos, any
      status, for review before verifying.
- [x] **Delete** replaces Archive in admin (permanent, cascades + clears Storage photos).
- [x] Listing **status filters**: All / Unverified / Unpublished.
- [x] **Verified Owner** badge (Part 4) — admin-granted, shown across the app.
- [x] **Featured listings** (Part 5) — admin toggle, float to top of homepage.
- [x] **Advertisements** (Part 6) — admin CRUD + homepage strip + **gallery image upload
      (multiple, ≤5 MB, images only)** via the secure ticket pipeline.
- [x] **Listing quota** (Part 1) scaffolded, flag-gated free in Phase 1.
- [x] `Subscription` model scaffold (Part 2); billing config encodes the roadmap (Part 3).
- [x] Redis caching plan (`docs/CACHING.md`, Part 7).
- [x] Performance (Part 8): skeletons, AVIF/WebP, lazy map/images, "Load more" pagination,
      optimistic favorites, route progress.
- [x] `/context` knowledge base created.
