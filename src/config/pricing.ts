// Pricing model for launch — DISPLAY ONLY during the beta. Nothing here enforces
// billing, gates features, or restricts listings; the whole app stays free while
// BILLING_ENABLED (config/billing.ts) is false. These types are shaped so a real
// subscription layer can be built on top later without redesigning the data.

export type PlanTheme = "blue" | "purple" | "gold";

// A single capability line on a plan. `available` is future-facing feature-availability
// metadata — unused for gating today, ready for a real entitlement check later.
export interface PlanFeature {
  label: string;
  available: boolean;
}

export interface Plan {
  id: "basic" | "advance" | "premium";
  name: string;
  theme: PlanTheme;
  target: string;
  price: number; // in PHP
  period: string; // e.g. "Semester"
  freeListings: number;
  roomsPerListing: number;
  extraListingPrice: number; // PHP per listing beyond the free amount
  verifiedBadge: boolean;
  featuredListing: boolean;
  maxPhotosPerListing: number;
  features: PlanFeature[];
  popular?: boolean;
}

// Future subscription record — NOT persisted or used yet. Kept here so the shape is
// agreed on ahead of time.
export interface Subscription {
  planId: Plan["id"];
  status: "active" | "past_due" | "canceled";
  startedAt: string;
  renewsAt: string;
}

export const PLANS: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    theme: "blue",
    target: "Small boarding house owners",
    price: 129,
    period: "Semester",
    freeListings: 3,
    roomsPerListing: 2,
    extraListingPrice: 29,
    verifiedBadge: false,
    featuredListing: false,
    maxPhotosPerListing: 7,
    features: [
      { label: "3 free listings", available: true },
      { label: "Up to 2 rooms per listing", available: true },
      { label: "Up to 7 photos per listing", available: true },
      { label: "Standard visibility", available: true },
      { label: "Student inquiries", available: true },
      { label: "Dashboard access", available: true },
    ],
  },
  {
    id: "advance",
    name: "Advance",
    theme: "purple",
    target: "Growing boarding house owners",
    price: 179,
    period: "Semester",
    freeListings: 6,
    roomsPerListing: 2,
    extraListingPrice: 21,
    verifiedBadge: true,
    featuredListing: false,
    maxPhotosPerListing: 12,
    popular: true,
    features: [
      { label: "6 free listings", available: true },
      { label: "Up to 2 rooms per listing", available: true },
      { label: "Up to 12 photos per listing", available: true },
      { label: "Verified Owner Badge", available: true },
      { label: "Increased credibility", available: true },
      { label: "Dashboard access", available: true },
      { label: "Student inquiries", available: true },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    theme: "gold",
    target: "Large boarding house businesses",
    price: 239,
    period: "Semester",
    freeListings: 10,
    roomsPerListing: 2,
    extraListingPrice: 15,
    verifiedBadge: true,
    featuredListing: true,
    maxPhotosPerListing: 20,
    features: [
      { label: "10 free listings", available: true },
      { label: "Up to 2 rooms per listing", available: true },
      { label: "Up to 20 photos per listing", available: true },
      { label: "Verified Owner Badge", available: true },
      { label: "Featured Listing", available: true },
      { label: "Increased visibility", available: true },
      { label: "Dashboard access", available: true },
      { label: "Student inquiries", available: true },
    ],
  },
];
