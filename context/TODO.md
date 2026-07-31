# TODO — Meino

Living development tracker. Update this when you finish or add work. Grouped by priority.

## High priority

- [ ] **Fill `config/support.ts`** — admin/support contact shown to owners is still
      placeholder text.
- [ ] **Set env vars in Vercel** for both branches/projects (Supabase URL + keys,
      `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SITE_URL`) — a missing one fails the build.
- [ ] **(Optional) Separate admin domain** — point a domain at the project and set
      `ADMIN_HOST` to it (see `config/admin.ts` / `CHANGELOG.md`).
- [ ] **Manual QA of new owner/admin flows** (auth-gated, tooling can't drive): plan
      assignment → badge/featured; freeze/delete owner; Danger Zone self-delete; onboarding
      tutorial (first-run + replay); viewing calendar (confirm a request → red date).
- [ ] **Remove dead verification-request code** if desired (`requestOwnerVerification`,
      `requestVerificationAction`) — replaced by plans.
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

- [ ] **Redis (Upstash) caching** per `PERFORMANCE.md` / `docs/CACHING.md` — start with
      homepage listings + listing detail, measuring each.
- [ ] Move the rate limiter to the shared Redis store (global limits vs per-instance).
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
