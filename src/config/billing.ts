// Monetization roadmap in one place (see newFeatures.md Part 3).
//
// Phase 1 (now): everything free while we test. BILLING_ENABLED stays false, so the
// listing limit is shown for transparency but never blocks anyone.
// Phase 2 (later): flip BILLING_ENABLED to true and wire a real payment gateway into
// the points marked in lib/owner/billing.ts.

// Master switch. While false, no listing is ever blocked or charged.
export const BILLING_ENABLED = false;

// Every owner gets this many free listings.
export const FREE_LISTING_LIMIT = 5;

// Price of each listing beyond the free limit, in pesos.
export const EXTRA_LISTING_PRICE = 29;

// One-time fee an owner pays before an admin grants the Verified Owner badge, in pesos.
export const VERIFICATION_PRICE = 39;

// How long a granted verification lasts before it auto-expires.
export const VERIFICATION_DURATION_DAYS = 30;

// Future owner subscription, in pesos per month. Not enforced yet.
export const MONTHLY_SUBSCRIPTION_PRICE = 99;

// Would the next listing (given how many the owner already has) need payment?
export function nextListingNeedsPayment(currentCount: number): boolean {
  return BILLING_ENABLED && currentCount >= FREE_LISTING_LIMIT;
}

// Free listings still remaining. Never negative.
export function freeListingsLeft(currentCount: number): number {
  return Math.max(0, FREE_LISTING_LIMIT - currentCount);
}

// Has the owner reached the free ceiling? Unlike nextListingNeedsPayment this is NOT
// tied to BILLING_ENABLED — extra listings always require contacting the admin, since
// there is no self-serve payment. Used to block the create form beyond the free limit.
export function isAtFreeLimit(currentCount: number): boolean {
  return currentCount >= FREE_LISTING_LIMIT;
}
