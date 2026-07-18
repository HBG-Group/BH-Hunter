// Data access for a student's recently viewed listings.

import { prisma } from "@/lib/db/prisma";

// Record a view, refreshing the timestamp if this listing was seen before.
export function recordRecentlyViewed(studentId: string, boardingHouseId: string) {
  return prisma.recentlyViewed.upsert({
    where: { studentId_boardingHouseId: { studentId, boardingHouseId } },
    update: { viewedAt: new Date() },
    create: { studentId, boardingHouseId },
  });
}

// The student's most recent listings, newest first.
export async function findRecentlyViewed(studentId: string, limit = 8) {
  const rows = await prisma.recentlyViewed.findMany({
    where: { studentId },
    orderBy: { viewedAt: "desc" },
    take: limit,
    include: {
      boardingHouse: {
        include: {
          rooms: true,
          images: { orderBy: { sortOrder: "asc" } },
          amenities: { include: { amenity: true } },
          nearbyPlaces: true,
          reviews: { select: { overall: true } },
        },
      },
    },
  });
  return rows.map((row) => row.boardingHouse);
}
