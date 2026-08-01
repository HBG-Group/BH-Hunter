# Meino — Security Model

How the app defends itself, what is enforced in-repo, and which launch blockers still
require external evidence.

## Auth redirect configuration (fixes the localhost redirect)

Google sign-in and confirmation-email links are controlled by Supabase, not just by
the app. When Supabase receives a `redirectTo` that isn't in its allowlist, it silently
falls back to the **Site URL** — if that's `http://localhost:3000`, every user lands on
localhost. Set both, in **Supabase → Authentication → URL Configuration**:

1. **Site URL** → the production origin, e.g. `https://meino.vercel.app`.
2. **Redirect URLs** allowlist → add the production and preview callbacks:
   - `https://meino.vercel.app/auth/callback`
   - `https://*.vercel.app/auth/callback` (preview deployments)
   - `http://localhost:3000/auth/callback` (local dev)

Then set **`NEXT_PUBLIC_SITE_URL`** in the Vercel project env to the canonical
production origin. In production builds this is now **mandatory** and must be HTTPS.
The app uses it to build the OAuth `redirectTo` and the confirmation-email link, so
both always point at the canonical site regardless of which host served the request.

Also confirm the Google OAuth client's **Authorized redirect URI** (Google Cloud
Console) is the Supabase callback: `https://<ref>.supabase.co/auth/v1/callback`.

## Manual steps required before launch

1. **Enable Row Level Security** on every table in the `public` schema, with **no
   permissive policies** (deny-all). Prisma connects as the database owner and bypasses
   RLS, so the app is unaffected — but the anon key is public, and without RLS anyone can
   read and write the tables directly through the Supabase REST API, bypassing every
   check in this codebase. **This is the single highest-impact item and it cannot be
   fixed in code.**
2. **Apply the schema changes**: `npm run db:push`. This adds four indexes and a unique
   constraint on `Image.url`. If the push fails on the unique constraint, duplicate image
   rows already exist and must be de-duplicated first.
3. **Set `UPLOAD_TICKET_SECRET` in production.** The app now refuses to sign upload
   tickets in production without a dedicated secret, so the service-role key no longer
   doubles as ticket-signing material.
4. **If using a development tunnel locally, set `DEV_TUNNEL_HOST`.** Server Actions no
   longer trust `*.devtunnels.ms` by wildcard.

The photo bucket's MIME and size limits are applied automatically on the next upload
(`ensureBucket` calls `updateBucket` when it finds the constraints missing).

## Layers

### Redirects — `lib/security/redirect.ts`

Every user-influenced redirect target passes `safeRedirectPath()`. It accepts only
single-slash relative paths and rejects absolute URLs, protocol-relative URLs,
backslash variants, control characters, all schemes, and `/auth/callback`. Crucially it
re-checks **after** URL normalisation, because `/..//evil.com` collapses to
`//evil.com`.

Applied at: `lib/auth/actions.ts`, `app/auth/callback/route.ts`, `app/login/page.tsx`,
`lib/auth/profile.ts`, `lib/auth/oauth.ts`, `components/auth/SignInModal.tsx`, `proxy.ts`.

### URLs — `lib/security/url.ts`

Allowlist, not blocklist: `https:` only (`http:` outside production). Rejects
`javascript:`, `data:`, `blob:`, `file:`, `vbscript:`, `ftp:`, and URLs carrying
userinfo (`https://evil.com@real.com`). Enforced twice — in `listingSchema` on write,
and in `ContactButtons` on render, so rows stored before the rule tightened are still
safe. `tel:` and `mailto:` hrefs are separately pattern-checked.

There is no `dangerouslySetInnerHTML` anywhere; all user text goes through React
escaping.

### Uploads — three layers

1. **Client** (`PhotoManager`) — `accept` is the MIME allowlist; type, size and empty
   files are checked before any network call. UX only.
2. **Server** (`prepareUploadsAction`) — verifies ownership, batch size, declared MIME
   against the allowlist, and size. The **extension comes from the allowlist, never from
   the filename**, and the storage path is generated server-side.
3. **Storage** — the bucket carries `fileSizeLimit` and `allowedMimeTypes`, so Supabase
   rejects the signed PUT itself. A tampered client cannot get past this.

SVG is deliberately excluded: it can carry scripts and would be served from our storage
domain.

### Photo registration — `lib/security/upload-ticket.ts`

A path is only accepted if it arrives inside an HMAC-signed ticket that the server
issued. The signature covers path + ownerId + listingId + expiry, is compared with
`timingSafeEqual`, and expires after 15 minutes. Registration additionally:

- re-checks the path is inside the listing's own folder and contains no `..`
- confirms the object **exists in Storage** and inspects its **actual** size and MIME
- deletes the object and refuses if it isn't a real allowed image
- skips URLs already registered (`Image.url` is unique), so a replayed ticket cannot
  create a second row

Verified by test: forged signatures, tampered paths, cross-listing paths, owner swaps,
extended expiries, traversal and malformed claims are all rejected.

### Publishing gate

`MIN_LISTING_PHOTOS = 5`, enforced at four levels: the owner's submit-for-review action,
the admin publish action, image registration, and **Storage verification** —
`checkListingPhotos()` counts only photos that genuinely exist in the bucket and hold
allowed image bytes. Fabricated `Image` rows cannot satisfy the minimum. Progress is
shown as `N / 5 uploaded`.

### Authorization

- Prisma bypasses RLS, so authorization lives in the action layer and is uniform:
  `requireOwner` / `requireProfile` / `requireAdmin`, plus owner-scoped `where` clauses.
- Every owner write is scoped by `ownerId` and now **honours the returned count** rather
  than assuming success.
- Student writes (`favorite`, `review`, `viewing`) confirm the listing exists and is
  `PUBLISHED` before writing — client-supplied ids are never trusted.
- Sign-up coerces role to `OWNER`/`STUDENT` before validation, so `ADMIN` is
  unreachable. Admins are promoted only via `npm run make-admin`.

### Rate limiting — `lib/security/rate-limit.ts`

Fixed-window counters keyed by profile id (or IP when anonymous): auth 8/min,
reviews 5/min, viewings 5/5min, favorites 60/min, analytics 40/min, uploads 30/5min,
generic writes 20/min.

**Known limitation:** this is per-instance memory. On Vercel it dampens abuse per warm
instance rather than globally. Move the store to Upstash Redis if the platform grows.

### Browser protections â€” `next.config.ts`

Every route now emits a baseline set of browser hardening headers:

- `Content-Security-Policy`
- `frame-ancestors 'none'` via CSP, plus `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`
- `Strict-Transport-Security` in production only

Server Actions now trust only `localhost:3000` plus an explicit `DEV_TUNNEL_HOST` in
non-production development. The previous unconditional `*.devtunnels.ms` wildcard was
removed.

### Errors and logging — `lib/security/errors.ts`

Actions return a generic message plus a short reference; the real error, including the
stack, is logged server-side only. Prisma codes, Supabase messages and connection
strings never reach the browser. `signInAction` deliberately returns "Incorrect email or
password" for every failure so it can't be used to enumerate accounts. There are no
`console.log` calls in `src/`; nothing logs passwords, tokens or cookies.

### Secrets

If a service credential, deployment token, database URL, or upload-ticket secret is
suspected to be exposed:

1. Disable or rotate the affected credential in its provider before changing code.
2. Replace its value in each applicable Vercel environment without disclosing the value.
3. Redeploy and verify the affected integration with the new credential.
4. Invalidate affected Supabase sessions when an authentication or service credential is involved.
5. Record the incident, scope, rotation time, validation result, and follow-up work in
   the security register; review logs for misuse before closing it.

Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are public — both
intended to be. `SUPABASE_SERVICE_ROLE_KEY` and `UPLOAD_TICKET_SECRET` are guarded by
`import "server-only"`. Verified: the built client bundle contains no service key,
ticket secret, or database URL, and no client component imports a server-only module.
