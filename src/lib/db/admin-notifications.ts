import { prisma } from "@/lib/db/prisma";

const NOTIFICATION_RETENTION_DAYS = 90;
const DEDUPE_WINDOW_MINUTES = 5;

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
  const retentionCutoff = new Date(
    Date.now() - NOTIFICATION_RETENTION_DAYS * 24 * 60 * 60 * 1000,
  );
  const dedupeCutoff = new Date(Date.now() - DEDUPE_WINDOW_MINUTES * 60 * 1000);
  const admins = await prisma.profile.findMany({
    where: { role: "ADMIN" },
    select: { id: true },
  });
  if (!admins.length) return;
  const adminIds = admins.map((admin) => admin.id);
  await prisma.notification.deleteMany({
    where: { userId: { in: adminIds }, createdAt: { lt: retentionCutoff } },
  });
  const duplicates = await prisma.notification.findMany({
    where: {
      userId: { in: adminIds },
      type: input.type,
      title: input.title,
      body: input.body,
      createdAt: { gte: dedupeCutoff },
    },
    select: { userId: true },
  });
  const alreadyNotified = new Set(
    duplicates.map((notification) => notification.userId),
  );
  const recipients = admins.filter((admin) => !alreadyNotified.has(admin.id));
  if (!recipients.length) return;
  await prisma.notification.createMany({
    data: recipients.map((admin) => ({
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
    where: {
      userId: adminId,
      createdAt: {
        gte: new Date(
          Date.now() - NOTIFICATION_RETENTION_DAYS * 24 * 60 * 60 * 1000,
        ),
      },
    },
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
