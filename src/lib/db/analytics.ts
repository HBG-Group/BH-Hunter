import type { AnalyticsEventType } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { cached } from "@/lib/cache/redis";

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

// Totals across all of an owner's listings, grouped by event type. Cached: these are
// metrics, allowed to lag by the TTL (docs/CACHING.md) rather than invalidated on write.
export async function getOwnerAnalytics(ownerId: string): Promise<AnalyticsSummary> {
  return cached(`metrics:owner:${ownerId}`, 300, async () => {
    const [grouped, viewingRequests] = await Promise.all([
      prisma.analyticsEvent.groupBy({
        by: ["type"],
        where: { boardingHouse: { ownerId } },
        _count: { type: true },
      }),
      // The AnalyticsEvent log is append-only (never adjusted when a request is declined
      // or deleted), so it drifts from the real inbox. Count the ViewingRequest table
      // directly — the same source /owner/requests reads — so the dashboard tile always
      // agrees with it.
      prisma.viewingRequest.count({ where: { boardingHouse: { ownerId } } }),
    ]);

    const countFor = (type: AnalyticsEventType) =>
      grouped.find((row) => row.type === type)?._count.type ?? 0;

    return {
      views: countFor("VIEW"),
      contactClicks: countFor("CONTACT_CLICK"),
      favorites: countFor("FAVORITE"),
      viewingRequests,
    };
  });
}
