# Architecture

This document explains *how* Meino is put together and *why*. Read it once and the
folder layout should make sense.

## The layering rule

Data flows in one direction. Each layer only knows about the one beneath it:

```
UI (app/, components/)
      ↓ calls
hooks/                     React state logic
      ↓ calls
services/                  Business logic (availability, distance, ranking)
      ↓ calls
lib/db/                    Data access — the ONLY code that imports Prisma
      ↓
PostgreSQL (Supabase)
```

**The rule that keeps this honest:** nothing in `app/` or `components/` may import
Prisma. If a component needs data, it goes through a service. This is what stops a
1,000-line "God component" from forming and makes each piece testable on its own.

Two support layers sit beside the stack:

- `lib/validation/` — Zod schemas shared by client and server, so both validate the
  same way.
- `config/` — values that are true for *this deployment* (the campus), not logic.

## Why the view model is separate from the database row

The database stores `rooms` (capacity + occupied). The UI wants "3 available",
"7 minute walk", and a pin colour. Computing those in the component would mean every
component re-derives the same logic. Instead the **service layer** turns a
`BoardingHouse` row into a `ListingCard` / `ListingDetail` (see `src/types/listing.ts`)
with everything pre-computed. Components just render.

## Derived, never stored

Two things are always computed, never trusted from a raw column:

1. **Vacancy** — derived by summing rooms (`services/availability.ts`). A stored
   "vacancies" number could contradict the rooms; a derived one cannot.
2. **Availability freshness** — if an owner hasn't confirmed in 72 hours, the listing
   is flagged stale. This protects the core promise: *not outdated info*.

## Map provider abstraction (coming in M1)

The map will sit behind a thin provider interface so today's Leaflet + OpenStreetMap
can be swapped for Mapbox or Google Maps by changing one folder, not the whole app.

## Single-campus today, multi-campus later

We deliberately do **not** have a `Campus` table yet — scope is VSU Main only. Every
campus-specific value lives in `src/config/campus.ts`. When we expand, we add a
`Campus` model and a `campusId` foreign key on `BoardingHouse`; the config file becomes
a database lookup. Because nothing else hardcodes VSU, that change stays contained.

## Data model at a glance

`Profile` (student / owner / admin) → owns → `BoardingHouse` → has `Room`s (vacancy
source), `Image`s, `NearbyPlace`s, `Amenity` links, `Review`s, `Favorite`s,
`ViewingRequest`s, and `AnalyticsEvent`s. See `prisma/schema.prisma` for the full
definition.

## Environment & setup

1. Create a Supabase project.
2. Copy `.env.example` → `.env.local` and fill in the connection strings + API keys.
3. `npm run db:push` — create the tables.
4. `npm run db:seed` — load sample VSU-area listings.
5. `npm run dev`.
