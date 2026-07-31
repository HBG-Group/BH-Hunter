# Business Model — Meino

The reasoning behind how Meino makes money. The sequence is in `ROADMAP.md`; this explains
*why*. Governing principle: **students always browse free; owners and local businesses
pay for value that brings them tenants and customers.**

## Current — Everything free

During Phase 1 (~1 month), nothing is charged. `config/billing.ts` has
`BILLING_ENABLED = false`, so no listing is ever blocked or billed.

**Why start free:** a marketplace is worthless without density. If owners must pay before
the platform has students, and students arrive before there are listings, neither side
shows up. Free removes all friction so we can build a critical mass of real listings and
earn trust first. Feedback in this window shapes what's worth charging for.

## Planned launch plans (display only during beta)

A three-tier semester plan is now shown on `/pricing` and defined in `config/pricing.ts`.
**No billing** is wired — the page is informational and buttons read "Coming After Beta"
while `BILLING_ENABLED = false`.

| Plan | Price | Free listings | Extra listing | Perks |
|---|---|---|---|---|
| **Basic** (blue) | ₱129 / sem | 3 | ₱29 | — |
| **Advance** (purple, "Most Popular") | ₱179 / sem | 6 | ₱21 | Verified badge |
| **Premium** (gold) | ₱239 / sem | 10 | ₱15 | Verified badge + Featured |

Admins can already **assign** a plan to an owner on `/admin/owners`; that assignment
applies the badge/featured perks today (see `CHANGELOG.md`) — it just doesn't charge.
The older ₱99/month subscription idea below predates these plans; reconcile before launch.

## Future — the paid model

### Owner subscription — ₱99 / month
An optional plan for active owners. **Why ₱99:** low enough to be an easy yes for a
landlord who gets even one tenant from Meino, framed as a monthly cost of visibility
rather than a big commitment. It creates predictable recurring revenue without gating the
basics.

### Listing pricing — 5 free, then ₱29 each
- **First 5 listings free.** Most owners have a handful of rooms/properties; a generous
  free tier means the typical owner never pays just to be listed. This keeps supply high.
- **₱29 per listing beyond 5.** Only larger operators — who get proportionally more value
  — pay, and only a small per-unit amount. **Why ₱29:** trivial next to a month's rent, so
  it filters spam/low-effort listings without discouraging genuine ones.

Scaffolded now in `config/billing.ts` (`FREE_LISTING_LIMIT = 5`, `EXTRA_LISTING_PRICE =
29`, `MONTHLY_SUBSCRIPTION_PRICE = 99`) and `lib/owner/billing.ts`. Flipping the flag +
adding a gateway (Maya/GCash/PayMongo) turns it on.

### Verified owner
Trust badge, now **granted by plan** (Advance/Premium) rather than a standalone manual
toggle — see `CHANGELOG.md`. **Why:** trust is the scarce
resource in student housing. A verified badge is valuable to owners because it converts
more student enquiries. It can later become a vetted/paid tier, but verification integrity
must never be for sale in a way that misleads students.

### Advertisements
Relevant **local** businesses (laundry, cafés, water stations, printing/computer shops,
convenience stores, internet providers) shown non-intrusively on the homepage
(infrastructure already built). **Why:** these businesses genuinely serve the same
students and want to reach them; tasteful, clearly-labelled ads add value rather than
clutter. Revenue that doesn't touch the core discovery experience.

### Featured listings
Paid homepage promotion (admin-controlled feature already built). **Why:** owners with
strong listings will pay for prominence, and featured placement is a clean, honest boost
(still real, verified listings) — not a distortion of availability or reviews.

## Non-negotiables

- Students never pay to browse, favorite, review, or request a viewing.
- Monetization must never compromise honesty: availability, reviews, and verification stay
  truthful regardless of who paid.
- Every paid capability is built so enabling it is a config/gateway change, not a rewrite.
