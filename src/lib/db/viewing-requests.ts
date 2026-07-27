// Data access for viewing requests — a student asking to visit a boarding house.

import { prisma } from "@/lib/db/prisma";

export function createViewingRequest(
  studentId: string,
  boardingHouseId: string,
  preferredAt: Date,
  message?: string,
) {
  return prisma.viewingRequest.create({
    data: { studentId, boardingHouseId, preferredAt, message },
  });
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

// A student's own requests, for their account page.
export function findViewingRequestsByStudent(studentId: string) {
  return prisma.viewingRequest.findMany({
    where: { studentId },
    include: { boardingHouse: { select: { name: true, slug: true } } },
    orderBy: { preferredAt: "desc" },
  });
}
