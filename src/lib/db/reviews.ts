// Data access for reviews. One review per student per listing (enforced by a unique
// constraint), so we upsert: submitting again edits the existing review.

import { prisma } from "@/lib/db/prisma";
import { cached } from "@/lib/cache/redis";
import type { ReviewInput } from "@/lib/validation/review";

function overallFrom(input: ReviewInput): number {
  const aspects = [
    input.cleanliness,
    input.internet,
    input.safety,
    input.noiseLevel,
    input.waterSupply,
    input.ownerFriendliness,
  ];
  return Math.round(aspects.reduce((sum, value) => sum + value, 0) / aspects.length);
}

export function upsertReview(studentId: string, boardingHouseId: string, input: ReviewInput) {
  const data = { ...input, overall: overallFrom(input) };
  return prisma.review.upsert({
    where: { boardingHouseId_authorId: { boardingHouseId, authorId: studentId } },
    update: data,
    create: { ...data, boardingHouseId, authorId: studentId },
  });
}

// The signed-in student's own review for a listing, if any (used to prefill the form).
export function findStudentReview(boardingHouseId: string, studentId: string) {
  return prisma.review.findUnique({
    where: { boardingHouseId_authorId: { boardingHouseId, authorId: studentId } },
  });
}

// Delete only if the review belongs to this student. Returns the deleted review's
// boardingHouseId (so the caller can invalidate that listing's cached reviews) or null
// if nothing matched — same ownership guarantee as before (delete only fires when the
// review is confirmed to belong to this student).
export async function deleteOwnReview(reviewId: string, studentId: string): Promise<string | null> {
  const owned = await prisma.review.findFirst({
    where: { id: reviewId, authorId: studentId },
    select: { boardingHouseId: true },
  });
  if (!owned) return null;

  await prisma.review.delete({ where: { id: reviewId } });
  return owned.boardingHouseId;
}

// All reviews a student has written, for their profile page.
export function findReviewsByStudent(studentId: string) {
  return prisma.review.findMany({
    where: { authorId: studentId },
    include: { boardingHouse: { select: { name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export function findReviews(boardingHouseId: string) {
  return cached(`reviews:${boardingHouseId}`, 600, () =>
    prisma.review.findMany({
      where: { boardingHouseId },
      include: { author: { select: { fullName: true } } },
      orderBy: { createdAt: "desc" },
    }),
  );
}

export interface RatingSummary {
  average: number;
  count: number;
}

export async function getRatingSummary(boardingHouseId: string): Promise<RatingSummary> {
  const result = await prisma.review.aggregate({
    where: { boardingHouseId },
    _avg: { overall: true },
    _count: true,
  });
  return {
    average: result._avg.overall ?? 0,
    count: result._count,
  };
}
