# Production Readiness Checklist — Meino

Working checklist for taking Meino from pre-production to a public launch. Check items
off in `git` history / PR descriptions rather than editing checkmarks into this file —
this document should describe *what* to verify, not track state over time.

## Environment variables

All required in production (see `.env.example` for the full list and format):

- `DATABASE_URL` — pooled connection (pgbouncer, port 6543)
- `DIRECT_URL` — direct connection (port 5432), used by Prisma migrations
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — public, safe to expose
- `SUPABASE_SERVICE_ROLE_KEY` — server-only, never exposed to the browser
- `NEXT_PUBLIC_SITE_URL` — **required** in production, HTTPS only (`requireProductionSiteUrl`
  throws at request time if missing or non-HTTPS)
- `UPLOAD_TICKET_SECRET` — **required** in production, dedicated random secret for the
  HMAC upload-ticket signature (rotate independently of the service-role key)
- `ADMIN_HOST` — optional; set to serve `/admin` on its own subdomain instead of the
  main site
- `RESEND_API_KEY`, `RESEND_FROM` — outbound email (payment/notification mail)
- `DEV_TUNNEL_HOST` — local development only, never set in production

Vercel must have every one of these set per environment (Production/Preview) — a
missing var fails the build, per `CLAUDE.md`.

## Supabase

- Confirm RLS is enabled on **every** `public` table (deny-all is the intended state —
  the app connects via Prisma with the database owner role, which bypasses RLS; the
  anon/authenticated API roles must never read/write directly). Verify with
  `SELECT relname, relrowsecurity FROM pg_class WHERE relkind='r'` or the Supabase
  advisors tool.
- Confirm no `GRANT` exists for `anon`/`authenticated` on any table
  (`information_schema.role_table_grants`).
- Storage bucket (`listing-photos`) MIME allowlist is jpeg/png/webp only, 5 MB limit,
  enforced at the bucket level (not just app code).
- Schema changes go through `prisma db push` (this project has no
  `_prisma_migrations` history table) followed by manually enabling RLS + revoking
  anon/authenticated grants on any new table — `db push` does neither automatically.

## Redis

- Rate limiting currently runs on a Postgres-backed fixed-window counter
  (`rate_limit_windows` table via `lib/security/rate-limit.ts`), not Redis. This is
  already shared across serverless instances (unlike an in-memory counter), so Redis
  is a future upgrade for latency, not a launch blocker. See `SECURITY.md` → Future.

## Vercel

- All environment variables set for Production (see above).
- `ADMIN_HOST` decision made: either leave blank (admin at `/admin` on the main
  domain) or point a subdomain at the deployment and set it.
- Confirm the production branch is `main` (per `PROJECT_CONTEXT.md`) and that preview
  deployments don't leak production secrets.

## Authentication

- Supabase Auth email templates configured with the production site URL (not
  localhost).
- Custom SMTP configured for auth email if the default Supabase rate limit is a
  concern at launch scale (`PROJECT_CONTEXT.md` placeholder).
- Confirm Google OAuth redirect URIs include the production origin.
- Confirm no ADMIN role is reachable through sign-up (`signUpAction` coerces role to
  STUDENT/OWNER; admins are promoted via `npm run make-admin` only).

## Storage

- Confirm signed upload tickets expire (15 min) and are HMAC-verified with
  `timingSafeEqual`.
- Confirm re-inspection of uploaded file MIME/size happens server-side after upload,
  not just at ticket-issue time.
- Confirm storage cleanup runs on listing/owner/ad deletion (best-effort — verify no
  orphaned objects accumulate over time).

## Security

- Full control list lives in `SECURITY.md` — re-read it before launch and confirm
  every control is still true of the code, not just documented.
- CSP: production must **not** include `unsafe-eval` (`contentSecurityPolicy` only
  adds it outside production — verify the built response headers on a production
  deploy, not just locally).
- Confirm `Strict-Transport-Security` is present on production responses only.
- Confirm rate limits are appropriate for expected launch traffic (see
  `LIMITS` in `lib/security/rate-limit.ts`).
- Run `security-review` (this repo's review skill) on the final pre-launch diff.

## Backups

- Confirm Supabase's automatic backup schedule and retention window for the project
  tier in use.
- Document (outside the repo, per `docs/PRIVACY.md`) how a restore would be performed
  and how long deleted-account data can persist in a backup.

## Monitoring

- No dedicated APM/error-tracking service is wired in yet. At minimum, watch Vercel's
  function logs and Supabase's dashboard (connections, slow queries) post-launch.
- Consider adding an error-tracking integration (e.g. Sentry) before scaling past the
  initial launch — not currently required to ship.

## Logging

- Security events (`logSecurityEvent`) and moderation events (`ModerationEvent` /
  `/admin/audit-log`) already cover privileged actions. Confirm log volume/retention
  is acceptable for the hosting plan (`console.info` JSON lines today, no external
  sink).

## Analytics

- `AnalyticsEvent` (views, contact clicks, favorites, viewing requests) already
  powers owner dashboards. No third-party analytics/tracking script is wired in —
  if one is added later, it must be gated behind cookie consent (see
  `lib/cookies/consent.ts`, which already has an "Activity" category reserved) and
  documented on `/cookies` and `/privacy`.

## Deployment checklist

1. All env vars set for the target environment.
2. `npx tsc --noEmit`, `npx eslint src`, `npm run build` all pass.
3. `prisma db push` applied against the target database if the schema changed, with
   RLS + revoke run manually for any new table.
4. Confirm `config/billing.ts` → `BILLING_ENABLED` matches the intended launch phase
   (Phase 1 = free, stays `false`).
5. Smoke test: sign up, browse, favorite, request a viewing, leave a review, file a
   report, sign in as admin and resolve it.
6. Confirm the cookie banner appears once, Accept/Reject/Customize all work, and
   `/cookies`, `/privacy`, `/terms`, `/community-guidelines`, `/copyright`, `/contact`
   all render.

## Manual QA checklist

- [ ] Student: sign up, browse map + list, filter, favorite, compare, review, request
      a viewing, receive a room-available notification, delete account.
- [ ] Owner: sign up, create a listing, upload 5+ photos, submit for review, get
      verified/published by an admin, confirm vacancy, view analytics, request
      verification badge.
- [ ] Admin: verify + publish a listing, feature a listing, assign a plan, freeze/
      unfreeze an owner, delete a review, resolve a report, approve/reject a
      verification request, read the audit log.
- [ ] Reporting: file a report as a student against a listing/review/owner and as an
      owner against a student; confirm it appears in `/admin/reports` and resolving
      it updates the audit log.
- [ ] Accessibility: keyboard-only pass through the cookie banner, report modal, and
      sign-in modal; screen-reader spot check on the legal pages.
- [ ] Mobile: header nav, cookie banner, footer, and report modal all usable on a
      small viewport.

## Rollback plan

- Vercel keeps prior deployments — a bad production deploy can be rolled back to the
  previous deployment from the Vercel dashboard immediately (no code change needed).
- Database changes are additive-only so far (new tables/columns with defaults); if a
  schema change needs reverting, write the inverse `ALTER TABLE`/`DROP` manually
  (`prisma db push` doesn't generate down-migrations since there's no migration
  history table) and confirm no code on the rolled-back deployment still references
  the removed column/table.
- Keep `context/CHANGELOG.md` and this checklist's "Deployment checklist" as the
  source of truth for what shipped, so a rollback decision can be made quickly.
