# Meino

A boarding house discovery platform for students of **Visayas State University (VSU)
Main Campus**, Baybay, Leyte. Find available boarding houses on an interactive map:
compare prices, check real vacancies, see amenities, and view walking distance to campus.

> Full product vision and requirements live in [`docs/PROJECT_BRIEF.md`](docs/PROJECT_BRIEF.md).
> Architecture notes live in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Tech stack

| Layer     | Choice                                        |
| --------- | --------------------------------------------- |
| Framework | Next.js (App Router) + React + TypeScript     |
| Styling   | Tailwind CSS + Framer Motion                  |
| Map       | Leaflet + OpenStreetMap (swappable provider)  |
| Database  | Supabase (PostgreSQL)                         |
| ORM       | Prisma                                        |
| Auth      | Supabase Auth                                 |
| Storage   | Supabase Storage                              |
| Hosting   | Vercel                                        |

## Project structure

```
src/
  app/            Routes and pages (thin — no business logic)
  components/     Reusable UI, grouped by feature
  hooks/          Reusable React state logic
  services/       Business logic (availability, ranking, distance)
  lib/
    db/           Prisma client + data-access (the ONLY place that talks to the DB)
    validation/   Zod schemas shared by client and server
    utils/        Pure helper functions
  config/         campus.ts — VSU-specific settings (map center, gate, radius)
  types/          Shared TypeScript types
prisma/
  schema.prisma   Database schema
  seed.ts         Seed data
```

**The one rule that keeps this clean:** `app/` and `components/` never import Prisma.
Data flows `UI → hooks → services → lib/db → database`.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase credentials
npm run dev                  # http://localhost:3000
```

## Roadmap (milestones)

- **M0 — Foundation** ✅ scaffold, folder structure, Prisma schema, seed data, campus config
- **M1 — Discovery** interactive map, listings, filters, detail pages (read-only MVP)
- **M2 — Owner side** auth, owner dashboard, listing management, vacancy updates
- **M3 — Student accounts** favorites, compare, viewing requests, reviews
- **M4 — Admin + polish** verification, moderation, analytics, 360° tours
