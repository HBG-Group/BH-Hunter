// Data access for viewing requests — a student asking to visit a boarding house.

import { prisma } from "@/lib/db/prisma";

export function isDuplicateViewingRequestError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}

export async function createViewingRequest(
  studentId: string,
  boardingHouseId: string,
  preferredAt: Date,
  message?: string,
): Promise<boolean> {
  try {
    await prisma.viewingRequest.create({
      data: { studentId, boardingHouseId, preferredAt, message },
    });
    return true;
  } catch (error) {
    // The database unique constraint is the race-safe idempotency boundary.
    if (isDuplicateViewingRequestError(error)) return false;
    throw error;
  }
}

// The requests across all of an owner's listings, newest first.
export function findViewingRequestsForOwner(ownerId: string) {
  return prisma.viewingRequest.findMany({
    where: { boardingHouse: { ownerId } },
    include: {
      student: { select: { fullName: true, phone: true } },
      boardingHouse: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

// A student's own requests, for their account page.
export function findViewingRequestsByStudent(studentId: string) {
  return prisma.viewingRequest.findMany({
    where: { studentId },
    include: { boardingHouse: { select: { name: true, slug: true } } },
    orderBy: { preferredAt: "desc" },
  });
}
