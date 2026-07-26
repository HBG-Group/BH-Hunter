# Project Context — Meino

_The "what is this project?" document. Read this first._

## Project name

**Meino** (formerly "BH Hunter").

## What the platform is

Meino is a boarding-house discovery platform for students of **Visayas State University
(VSU)** in Baybay, Leyte. Students browse every boarding house around campus on one
interactive map — comparing prices, checking real vacancies, and seeing the walking time
to the main gate — without needing an account. Owners list their properties and keep
vacancies accurate; admins vet listings for trust before they go public.

The product is intentionally focused: only boarding houses near VSU, nothing else to sift
through. The name and voice lean into "finding a place that feels like home."

## Target users

- **Students** — the primary audience. Especially incoming freshmen who may not yet have
  a VSU email, so sign-up accepts any email.
- **Boarding-house owners** — local landlords who want their vacancies found.
- **Admins** — the developers/operators who verify listings and owners, moderate reviews,
  feature listings, and manage local ads. Currently the developer is the sole admin.

## Current features

**Discovery (public, no login):**
- Interactive Leaflet map of all published listings, list-first with the map below.
- Search + filters (price, walk time, gender policy, availability, amenities).
- Sort (recommended/price/distance/availability/rating/newest); featured listings float
  to the top of "recommended".
- "Load more" pagination (20 at a time) while the map keeps every pin.
- Listing detail: photo gallery, facts, amenities, availability, reviews, location map,
  nearby places, owner contact, and a Verified Owner badge when applicable.

**Students (signed in):**
- Favorites, compare saved listings, reviews (per-aspect ratings), viewing requests,
  room-available notifications and preferences.

**Owners:**
- Dashboard with per-listing analytics (views, contact clicks, favorites, requests).
- Create/edit listings, manage rooms (vacancy is derived from rooms), confirm vacancies.
- Photo upload (min 5 to submit/publish) via secure signed uploads, batch delete.
- Submit for review (PENDING) or pull back to DRAFT — owners can never self-publish.
- Free-listing quota banner (5 free; pricing beyond is scaffolded, off in Phase 1).

**Admins (login at `/admin`):**
- Overview queue of listings needing attention; full listings list with **All /
  Unverified / Unpublished** filters.
- Per-listing admin detail page showing all info + every photo (any status) for review.
- Verify listing, publish (requires verified + ≥5 real photos), feature, delete
  (permanent, cascades + removes stored photos).
- Verify owners (Verified Owner badge). Moderate/delete reviews.
- Advertisements: create (gallery image upload, up to 5), pause/resume, delete.

## Authentication flow

- Supabase Auth via `@supabase/ssr`. A `Profile` row (our table) shares its id with the
  Supabase `auth.users` id and is created on first access.
- Methods: email/password and Google OAuth. Any email is accepted (freshmen).
- `proxy.ts` (Next 16's middleware replacement) refreshes the session cookie and guards
  `/owner`. The `/admin` area guards itself (renders its own sign-in form).
- Redirect targets are always validated (`safeRedirectPath`) to prevent open redirects.
- OAuth and confirmation-email links resolve to a canonical site origin so they don't
  land on localhost. See `ARCHITECTURE.md`.

## Roles

`Profile.role` is `STUDENT | OWNER | ADMIN`.

- **Student** — browse freely; favorites/reviews/viewings require sign-in.
- **Owner** — manages only their own listings (every write scoped by `ownerId`).
- **Admin** — platform-wide moderation. Promoted manually via `npm run make-admin`;
  there is no public admin sign-up.

Guards: `requireProfile`, `requireOwner`, `requireAdmin`, plus `getAdminOrNull` for the
inline `/admin` login.

## Technology stack

- **Next.js 16.2.10** (App Router, Turbopack), **React 19.2.4**, **TypeScript**.
- **Tailwind CSS v4** with `@theme` design tokens (terracotta on stone neutrals).
- **Prisma 6** ORM over **Supabase Postgres**.
- **Supabase** Auth + Storage (public `listing-photos` bucket, MIME + 5 MB enforced).
- **Leaflet + react-leaflet v5** + `leaflet-gesture-handling` for maps.
- **framer-motion** for animation, **geist** self-hosted font, **zod** for validation.

## Architecture overview

Strict layering — see `ARCHITECTURE.md` for detail:

```
app/ + components/   UI (never import Prisma)
      ↓
hooks/               client state & upload orchestration
      ↓
services/            view-model shaping (availability, distance, sorting)
      ↓
lib/db/ (Prisma)     the only place that touches the database
lib/security/        redirect, url, upload-ticket, rate-limit, errors
```

Authorization lives in the app/action layer because Prisma connects as the database
owner and bypasses RLS. RLS is still enabled deny-all on every table as defence in depth.

## Security overview

Layered and audited (full detail in `SECURITY.md`): validated redirects, https-only URL
allowlist, HMAC-signed upload tickets, bucket-enforced MIME/size + server re-inspection,
unique image URLs (replay protection), rate limiting, generic error messages, server-only
secrets, and RLS enabled on all tables.

## Current project status

- **Pre-production, security-hardened.** A full engineering audit (`docs/AUDIT.md`) and a
  dedicated hardening pass were completed; RLS is enabled on all tables.
- Rebranded from BH Hunter to Meino (name, terracotta palette, doorway logo).
- Monetization is **scaffolded but off** (`BILLING_ENABLED = false`) — Phase 1 is free.
- Database is live on Supabase (ref `qcrkhrhqugdyyliaevzf`); QA accounts exist.
- Deploys to Vercel from the `develop` branch. Work is committed on request only.
