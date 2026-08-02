// Data access for the admin area. Unlike the owner layer, these are NOT scoped to a
// single user — admins act across the whole platform, so authorization happens in the
// action layer via requireAdmin().

import { prisma } from "@/lib/db/prisma";
import type { ModerationAction } from "@prisma/client";
import { verificationExpiry } from "@/lib/owner/verification";
import { subscriptionExpiry } from "@/lib/owner/subscription";
import { PLANS } from "@/config/pricing";

export type OwnerPlanId = "BASIC" | "ADVANCE" | "PREMIUM";

// The perks a plan grants, read from the pricing config so there's one source of truth.
function planPerks(plan: OwnerPlanId): { verified: boolean; featured: boolean } {
  const found = PLANS.find((p) => p.id === plan.toLowerCase());
  return { verified: found?.verifiedBadge ?? false, featured: found?.featuredListing ?? false };
}

export interface PlatformStats {
  listings: number;
  published: number;
  unverified: number;
  owners: number;
  students: number;
  reviews: number;
  viewingRequests: number;
  openReports: number;
}

export async function getPlatformStats(): Promise<PlatformStats> {
  const [listings, published, unverified, owners, students, reviews, viewingRequests, openReports] =
    await Promise.all([
      prisma.boardingHouse.count(),
      prisma.boardingHouse.count({ where: { status: "PUBLISHED" } }),
      prisma.boardingHouse.count({ where: { verifiedAt: null } }),
      prisma.profile.count({ where: { role: "OWNER" } }),
      prisma.profile.count({ where: { role: "STUDENT" } }),
      prisma.review.count(),
      prisma.viewingRequest.count(),
      prisma.report.count({ where: { status: "OPEN" } }),
    ]);

  return { listings, published, unverified, owners, students, reviews, viewingRequests, openReports };
}

const adminListingSelect = {
  id: true,
  name: true,
  slug: true,
  status: true,
  verifiedAt: true,
  featured: true,
  createdAt: true,
  owner: { select: { id: true, fullName: true, email: true, verified: true } },
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

export type AdminListingFilter = "all" | "unverified" | "unpublished";

// The moderation list, optionally narrowed. "unverified" = not yet verified;
// "unpublished" = anything not live on the map.
export function findAllListingsForAdmin(filter: AdminListingFilter = "all") {
  const where =
    filter === "unverified"
      ? { verifiedAt: null }
      : filter === "unpublished"
        ? { status: { not: "PUBLISHED" as const } }
        : {};

  return prisma.boardingHouse.findMany({
    where,
    select: adminListingSelect,
    orderBy: { createdAt: "desc" },
  });
}

// Full listing for the admin review page — every field and image, regardless of
// status, so an admin can vet a pending listing before publishing it.
export function findListingForAdmin(id: string) {
  return prisma.boardingHouse.findUnique({
    where: { id },
    include: {
      rooms: { orderBy: { label: "asc" } },
      images: { orderBy: { sortOrder: "asc" } },
      amenities: { include: { amenity: true } },
      nearbyPlaces: true,
      owner: { select: { id: true, fullName: true, email: true, phone: true, verified: true } },
    },
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

// Permanently delete a listing. Related rows (rooms, images, amenities, reviews,
// favorites, viewing requests, analytics) fall away via onDelete: Cascade. Returns the
// image URLs so the caller can remove the files from Storage too. null if not found.
export async function deleteListingAsAdmin(id: string): Promise<string[] | null> {
  const listing = await prisma.boardingHouse.findUnique({
    where: { id },
    select: { images: { select: { url: true } } },
  });
  if (!listing) return null;

  await prisma.boardingHouse.delete({ where: { id } });
  return listing.images.map((image) => image.url);
}

// Promote or demote a listing on the homepage. Admin-only.
export async function setListingFeatured(id: string, featured: boolean): Promise<boolean> {
  const result = await prisma.boardingHouse.updateMany({ where: { id }, data: { featured } });
  return result.count > 0;
}

// Grant or revoke an owner's "Verified Owner" badge. Scoped to OWNER profiles, so an
// admin can't accidentally flag a student, and owners can never verify themselves.
// Granting sets a one-month expiry and clears any pending request; revoking wipes both.
export async function setOwnerVerified(ownerId: string, verified: boolean): Promise<boolean> {
  const result = await prisma.profile.updateMany({
    where: { id: ownerId, role: "OWNER" },
    data: verified
      ? {
          verified: true,
          verifiedUntil: verificationExpiry(),
          verificationRequestedAt: null,
          verificationStatus: "APPROVED",
        }
      : {
          verified: false,
          verifiedUntil: null,
          verificationRequestedAt: null,
          verificationStatus: "UNVERIFIED",
        },
  });
  return result.count > 0;
}

// Reject a pending verification request without granting the badge. Distinct from
// "revoke" (setOwnerVerified(false)) so the owner sees their request was reviewed
// and declined, not just left unactioned.
export async function setOwnerVerificationRejected(ownerId: string): Promise<boolean> {
  const result = await prisma.profile.updateMany({
    where: { id: ownerId, role: "OWNER" },
    data: { verified: false, verificationRequestedAt: null, verificationStatus: "REJECTED" },
  });
  return result.count > 0;
}

// All owners for the admin "Owners" page, newest first, with their listing count and
// verification fields so the list can show status at a glance.
export function findAllOwners() {
  return prisma.profile.findMany({
    where: { role: "OWNER" },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      verified: true,
      verifiedUntil: true,
      verificationRequestedAt: true,
      frozen: true,
      plan: true,
      createdAt: true,
      subscription: { select: { status: true, expiresAt: true } },
      _count: { select: { boardingHouses: true } },
    },
    orderBy: [{ verificationRequestedAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
  });
}

// Full owner record for the admin owner-detail page, including their listings.
export function findOwnerForAdmin(ownerId: string) {
  return prisma.profile.findFirst({
    where: { id: ownerId, role: "OWNER" },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      avatarUrl: true,
      verified: true,
      verifiedUntil: true,
      verificationRequestedAt: true,
      verificationStatus: true,
      frozen: true,
      plan: true,
      createdAt: true,
      subscription: { select: { status: true, expiresAt: true } },
      boardingHouses: {
        select: { id: true, name: true, slug: true, status: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

// Assign a pricing plan to an owner. The plan drives their perks: the Verified Owner
// badge (Advance/Premium) and Featured listings (Premium) are applied automatically, in
// one transaction, so there's no separate manual verify/feature step. Activating a plan
// also (re)starts a 5-month subscription — after that it expires and the owner is
// prompted to re-subscribe.
export async function setOwnerPlan(ownerId: string, plan: OwnerPlanId): Promise<boolean> {
  const { verified, featured } = planPerks(plan);
  const now = new Date();
  const expiresAt = subscriptionExpiry(now);

  const [profileResult] = await prisma.$transaction([
    prisma.profile.updateMany({
      where: { id: ownerId, role: "OWNER" },
      // verifiedUntil null = valid while the plan lasts (no monthly expiry).
      data: {
        plan,
        verified,
        verifiedUntil: null,
        verificationRequestedAt: null,
        verificationStatus: verified ? "APPROVED" : "UNVERIFIED",
      },
    }),
    prisma.boardingHouse.updateMany({ where: { ownerId }, data: { featured } }),
    prisma.subscription.upsert({
      where: { ownerId },
      create: { ownerId, plan, status: "ACTIVE", startedAt: now, expiresAt, renewalDate: expiresAt },
      update: { plan, status: "ACTIVE", startedAt: now, expiresAt, renewalDate: expiresAt },
    }),
  ]);
  return profileResult.count > 0;
}

// Freeze or unfreeze an owner. Scoped to OWNER profiles so a student can't be frozen.
export async function setOwnerFrozen(ownerId: string, frozen: boolean): Promise<boolean> {
  const result = await prisma.profile.updateMany({
    where: { id: ownerId, role: "OWNER" },
    data: { frozen },
  });
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

export interface ModerationEventRow {
  id: string;
  action: ModerationAction;
  targetType: string;
  targetId: string;
  detail: string | null;
  createdAt: Date;
  actor: { id: string; fullName: string };
}

// Read-only audit trail for the admin UI — newest first, capped so the page stays fast.
export function listModerationEvents(): Promise<ModerationEventRow[]> {
  return prisma.moderationEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      action: true,
      targetType: true,
      targetId: true,
      detail: true,
      createdAt: true,
      actor: { select: { id: true, fullName: true } },
    },
  });
}

export function recordModerationEvent(input: {
  actorId: string;
  action: ModerationAction;
  targetType: string;
  targetId: string;
  detail?: string;
}) {
  return prisma.moderationEvent.create({ data: input });
}
