// Data access for a student's saved boarding houses.

import { prisma } from "@/lib/db/prisma";

export async function getFavoriteIds(studentId: string): Promise<string[]> {
  const rows = await prisma.favorite.findMany({
    where: { studentId },
    select: { boardingHouseId: true },
  });
  return rows.map((row) => row.boardingHouseId);
}

// Add or remove in one call; returns the new favorited state.
export async function toggleFavorite(studentId: string, boardingHouseId: string): Promise<boolean> {
  const existing = await prisma.favorite.findUnique({
    where: { studentId_boardingHouseId: { studentId, boardingHouseId } },
  });

  if (existing) {
    await prisma.favorite.delete({
      where: { studentId_boardingHouseId: { studentId, boardingHouseId } },
    });
    return false;
  }

  await prisma.favorite.create({ data: { studentId, boardingHouseId } });
  return true;
}

// Full listings a student has saved, newest first — used on the account page.
export async function findFavoriteListings(studentId: string) {
  const favorites = await prisma.favorite.findMany({
    where: { studentId },
    orderBy: { createdAt: "desc" },
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
  return favorites.map((favorite) => favorite.boardingHouse);
}
