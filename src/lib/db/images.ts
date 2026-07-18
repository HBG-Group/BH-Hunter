// Data access for listing photos. Adds and removals are scoped through the owning
// boarding house so an owner can only touch photos on their own listings.

import { prisma } from "@/lib/db/prisma";

export function findImages(boardingHouseId: string) {
  return prisma.image.findMany({
    where: { boardingHouseId },
    orderBy: { sortOrder: "asc" },
  });
}

async function ownsListing(ownerId: string, boardingHouseId: string): Promise<boolean> {
  const listing = await prisma.boardingHouse.findFirst({
    where: { id: boardingHouseId, ownerId },
    select: { id: true },
  });
  return listing !== null;
}

// Appends a photo after the current last one. Returns false if the owner doesn't
// own the listing.
export async function addImageForOwner(
  ownerId: string,
  boardingHouseId: string,
  url: string,
): Promise<boolean> {
  if (!(await ownsListing(ownerId, boardingHouseId))) return false;

  const last = await prisma.image.findFirst({
    where: { boardingHouseId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  await prisma.image.create({
    data: { boardingHouseId, url, sortOrder: (last?.sortOrder ?? -1) + 1 },
  });
  return true;
}

// Removes a photo the owner owns and returns its URL (so the file can be deleted).
export async function deleteImageForOwner(
  ownerId: string,
  imageId: string,
): Promise<string | null> {
  const image = await prisma.image.findFirst({
    where: { id: imageId, boardingHouse: { ownerId } },
  });
  if (!image) return null;

  await prisma.image.delete({ where: { id: imageId } });
  return image.url;
}
