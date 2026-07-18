// Data access for student notifications and their preferences.

import { prisma } from "@/lib/db/prisma";

// Load a student's settings, creating defaults on first access.
export async function getNotificationPreference(studentId: string) {
  return prisma.notificationPreference.upsert({
    where: { studentId },
    update: {},
    create: { studentId },
  });
}

export function setRoomAvailableAlerts(studentId: string, enabled: boolean) {
  return prisma.notificationPreference.upsert({
    where: { studentId },
    update: { roomAvailableAlerts: enabled },
    create: { studentId, roomAvailableAlerts: enabled },
  });
}

export function findNotifications(studentId: string, limit = 20) {
  return prisma.notification.findMany({
    where: { userId: studentId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export function markNotificationsRead(studentId: string) {
  return prisma.notification.updateMany({
    where: { userId: studentId, readAt: null },
    data: { readAt: new Date() },
  });
}

// Notify students who favorited this listing and haven't opted out of room alerts.
export async function createRoomAvailableNotifications(boardingHouseId: string): Promise<number> {
  const listing = await prisma.boardingHouse.findUnique({
    where: { id: boardingHouseId },
    select: { name: true },
  });
  if (!listing) return 0;

  const favorites = await prisma.favorite.findMany({
    where: { boardingHouseId },
    select: { studentId: true },
  });
  const studentIds = favorites.map((favorite) => favorite.studentId);
  if (studentIds.length === 0) return 0;

  // Students default to receiving alerts; only those who explicitly turned them off are excluded.
  const optedOut = await prisma.notificationPreference.findMany({
    where: { studentId: { in: studentIds }, roomAvailableAlerts: false },
    select: { studentId: true },
  });
  const optedOutSet = new Set(optedOut.map((row) => row.studentId));
  const recipients = studentIds.filter((id) => !optedOutSet.has(id));
  if (recipients.length === 0) return 0;

  await prisma.notification.createMany({
    data: recipients.map((studentId) => ({
      userId: studentId,
      type: "ROOM_AVAILABLE",
      title: `A room opened up at ${listing.name}`,
      body: `${listing.name} now has availability. Check it out before it fills up.`,
    })),
  });
  return recipients.length;
}
