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

export async function registerImagesForOwner(
  ownerId: string,
  boardingHouseId: string,
  urls: string[],
  photoLimit: number,
): Promise<"not-owned" | "limit" | "saved"> {
  return prisma.$transaction(async (tx) => {
    const listing = await tx.$queryRaw<{ id: string }[]>`
      SELECT id FROM "boarding_houses"
      WHERE id = ${boardingHouseId} AND "ownerId" = ${ownerId}
      FOR UPDATE
    `;
    if (listing.length === 0) return "not-owned";

    const uniqueUrls = [...new Set(urls)];
    const existing = await tx.image.findMany({
      where: { boardingHouseId, url: { in: uniqueUrls } },
      select: { url: true },
    });
    const knownUrls = new Set(existing.map((image) => image.url));
    const newUrls = uniqueUrls.filter((url) => !knownUrls.has(url));
    const count = await tx.image.count({ where: { boardingHouseId } });
    if (count + newUrls.length > photoLimit) return "limit";

    if (newUrls.length > 0) {
      const last = await tx.image.findFirst({
        where: { boardingHouseId },
        orderBy: { sortOrder: "desc" },
        select: { sortOrder: true },
      });
      await tx.image.createMany({
        data: newUrls.map((url, index) => ({
          boardingHouseId,
          url,
          sortOrder: (last?.sortOrder ?? -1) + index + 1,
        })),
      });
    }
    return "saved";
  });
}

// Removes photos the owner owns on the given listing, returning their URLs so the
// files can be deleted. Ids the owner doesn't own are silently skipped.
export async function deleteImagesForOwner(
  ownerId: string,
  boardingHouseId: string,
  imageIds: string[],
): Promise<string[]> {
  const images = await prisma.image.findMany({
    where: {
      id: { in: imageIds },
      boardingHouseId,
      boardingHouse: { ownerId },
    },
    select: { id: true, url: true },
  });
  if (images.length === 0) return [];

  await prisma.image.deleteMany({
    where: { id: { in: images.map((image) => image.id) } },
  });
  return images.map((image) => image.url);
}

export async function updateImageAltForOwner(
  ownerId: string,
  boardingHouseId: string,
  imageId: string,
  alt: string | null,
): Promise<boolean> {
  const result = await prisma.image.updateMany({
    where: { id: imageId, boardingHouseId, boardingHouse: { ownerId } },
    data: { alt },
  });
  return result.count === 1;
}

export async function reorderImagesForOwner(
  ownerId: string,
  boardingHouseId: string,
  imageIds: string[],
): Promise<boolean> {
  const uniqueIds = [...new Set(imageIds)];
  if (uniqueIds.length !== imageIds.length) return false;

  const owned = await prisma.image.count({
    where: {
      id: { in: uniqueIds },
      boardingHouseId,
      boardingHouse: { ownerId },
    },
  });
  if (owned !== uniqueIds.length) return false;

  await prisma.$transaction(
    uniqueIds.map((id, sortOrder) =>
      prisma.image.update({ where: { id }, data: { sortOrder } }),
    ),
  );
  return true;
}
