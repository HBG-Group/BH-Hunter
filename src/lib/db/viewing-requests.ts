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

export type OwnerRequestFilter = "all" | "pending" | "confirmed";

// The requests across all of an owner's listings, newest first, optionally narrowed by
// status. Includes the student's email so the owner can reach out (phone is often empty).
export function findViewingRequestsForOwner(ownerId: string, filter: OwnerRequestFilter = "all") {
  const status =
    filter === "pending" ? "PENDING" : filter === "confirmed" ? "CONFIRMED" : undefined;

  return prisma.viewingRequest.findMany({
    where: { boardingHouse: { ownerId }, ...(status ? { status } : {}) },
    include: {
      student: { select: { fullName: true, phone: true, email: true } },
      boardingHouse: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

// Confirm/decline a request — scoped so an owner can only touch requests on their own
// listings. Returns false when nothing matched (not theirs, or already gone).
export async function setViewingRequestStatus(
  ownerId: string,
  id: string,
  status: "CONFIRMED" | "DECLINED",
): Promise<boolean> {
  const result = await prisma.viewingRequest.updateMany({
    where: { id, boardingHouse: { ownerId } },
    data: { status },
  });
  return result.count > 0;
}

// Delete a request the owner is done with. Scoped to their own listings.
export async function deleteViewingRequest(ownerId: string, id: string): Promise<boolean> {
  const result = await prisma.viewingRequest.deleteMany({
    where: { id, boardingHouse: { ownerId } },
  });
  return result.count > 0;
}

// Confirmed viewing dates for a listing, used by the public calendar so students can see
// which days are already taken. Only CONFIRMED requests count — pending/declined never
// block a date. Returns just the dates, never who booked them.
export async function findConfirmedViewingDates(boardingHouseId: string): Promise<Date[]> {
  const rows = await prisma.viewingRequest.findMany({
    where: { boardingHouseId, status: "CONFIRMED" },
    select: { preferredAt: true },
    orderBy: { preferredAt: "asc" },
  });
  return rows.map((row) => row.preferredAt);
}

// A student's own requests, for their account page.
export function findViewingRequestsByStudent(studentId: string) {
  return prisma.viewingRequest.findMany({
    where: { studentId },
    include: { boardingHouse: { select: { name: true, slug: true } } },
    orderBy: { preferredAt: "desc" },
  });
}
