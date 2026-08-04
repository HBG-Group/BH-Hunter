import { PLANS, type Plan } from "@/config/pricing";
import { prisma } from "@/lib/db/prisma";

export interface OwnerEntitlements {
  planName: string;
  roomLimit: number;
  listingLimit: number;
  photoLimit: number;
  verifiedBadge: boolean;
  featuredListing: boolean;
  active: boolean;
}

function findPlan(value: string | null | undefined): Plan | undefined {
  return PLANS.find((plan) => plan.id === value?.toLowerCase());
}

// Resolve the room limit on the server. A missing/lapsed subscription gets the
// published default allowance; the browser never supplies its own entitlement.
export async function getOwnerRoomEntitlement(
  ownerId: string,
): Promise<OwnerEntitlements> {
  const owner = await prisma.profile.findUnique({
    where: { id: ownerId },
    select: {
      plan: true,
      subscription: { select: { plan: true, status: true, expiresAt: true } },
    },
  });
  const subscription = owner?.subscription;
  const active = Boolean(
    subscription?.status === "ACTIVE" &&
    subscription.expiresAt &&
    subscription.expiresAt > new Date(),
  );
  const plan =
    findPlan(active ? (subscription?.plan ?? owner?.plan) : owner?.plan) ??
    PLANS[0];
  return {
    planName: active ? plan.name : "Basic",
    roomLimit: plan.roomsPerListing,
    listingLimit: plan.freeListings,
    photoLimit: plan.maxPhotosPerListing,
    verifiedBadge: plan.verifiedBadge,
    featuredListing: plan.featuredListing,
    active,
  };
}
