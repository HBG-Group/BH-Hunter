# Changelog — recent feature work

Newest first. This captures work done after the knowledge base was first written, so the
other `/context` docs may still describe older behavior — **this file wins on conflicts**
for anything listed here. Keep it updated as you ship.

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
