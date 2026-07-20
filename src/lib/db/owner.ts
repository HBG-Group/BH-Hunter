// Data access for the owner dashboard. Every write is scoped to an ownerId so an
// owner can only ever touch their own listings — this is where authorization lives
// (Prisma connects as the DB owner and bypasses row-level security).

import { prisma } from "@/lib/db/prisma";

export interface RoomInput {
  label: string;
  capacity: number;
  occupied: number;
  priceMonthly?: number;
}

export interface ListingWriteData {
  name: string;
  slug: string;
  addressLine: string;
  latitude: number;
  longitude: number;
  genderPolicy: "MALE" | "FEMALE" | "MIXED";
  priceMonthly: number;
  advanceMonths: number;
  depositMonths: number;
  utilitiesIncluded: boolean;
  internetIncluded: boolean;
  curfew: string | null;
  houseRules: string | null;
  contactPhone: string;
  messengerUrl: string | null;
  contactEmail: string | null;
  amenityKeys: string[];
  rooms: RoomInput[];
}

export function findListingsByOwner(ownerId: string) {
  return prisma.boardingHouse.findMany({
    where: { ownerId },
    include: {
      rooms: true,
      _count: { select: { favorites: true, viewingRequests: true, images: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export function findOwnerListing(ownerId: string, id: string) {
  return prisma.boardingHouse.findFirst({
    where: { id, ownerId },
    include: { rooms: true, amenities: { include: { amenity: true } } },
  });
}

// Amenity keys are unique, so we can connect them directly without id lookups.
function amenityLinks(amenityKeys: string[]) {
  return amenityKeys.map((key) => ({ amenity: { connect: { key } } }));
}

export function createOwnerListing(ownerId: string, data: ListingWriteData) {
  const { amenityKeys, rooms, ...scalars } = data;
  return prisma.boardingHouse.create({
    data: {
      ...scalars,
      curfew: scalars.curfew ?? undefined,
      houseRules: scalars.houseRules ?? undefined,
      messengerUrl: scalars.messengerUrl ?? undefined,
      contactEmail: scalars.contactEmail ?? undefined,
      owner: { connect: { id: ownerId } },
      lastConfirmedAt: new Date(),
      rooms: { create: rooms },
      amenities: { create: amenityLinks(amenityKeys) },
    },
  });
}

// Full edit: verify ownership, then replace scalars, rooms, and amenities in one
// transaction so the listing is never left half-updated.
export async function updateOwnerListing(ownerId: string, id: string, data: ListingWriteData) {
  const owned = await prisma.boardingHouse.findFirst({ where: { id, ownerId }, select: { id: true } });
  if (!owned) return false;

  // Keep the existing slug so public URLs stay stable across edits.
  const { amenityKeys, rooms, slug, ...scalars } = data;
  void slug;

  await prisma.boardingHouse.update({
    where: { id },
    data: {
      ...scalars,
      curfew: scalars.curfew ?? null,
      houseRules: scalars.houseRules ?? null,
      messengerUrl: scalars.messengerUrl ?? null,
      contactEmail: scalars.contactEmail ?? null,
      rooms: { deleteMany: {}, create: rooms },
      amenities: { deleteMany: {}, create: amenityLinks(amenityKeys) },
    },
  });
  return true;
}

// One-tap "still accurate" — refreshes the confidence timestamp behind the pins.
export async function confirmVacancies(ownerId: string, id: string) {
  const result = await prisma.boardingHouse.updateMany({
    where: { id, ownerId },
    data: { lastConfirmedAt: new Date() },
  });
  return result.count > 0;
}

// Owners move a listing between DRAFT (private) and PENDING (submitted for review).
// Only an admin can set it to PUBLISHED, so owners can never publish themselves.
export async function setListingStatus(
  ownerId: string,
  id: string,
  status: "DRAFT" | "PENDING",
) {
  const result = await prisma.boardingHouse.updateMany({
    where: { id, ownerId },
    data: { status },
  });
  return result.count > 0;
}
