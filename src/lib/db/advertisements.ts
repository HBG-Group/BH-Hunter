// Data access for local business advertisements. Admin-managed; the homepage reads
// only the currently-live ones.

import { prisma } from "@/lib/db/prisma";
import type { AdvertisementInput } from "@/lib/validation/advertisement";

// Turn "" from optional form fields into null so the column stays clean.
function nullify(value: string | undefined): string | null {
  return value && value.trim() !== "" ? value : null;
}

function toData(input: AdvertisementInput, imageUrls: string[]) {
  return {
    title: input.title,
    description: nullify(input.description),
    imageUrls,
    websiteUrl: nullify(input.websiteUrl),
    facebookUrl: nullify(input.facebookUrl),
    messengerUrl: nullify(input.messengerUrl),
    startAt: input.startAt ?? new Date(),
    expiresAt: input.expiresAt ?? null,
  };
}

export function createAdvertisement(input: AdvertisementInput, imageUrls: string[]) {
  return prisma.advertisement.create({ data: toData(input, imageUrls) });
}

// Delete an ad and return its image URLs so the caller can clear the stored files.
// null when the ad doesn't exist.
export async function deleteAdvertisement(id: string): Promise<string[] | null> {
  const ad = await prisma.advertisement.findUnique({ where: { id }, select: { imageUrls: true } });
  if (!ad) return null;

  await prisma.advertisement.delete({ where: { id } });
  return ad.imageUrls;
}

export async function setAdvertisementActive(id: string, active: boolean): Promise<boolean> {
  const result = await prisma.advertisement.updateMany({ where: { id }, data: { active } });
  return result.count > 0;
}

// Every ad, newest first — the admin management list.
export function findAllAdvertisements() {
  return prisma.advertisement.findMany({ orderBy: { createdAt: "desc" } });
}

// Is an ad currently visible on the homepage? (active and inside its date window)
export function isAdLive(ad: { active: boolean; startAt: Date; expiresAt: Date | null }): boolean {
  const now = Date.now();
  return ad.active && ad.startAt.getTime() <= now && (ad.expiresAt === null || ad.expiresAt.getTime() > now);
}

// Live ads for the homepage: active, started, and not expired.
export function findLiveAdvertisements(limit = 6) {
  const now = new Date();
  return prisma.advertisement.findMany({
    where: {
      active: true,
      startAt: { lte: now },
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
