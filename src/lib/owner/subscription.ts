// A paid owner subscription lasts 5 months — one VSU semester per month of coverage,
// i.e. 5 semesters — then must be renewed. Central so the admin grant, the expiry
// check, and the owner banner all agree.
export const SUBSCRIPTION_DURATION_MONTHS = 5;

// Warn the owner this many days before expiry so they can renew in time.
const RENEWAL_WARNING_DAYS = 14;

export type SubscriptionState = "NONE" | "ACTIVE" | "EXPIRING" | "EXPIRED";

interface SubscriptionFields {
  status: string;
  expiresAt: Date | null;
}

// The expiry stamp to store when an admin activates a subscription now.
export function subscriptionExpiry(from: Date = new Date()): Date {
  const end = new Date(from);
  end.setMonth(end.getMonth() + SUBSCRIPTION_DURATION_MONTHS);
  return end;
}

// True when an active subscription's coverage window has already passed.
export function isSubscriptionExpired(fields: SubscriptionFields | null): boolean {
  return subscriptionState(fields) === "EXPIRED";
}

// Owner-facing state used to decide whether to nudge them to (re)subscribe.
export function subscriptionState(fields: SubscriptionFields | null): SubscriptionState {
  if (!fields || fields.status !== "ACTIVE" || !fields.expiresAt) return "NONE";

  const msLeft = fields.expiresAt.getTime() - Date.now();
  if (msLeft <= 0) return "EXPIRED";
  if (msLeft <= RENEWAL_WARNING_DAYS * 24 * 60 * 60 * 1000) return "EXPIRING";
  return "ACTIVE";
}
