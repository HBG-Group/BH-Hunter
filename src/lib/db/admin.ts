// Data access for the admin area. Unlike the owner layer, these are NOT scoped to a
// single user — admins act across the whole platform, so authorization happens in the
// action layer via requireAdmin().

import { prisma } from "@/lib/db/prisma";

export interface PlatformStats {
  listings: number;
  published: number;
  unverified: number;
  owners: number;
  students: number;
  reviews: number;
  viewingRequests: number;
}

export async function getPlatformStats(): Promise<PlatformStats> {
  const [listings, published, unverified, owners, students, reviews, viewingRequests] =
    await Promise.all([
      prisma.boardingHouse.count(),
      prisma.boardingHouse.count({ where: { status: "PUBLISHED" } }),
      prisma.boardingHouse.count({ where: { verifiedAt: null } }),
      prisma.profile.count({ where: { role: "OWNER" } }),
      prisma.profile.count({ where: { role: "STUDENT" } }),
      prisma.review.count(),
      prisma.viewingRequest.count(),
    ]);

  return { listings, published, unverified, owners, students, reviews, viewingRequests };
}

const adminListingSelect = {
  id: true,
  name: true,
  slug: true,
  status: true,
  verifiedAt: true,
  createdAt: true,
  owner: { select: { fullName: true, email: true } },
} as const;

// Listings that need an admin's attention: submitted for review (PENDING) or not yet
// verified. Archived listings are excluded.
export function findListingsAwaitingReview() {
  return prisma.boardingHouse.findMany({
    where: {
      status: { not: "ARCHIVED" },
      OR: [{ status: "PENDING" }, { verifiedAt: null }],
    },
    select: adminListingSelect,
    orderBy: { createdAt: "desc" },
  });
}

export function findAllListingsForAdmin() {
  return prisma.boardingHouse.findMany({
    select: adminListingSelect,
    orderBy: { createdAt: "desc" },
  });
}

export async function isListingVerified(id: string): Promise<boolean> {
  const row = await prisma.boardingHouse.findUnique({
    where: { id },
    select: { verifiedAt: true },
  });
  return row?.verifiedAt != null;
}

// updateMany/deleteMany return a count instead of throwing when the row is gone, so
// two admins working the same queue can't crash each other.
export async function setListingVerified(id: string, verified: boolean): Promise<boolean> {
  const result = await prisma.boardingHouse.updateMany({
    where: { id },
    data: { verifiedAt: verified ? new Date() : null },
  });
  return result.count > 0;
}

export async function setListingStatusAsAdmin(
  id: string,
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED",
): Promise<boolean> {
  const result = await prisma.boardingHouse.updateMany({ where: { id }, data: { status } });
  return result.count > 0;
}

export function findRecentReviews(limit = 50) {
  return prisma.review.findMany({
    take: limit,
    include: {
      author: { select: { fullName: true } },
      boardingHouse: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteReviewById(id: string): Promise<boolean> {
  const result = await prisma.review.deleteMany({ where: { id } });
  return result.count > 0;
}
