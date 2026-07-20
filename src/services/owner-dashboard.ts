// Shapes owner listing rows into the view the dashboard renders, computing the same
// availability summary the public side uses so the numbers always agree.

import { summarizeAvailability } from "@/services/availability";
import type { OwnerListingView } from "@/components/owner/OwnerListingCard";
import type { findListingsByOwner } from "@/lib/db/owner";

type OwnerRow = Awaited<ReturnType<typeof findListingsByOwner>>[number];

export function toOwnerListingViews(rows: OwnerRow[]): OwnerListingView[] {
  return rows.map((row) => {
    const availability = summarizeAvailability(row.rooms);
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      status: row.status,
      availabilityState: availability.state,
      remainingVacancies: availability.remainingVacancies,
      totalCapacity: availability.totalCapacity,
      lastConfirmedAt: row.lastConfirmedAt?.toISOString() ?? null,
      favorites: row._count.favorites,
      viewingRequests: row._count.viewingRequests,
      photoCount: row._count.images,
    };
  });
}
