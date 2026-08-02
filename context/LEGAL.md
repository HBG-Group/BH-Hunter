# Legal, Trust & Compliance — Meino

What exists, where it lives, and why. Companion to `SECURITY.md` (technical controls) and
`docs/PRIVACY.md`/`docs/MODERATION.md` (operational procedure). Built from
`LEGAL_AND_COMPLIANCE_ROADMAP.md`.

## Legal pages

| Page | Route | Notes |
|---|---|---|
| Privacy Policy | `/privacy` | Public-facing policy. Keep aligned with `docs/PRIVACY.md`. |
| Terms of Service | `/terms` | Pre-existing; edit `SECTIONS` in `src/app/terms/page.tsx`. |
| Community Guidelines | `/community-guidelines` | Rules + consequences; links to reporting. |
| Cookie Policy | `/cookies` | Explains essential/preferences/activity/analytics(future) categories. |
| Copyright & Content Removal | `/copyright` | DMCA-style notice-and-counter-notice process. |
| Contact | `/contact` | General/support/business/bug channels + FAQ. |
| Security disclosure | `/security` | Pre-existing; vulnerability reporting scope. |

All are linked from the global `SiteFooter` (`src/components/layout/SiteFooter.tsx`),
mounted once in the root layout so every page gets it.

## Moderation & reporting workflow

Students and owners can report a **listing**, **review**, **owner**, or **student** via
the `ReportButton` → `ReportModal` pair (`src/components/reports/`). Reasons are scoped
per target type in `src/config/reports.ts` so the UI never offers a reason that doesn't
apply (e.g. "Fake listing" isn't offered when reporting a student).

Flow:

1. `fileReportAction` (`src/lib/report/actions.ts`) — requires a signed-in profile, rate
   limited (`LIMITS.report`: 10/5min), validates via `reportSchema` (Zod, cross-checks
   reason against target type), confirms the target actually exists and (for
   owner/student targets) has the right role, and blocks self-reports.
2. The report lands in the `Report` table with `status: OPEN`.
3. An admin reviews it at `/admin/reports` (filterable by status) and resolves or
   dismisses it via `resolveReportAction`, optionally with a resolution note.
4. Resolving a report writes a `REPORT_RESOLUTION` `ModerationEvent` — see Audit log
   below.

`docs/MODERATION.md` still governs the broader suspension/escalation procedure for
credible fraud/harassment reports; the `Report` table is the intake mechanism, not a
replacement for that judgment process.

## Verified Owner workflow (architecture, Phase 3)

Two ways an owner becomes verified:

1. **Plan assignment** — an admin assigns a pricing plan (`setOwnerPlanAction`); Advance
   and Premium plans grant the badge automatically (`config/pricing.ts`).
2. **Direct request** — an owner without a plan can request verification
   (`requestOwnerVerification`), setting `verificationRequestedAt` and
   `verificationStatus: PENDING`. An admin approves (`setOwnerVerifiedAction`, grants a
   30-day badge via `verificationExpiry`) or rejects (`rejectOwnerVerificationAction`,
   sets `verificationStatus: REJECTED` without granting the badge) from
   `OwnerVerificationPanel` on `/admin/owners/[id]`.

`Profile.verificationStatus` (`OwnerVerificationStatus`: `UNVERIFIED | PENDING | APPROVED
| REJECTED`) is deliberately a **separate concept** from
`src/lib/owner/verification.ts`'s `VerificationStatus` (`NONE | PENDING | VERIFIED |
EXPIRED`), which is a *derived* display state computed from `verified` +
`verifiedUntil` + `verificationRequestedAt` for the owner-facing UI. Don't rename one to
match the other without checking every import — the collision was caught once already.

Document uploads (business permit, valid ID, proof of ownership) are **not**
implemented — this is intentionally architecture-only per the roadmap ("do not require
uploads yet").

## Audit log workflow

Every privileged admin action writes a `ModerationEvent` (`recordModerationEvent`,
`src/lib/db/admin.ts`) alongside its `logSecurityEvent` call. Covered actions:
listing verify/status/feature/delete, owner verify/freeze/delete, review delete,
advertisement create/status/delete, report resolution.

`/admin/audit-log` (`src/app/admin/audit-log/page.tsx`) is a **read-only** viewer —
newest 200 events, no edit/delete UI, by design (it's an audit trail). Target ids are
scalar fields (not foreign keys) so the log survives deletion of the thing it describes.

## Privacy model

See `docs/PRIVACY.md` for the full data inventory and retention statement; `/privacy` is
the public-facing summary and must stay aligned with it. Cookie consent
(`src/lib/cookies/consent.ts`) is layered: a coarse `accepted | rejected | custom`
decision (so the banner doesn't reappear) plus granular per-category consent
(`preferences`, `activity`) used by "Customize". Every optional cookie helper checks its
own category before writing, and re-validates on read (Zod / allowlist / typed-array
filtering) since cookie values are client-editable.

## Security model

Full control list in `SECURITY.md`. Every new surface built for this roadmap
(`reports`, `verificationStatus`) follows the same pattern as the rest of the app:
`requireProfile`/`requireAdmin` gating, server-side Zod validation, rate limiting, RLS
enabled + anon/authenticated revoked on the new `reports` table, and no
`dangerouslySetInnerHTML` anywhere in the new UI.

## Future compliance considerations

- Analytics/advertising cookies, if ever added, must be gated behind a new consent
  category (the `activity`/`preferences` split in `consent.ts` is designed to extend)
  and documented on `/cookies` and `/privacy` before they're set.
- Document upload for owner verification (business permit / valid ID / proof of
  ownership) — schema is ready (`OwnerVerificationStatus`), storage/upload flow is not.
- Per-report-target rate limiting (e.g. cap reports against a single listing) if abuse
  of the report queue becomes a problem — not needed at current scale.
- Moving rate limiting to a shared Redis store, and adding real-user monitoring/error
  tracking, are launch-readiness items tracked in `PRODUCTION_CHECKLIST.md`, not legal
  ones, but both affect how reliably the workflows above can be operated.
