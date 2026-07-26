# Roadmap — Meino

The phased plan. Every feature and business decision should fit here. Pricing rationale
lives in `BUSINESS_MODEL.md`; this document is the sequence.

## Phase 1 — Current (Free)

**Everything is free.** A ~1-month testing period to collect owner and student feedback
and build listing density.

- No monetization, no payment gateway, no listing restrictions enforced.
- The billing architecture exists but is switched off: `config/billing.ts` has
  `BILLING_ENABLED = false`. The owner listing-quota banner is shown for transparency but
  never blocks creating a listing.
- Goals: validate the core loop (discover → contact → view), gather feedback, fix rough
  edges, and get enough real listings that the map is useful.

## Phase 2 — Monetization

Flip `BILLING_ENABLED = true` and connect a payment gateway. Owners get:

- **First 5 listings free.**
- **₱29 for every listing beyond the fifth.**
- **₱99 / month owner subscription** (optional owner plan).

The `Subscription` model and the listing-cost helpers (`config/billing.ts`,
`lib/owner/billing.ts`) are already scaffolded for this — no schema surprises. Payment
integration points are marked in `lib/owner/billing.ts`. Likely gateways: Maya, GCash,
or PayMongo (all support PHP and have local reach).

## Future

Sequenced after Phase 2 is stable:

- **Verified owners** — trust badge, admin-granted. _(Feature already built; may gain a
  paid/vetted tier later.)_
- **Advertisements** — local businesses (laundry, cafés, water stations, printing shops,
  etc.) shown non-intrusively on the homepage. _(Infrastructure already built; monetize
  later.)_
- **Featured listings** — paid homepage promotion. _(Admin-controlled feature already
  built; monetize later.)_
- **Analytics** — richer owner analytics beyond the current view/contact/favorite counts.
- **Redis (Upstash)** — caching layer for homepage listings, details, reviews, map
  markers, stats, and owner metrics; also a shared rate-limiter store. Plan in
  `PERFORMANCE.md` and `docs/CACHING.md`.
- **Payment gateway** — the concrete integration that unlocks Phase 2.
- **Beyond VSU** — multi-campus support (add a `Campus` model + `campusId`).

## Guiding rule

Students always browse for free. Monetization targets owners and local businesses, and
must never compromise the honesty of trust signals (verification, availability, reviews)
or the student experience. Build features so the paid version is a later config/gateway
change, not a rewrite.
