import { prisma } from "@/lib/db/prisma";

// An owner reads their own subscription (for the renew banner). Owner-scoped by id.
export function getOwnerSubscription(ownerId: string) {
  return prisma.subscription.findUnique({
    where: { ownerId },
    select: { status: true, expiresAt: true, plan: true },
  });
}
