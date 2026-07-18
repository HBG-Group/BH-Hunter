import type { AnalyticsEventType } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

// Record one interaction (a profile view, a contact click, etc.). Fire-and-forget
// from the caller's perspective — analytics should never block the user.
export function logAnalyticsEvent(boardingHouseId: string, type: AnalyticsEventType) {
  return prisma.analyticsEvent.create({ data: { boardingHouseId, type } });
}

export interface AnalyticsSummary {
  views: number;
  contactClicks: number;
  favorites: number;
  viewingRequests: number;
}

// Totals across all of an owner's listings, grouped by event type.
export async function getOwnerAnalytics(ownerId: string): Promise<AnalyticsSummary> {
  const grouped = await prisma.analyticsEvent.groupBy({
    by: ["type"],
    where: { boardingHouse: { ownerId } },
    _count: { type: true },
  });

  const countFor = (type: AnalyticsEventType) =>
    grouped.find((row) => row.type === type)?._count.type ?? 0;

  return {
    views: countFor("VIEW"),
    contactClicks: countFor("CONTACT_CLICK"),
    favorites: countFor("FAVORITE"),
    viewingRequests: countFor("VIEWING_REQUEST"),
  };
}
