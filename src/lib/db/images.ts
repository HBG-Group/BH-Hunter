// Data access for listing photos. Adds and removals are scoped through the owning
// boarding house so an owner can only touch photos on their own listings.

import { prisma } from "@/lib/db/prisma";

export function findImages(boardingHouseId: string) {
  return prisma.image.findMany({
    where: { boardingHouseId },
    orderBy: { sortOrder: "asc" },
  });
}

export function countImages(boardingHouseId: string) {
  return prisma.image.count({ where: { boardingHouseId } });
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

// True when this exact object has already been registered — blocks ticket replay.
export async function imageUrlExists(url: string): Promise<boolean> {
  const existing = await prisma.image.findFirst({ where: { url }, select: { id: true } });
  return existing !== null;
}

// Removes photos the owner owns on the given listing, returning their URLs so the
// files can be deleted. Ids the owner doesn't own are silently skipped.
export async function deleteImagesForOwner(
  ownerId: string,
  boardingHouseId: string,
  imageIds: string[],
): Promise<string[]> {
  const images = await prisma.image.findMany({
    where: { id: { in: imageIds }, boardingHouseId, boardingHouse: { ownerId } },
    select: { id: true, url: true },
  });
  if (images.length === 0) return [];

  await prisma.image.deleteMany({ where: { id: { in: images.map((image) => image.id) } } });
  return images.map((image) => image.url);
}
