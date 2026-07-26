# Vision — Meino

_Every future feature should align with this document._

## Why Meino exists

Finding a boarding house near VSU is genuinely painful. Students scroll scattered
Facebook groups, chase dead posts, message owners to ask "is this still available?", and
walk around Baybay in the heat to see places in person. Information is stale, spread out,
and impossible to compare. Meino exists to put **every option in one trustworthy place**,
so a student spends less time hunting and more time settling in.

## Problems it solves

- **Fragmentation** — listings live in many places; Meino gathers them onto one map.
- **Stale vacancies** — owners confirm availability, and vacancy is derived from real
  rooms, so a "green" pin means a room is actually open.
- **No way to compare** — price, walk time, amenities, and reviews side by side.
- **Trust** — admin verification of listings and owners, so students aren't misled.
- **Distance uncertainty** — every listing shows honest walking minutes to the main gate.

## Design philosophy

- **Calm, premium, and focused.** The feel is closer to Airbnb/Linear/Apple than a
  classifieds board. Warmth over flash — the palette is terracotta on stone neutrals,
  evoking home, not a tech dashboard.
- **Content first.** Listings are the hero; chrome recedes. Empty states are intentional
  and kind, never a jarring "no results."
- **Honesty.** The product never fakes availability, reviews, or trust signals. Verified
  means verified.

## UI philosophy

- One clear primary action per surface. No gradients, glassmorphism, or neon.
- Consistent design tokens (`@theme`) — colour, type scale, spacing defined once.
- Motion is subtle and purposeful (page fades, a route-progress bar, gentle card entrance)
  and always respects `prefers-reduced-motion`.
- Feedback for every interaction: pending states, skeletons on load, success confirmation.

## Mobile-first philosophy

Most VSU students browse on phones, often on slow connections. So:
- Layouts are designed for small screens first, then enhanced for larger ones.
- The map sits below the list on mobile with a quick jump link; two-finger gestures keep
  page scrolling from being trapped.
- Touch targets are generous; nothing important hides behind hover.

## Performance philosophy

Perceived speed matters more than raw benchmarks on the connections students use.
- Skeletons instead of blank pages; modern image formats (AVIF/WebP); lazy-loaded map and
  images; "Load more" so the first paint is light.
- The database is never touched from the UI layer — reads are shaped once in services and
  are ready to be cached (see `PERFORMANCE.md`). Ancillary features (ads) fail safe and
  never take down the page.

## Future expansion beyond VSU

The architecture is deliberately single-campus today (campus settings live in
`config/campus.ts`, not a table) but built to grow. Expanding to another university means
adding a `Campus` model and a `campusId` on `BoardingHouse` — nothing else structural has
to change. The long-term vision is a network of campus-focused housing directories, each
as trustworthy and local as the VSU one.

## Business vision

Start free to earn trust and build density (Phase 1). Once the platform is genuinely
useful to students and owners, introduce fair, low-friction monetization that owners
happily pay because it brings them tenants: a modest owner subscription, small per-listing
fees beyond a generous free tier, verified-owner status, featured placement, and relevant
local advertising. Students always browse free. See `BUSINESS_MODEL.md` and `ROADMAP.md`.
Monetization must never degrade the student experience or the honesty of trust signals.
