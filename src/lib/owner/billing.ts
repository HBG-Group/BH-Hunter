import { prisma } from "@/lib/db/prisma";
import {
  EXTRA_LISTING_PRICE,
  FREE_LISTING_LIMIT,
  freeListingsLeft,
  nextListingNeedsPayment,
} from "@/config/billing";

// How many listings an owner already has — the basis for the free-tier check.
export function countOwnerListings(ownerId: string): Promise<number> {
  return prisma.boardingHouse.count({ where: { ownerId } });
}

export interface ListingQuota {
  used: number;
  freeLimit: number;
  freeLeft: number;
  nextNeedsPayment: boolean;
  extraPrice: number;
}

// Everything the UI needs to show the quota banner and, later, the paywall.
export async function getListingQuota(ownerId: string): Promise<ListingQuota> {
  const used = await countOwnerListings(ownerId);
  return {
    used,
    freeLimit: FREE_LISTING_LIMIT,
    freeLeft: freeListingsLeft(used),
    nextNeedsPayment: nextListingNeedsPayment(used),
    extraPrice: EXTRA_LISTING_PRICE,
  };
}

// ── Future payment integration point ──────────────────────────────────────────
// When Phase 2 begins, a paid listing flow will:
//   1. create a pending payment (Maya / GCash / PayMongo) for EXTRA_LISTING_PRICE
//   2. on webhook confirmation, allow the listing to be created
//   3. store the payment reference against the listing/owner
// Until then nextNeedsPayment is always false (BILLING_ENABLED === false).
