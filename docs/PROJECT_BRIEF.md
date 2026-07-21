# Meino — Original Project Brief

> This is the founding brief for the project, preserved verbatim in intent. It is the
> source of truth for the product vision. The root `README.md` is the developer-facing
> readme; this file is the product spec.

## Project Vision

Meino is a modern boarding house discovery platform specifically designed for
students of Visayas State University (VSU) Main Campus in Baybay, Leyte, Philippines.

Every semester, hundreds of students struggle to find available boarding houses.
Currently they rely on Facebook posts, Messenger chats, walking around Baybay, and
asking friends. This process wastes time and often results in outdated information.

Meino aims to become the official digital directory of boarding houses surrounding
VSU. Think of it as: Airbnb + Google Maps + University Housing Portal.

## Primary Goals

Students should be able to: discover boarding houses nearby, compare prices, check
availability, see amenities, explore rooms, view walking distance, contact owners,
save favorites, and compare listings.

Boarding house owners should be able to: manage listings, update vacancies, upload
photos, edit pricing, receive inquiries, and see analytics.

## Design Philosophy

The website MUST NOT feel like a generic template. It should feel premium, modern,
minimal, fast, interactive, and professional — Apple-level polish, Stripe-quality
animations, Google-level usability, Airbnb-quality UX. No AI slop. Avoid generic
Bootstrap cards. Every interaction should feel intentional.

## Target Users

- **Primary:** VSU students, incoming freshmen, transfer students, graduate students, parents.
- **Secondary:** Boarding house owners, landlords, property managers.

## Project Phases

- **Phase 1 (MVP):** Discovery platform — interactive map, search, filters, listings,
  details page, photo gallery, availability status, owner contact, distance to VSU,
  mobile responsive.
- **Phase 2:** Owner dashboard, authentication, listing management, analytics, vacancy updates.
- **Phase 3:** Student accounts, favorites, reviews, viewing appointments, notifications.
- **Phase 4:** 360° room walkthrough, interactive virtual tour, nearby establishments,
  heatmap, advanced analytics.

## Core Features

**Boarding House Profile** — Name, Owner, Contact Number, Messenger, Email, Address,
GPS Coordinates, Price, Advance payment, Deposit, Utilities included, Internet, Gender,
Capacity, Current Occupancy, Remaining Vacancies, Curfew, House Rules, Amenities,
Nearby Places, Photos, 360 Tour.

**Availability** — Display available rooms, occupied rooms, remaining capacity.
Example: "20 Rooms, 17 Occupied, 3 Available" with "Updated 2 hours ago".

**Search Filters** — Rent, Distance, Available Only, Male, Female, Mixed, WiFi, Aircon,
Parking, Laundry, Kitchen, Pets, Visitors, Curfew, Study Area, Private Bathroom,
Shared Bathroom.

**Map** — Homepage immediately displays an interactive map. Each boarding house is a
colored pin: Green = Available, Yellow = Almost Full, Red = Fully Occupied. Clicking a
marker opens a floating info panel with photo, price, vacancies, walking time,
amenities, favorite button, and view details button.

**Distance** — Instead of "2.1 km", show "7 minute walk" / "3 minute motorcycle ride".

**360 Tour** — Every boarding house can upload 360 room photos, 360 hallway, 360
exterior. Users can freely look around. Future support for full 3D walkthrough.

**Owner Dashboard** — Update vacancies, upload photos, change pricing, modify amenities,
respond to inquiries, view statistics.

**Student Dashboard** — Save favorites, compare listings, book viewing schedule, leave
reviews, track viewed listings.

**Reviews** — Students may review after verification. Display overall rating,
cleanliness, internet, safety, noise level, water supply, owner friendliness.

**Analytics** — Owner dashboard shows profile views, contact clicks, favorites, viewing
requests, occupancy history.

**Nearby Establishments** — Laundry, convenience store, café, water refill, printing
shop, pharmacy, ATM, jeepney stop, clinic — with walking distance for each.

## Interactive Experience

Smooth page transitions, floating glass UI, micro animations, animated map pins, hover
interactions, smooth image loading, parallax effects, floating search panel, animated
statistics, modern loading states, beautiful empty states, elegant modals, premium
typography.

## Design Style

Minimal, luxury — Apple, Airbnb, Notion, Stripe, Framer. Avoid the Bootstrap look,
template appearance, rounded colorful blobs, and cheap gradients.

## Tech Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS, Framer Motion.
- **Map:** Leaflet with OpenStreetMap initially. Architecture must allow future
  migration to Mapbox or Google Maps without major refactoring.
- **Backend:** Supabase (Postgres) + Prisma ORM.
- **Auth:** Supabase Auth (chosen over NextAuth/Clerk for a single coherent backend).
- **Storage:** Supabase Storage.
- **Deployment:** Vercel.

## Database Entities

Users, Owners, Boarding Houses, Rooms, Availability, Amenities, Images, Reviews,
Favorites, Viewing Requests, Nearby Establishments, Analytics, Notifications.

## Non-Functional Requirements

Fast, SEO optimized, accessible (WCAG), responsive, offline-friendly where possible,
scalable, maintainable, modular, secure.

## Future Expansion

The system should not be hardcoded for VSU. Although the first deployment is for VSU
Main Campus, the architecture should allow expansion to multiple universities, cities,
provinces, and campuses without major rewrites. Campus-specific settings (maps,
landmarks, categories, branding, service radius) should be configurable.

> **Current scope decision:** Start small — VSU Main Campus only. All campus-specific
> values are centralized in `src/config/campus.ts` so a future multi-campus refactor is
> localized rather than scattered.

## Engineering Standards

- **Audience:** Built by sophomore CS students. Write code as if mentoring, not just producing.
- **File size:** Target 100–150 lines/file; avoid exceeding 200 unless necessary. Split
  large components into folders of focused files.
- **Separation of concerns:** UI, business logic, database access, API calls, validation,
  types, utilities, configuration, and constants are kept in separate layers.
- **Comments:** Short, natural, only where they add value. No AI-style narration.
- **Readability:** Descriptive names (`availableRooms`, `walkingDistance`), no cryptic abbreviations.
- **Function size:** Prefer under 30–40 lines; refactor large functions into helpers.
- **Reusability:** No duplicate code — reusable components, hooks, utilities, schemas, API helpers.
- **No placeholders:** No mock data, stubs, or TODO comments unless explicitly requested.
  Implement the necessary foundation instead of leaving stubs.
- **Uncertainty:** When a design decision is unclear, stop and explain tradeoffs before proceeding.
