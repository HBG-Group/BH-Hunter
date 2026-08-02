# Security — Meino

Every security control already implemented, why it exists, and where it lives. A full
audit is in `docs/AUDIT.md`; the hardening detail in `docs/SECURITY.md`. **Never remove or
weaken any of these.**

## Implemented controls

### ✓ RLS enabled on all tables
**Why:** Prisma connects as the database owner and bypasses RLS, so authorization lives in
the app. But the public **anon key** could otherwise read/write tables directly through
the Supabase REST API, bypassing every app check. RLS enabled deny-all closes that door;
the app is unaffected because it uses Prisma. Verified: all `public` tables (including
`subscriptions` and `advertisements`) have `relrowsecurity = true`.
**Rule:** every new table must have RLS enabled — `db:push` does not do this.

### ✓ HMAC upload tickets — `lib/security/upload-ticket.ts`
**Why:** the browser uploads photos directly to Storage, so the server must be sure a
later "register this path" call refers to a file *it* authorized. Each ticket is an
HMAC-SHA256 signature over `path + ownerId/adminId + scope + expiry`, compared with
`timingSafeEqual`, expiring in 15 minutes. This stops path forgery, cross-owner/cross-
listing IDOR, and replay of another user's file. Storage paths and extensions are
server-chosen, never from the filename.

### ✓ Upload validation (server) — `photo-actions.ts`, `ad-upload-actions.ts`, `ad-actions.ts`
**Why:** client checks are UX only and trivially bypassed. The server validates declared
files on prepare, then after upload **re-inspects the actual stored object's MIME and
size** and discards anything that isn't a genuine image within limits.

### ✓ MIME validation — `config/storage.ts` + bucket `allowedMimeTypes`
**Why:** to prevent HTML/SVG/script or executable uploads served from our storage domain.
Allowlist is jpeg/png/webp only. **SVG is deliberately excluded** — it can carry scripts.
Enforced client-side (`accept`), server-side, and by the bucket itself.

### ✓ File-size validation — 5 MB, `config/storage.ts` + bucket `fileSizeLimit`
**Why:** to stop storage-quota exhaustion (a cost attack) and oversized payloads. The
bucket rejects the signed PUT itself, so a tampered client can't get past it.

### ✓ HTTPS allowlist for URLs — `lib/security/url.ts`
**Why:** owner/ad links (messenger, website, etc.) are rendered as `href`s. A raw
`.url()` accepts `javascript:` and `data:` — stored XSS. The allowlist permits only
`https:` (http outside production), rejecting `javascript:`, `data:`, `blob:`, `file:`,
`vbscript:`, `ftp:`, and userinfo tricks (`https://evil@real`). Enforced on **write**
(Zod refine) and again on **render** (`safeExternalUrl`), so pre-existing rows are safe.

### ✓ XSS prevention
**Why:** protect students from script running in their authenticated session. React
escaping is preserved everywhere; there is **no `dangerouslySetInnerHTML`** in the code.
Combined with the URL allowlist above and `rel="noopener noreferrer sponsored"` on ad
links.

### ✓ Open-redirect prevention — `lib/security/redirect.ts`
**Why:** an unchecked `?next=` lets an attacker send a user from the real login to a
phishing clone. `safeRedirectPath` accepts only single-slash relative paths, rejects
absolute/protocol-relative/backslash/scheme/control-char inputs, and re-checks after URL
normalization (`/..//evil.com` → `//evil.com`). Applied at login, the OAuth callback,
`proxy.ts`, `requireProfile`, and the sign-in modal.

### ✓ Unique image URLs — `Image.url @unique`
**Why:** even with a valid ticket, a replay must not create a second `Image` row (which
could fake the 5-photo publish requirement). The unique constraint makes registration
idempotent per object.

### ✓ Rate limiting — `lib/security/rate-limit.ts`
**Why:** to blunt credential stuffing, review/viewing spam, favorite-toggle loops, and
unbounded analytics writes. Fixed-window counters keyed by profile id (or IP for
anonymous): auth 8/min, reviews 5/min, viewings 5/5min, favorites 60/min, analytics
40/min, uploads 30/5min, generic writes 20/min. **Known limitation:** in-memory, so
per-instance on serverless — see "Future" for the Redis upgrade.

### ✓ Secure authentication
**Why:** protect accounts and avoid enumeration. Supabase Auth; server-side Zod on
sign-in/up; `signInAction` returns a uniform "Incorrect email or password" so it can't be
used to probe which emails exist; role is coerced to STUDENT/OWNER before validation so
ADMIN is unreachable via sign-up (admins only via `npm run make-admin`); redirects
validated; `/admin` self-gates with an inline login and no data leak to non-admins.

### ✓ Server-only secrets & safe errors
**Why:** keep the service-role key and ticket secret off the client, and keep DB/Supabase
internals out of user-facing errors. `lib/supabase/admin.ts` and the security modules use
`import "server-only"`. `guarded`/`reportError` return a generic message + reference id;
the real error and stack are logged server-side only. Only `NEXT_PUBLIC_*` values reach
the browser.

### ✓ Consent-gated preference cookies — `lib/cookies/`
**Why:** cookies remember search filters, recently viewed listings, dismissed notices, and
UI prefs — never anything sensitive. Auth cookies are managed entirely by Supabase
`@supabase/ssr` and this module never touches them. Every optional cookie write checks
`hasOptionalConsent()` first (rejecting clears them immediately); on **read**, values are
re-validated (Zod for filters, allowlisted tokens for theme/language/map style, filtered
typed arrays for lists) so a tampered cookie can never inject an unexpected shape into app
state — same "never trust client input" rule as server actions, just applied client-side.
Values are size-capped before writing (well under the ~4KB browser limit) and set with
`SameSite=Lax` plus `Secure` on HTTPS.

## Authorization model

Prisma bypasses RLS, so authorization is enforced in the app layer and is uniform:
`requireProfile` / `requireOwner` / `requireAdmin` (+ `getAdminOrNull` for `/admin`).
Every owner write is scoped by `ownerId` and honours the returned row count. Student
writes verify the target listing exists and is `PUBLISHED`. Admin actions are
admin-only, and don't throw on missing rows (they report cleanly).

## Future security ideas

- Move rate limiting to a shared store (Upstash Redis) so limits are global, not
  per-instance.
- Add explicit RLS **policies** (not just deny-all) if any client ever reads Supabase
  directly instead of through the app.
- Consider gating reviews on a completed viewing request to further reduce fake reviews.
- Periodic cleanup of old `analytics_events`; per-session view de-duplication.
- Automated dependency/advisory checks in CI; security regression tests for the
  redirect, URL, and upload-ticket helpers (these already have manual bypass tests).
