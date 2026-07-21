# Meino — Security Model

How the app defends itself, and the two things that must be done outside the codebase.

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

### Errors and logging — `lib/security/errors.ts`

Actions return a generic message plus a short reference; the real error, including the
stack, is logged server-side only. Prisma codes, Supabase messages and connection
strings never reach the browser. `signInAction` deliberately returns "Incorrect email or
password" for every failure so it can't be used to enumerate accounts. There are no
`console.log` calls in `src/`; nothing logs passwords, tokens or cookies.

### Secrets

Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are public — both
intended to be. `SUPABASE_SERVICE_ROLE_KEY` and `UPLOAD_TICKET_SECRET` are guarded by
`import "server-only"`. Verified: the built client bundle contains no service key,
ticket secret, or database URL, and no client component imports a server-only module.
