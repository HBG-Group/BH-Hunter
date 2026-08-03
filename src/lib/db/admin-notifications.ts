import { prisma } from "@/lib/db/prisma";

export interface AdminNotification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  createdAt: Date;
  readAt: Date | null;
}

export async function notifyAdmins(input: {
  type: string;
  title: string;
  body?: string;
}) {
  const admins = await prisma.profile.findMany({
    where: { role: "ADMIN" },
    select: { id: true },
  });
  if (!admins.length) return;
  await prisma.notification.createMany({
    data: admins.map((admin) => ({
      userId: admin.id,
      type: input.type,
      title: input.title,
      body: input.body,
    })),
  });
}

export function findAdminNotifications(
  adminId: string,
): Promise<AdminNotification[]> {
  return prisma.notification.findMany({
    where: { userId: adminId },
    select: {
      id: true,
      type: true,
      title: true,
      body: true,
      createdAt: true,
      readAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
}

export async function markAdminNotificationRead(
  adminId: string,
  notificationId: string,
) {
  return (
    (
      await prisma.notification.updateMany({
        where: { id: notificationId, userId: adminId, readAt: null },
        data: { readAt: new Date() },
      })
    ).count > 0
  );
}

export async function markAllAdminNotificationsRead(adminId: string) {
  return prisma.notification.updateMany({
    where: { userId: adminId, readAt: null },
    data: { readAt: new Date() },
  });
}

export function findAdminNotificationHistory(
  adminId: string,
): Promise<AdminNotification[]> {
  return prisma.notification.findMany({
    where: { userId: adminId },
    select: {
      id: true,
      type: true,
      title: true,
      body: true,
      createdAt: true,
      readAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}
