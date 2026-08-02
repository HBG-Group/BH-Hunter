import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { ReportReason, ReportStatus, ReportTargetType } from "@prisma/client";

// A report's target id must refer to a real record of the right kind before we
// accept it — otherwise an invented id reaches the reports table unchecked.
export async function reportTargetExists(targetType: ReportTargetType, targetId: string): Promise<boolean> {
  if (targetId.length > 191) return false;
  switch (targetType) {
    case "LISTING":
      return (await prisma.boardingHouse.findUnique({ where: { id: targetId }, select: { id: true } })) !== null;
    case "REVIEW":
      return (await prisma.review.findUnique({ where: { id: targetId }, select: { id: true } })) !== null;
    case "OWNER":
      return (
        (await prisma.profile.findFirst({ where: { id: targetId, role: "OWNER" }, select: { id: true } })) !== null
      );
    case "STUDENT":
      return (
        (await prisma.profile.findFirst({ where: { id: targetId, role: "STUDENT" }, select: { id: true } })) !== null
      );
  }
}

export function createReport(input: {
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  message?: string;
}) {
  return prisma.report.create({ data: input });
}

export interface ReportRow {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  message: string | null;
  status: ReportStatus;
  resolution: string | null;
  resolvedAt: Date | null;
  createdAt: Date;
  reporter: { id: string; fullName: string; email: string };
  resolvedBy: { id: string; fullName: string } | null;
}

export function listReports(status?: ReportStatus): Promise<ReportRow[]> {
  return prisma.report.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      targetType: true,
      targetId: true,
      reason: true,
      message: true,
      status: true,
      resolution: true,
      resolvedAt: true,
      createdAt: true,
      reporter: { select: { id: true, fullName: true, email: true } },
      resolvedBy: { select: { id: true, fullName: true } },
    },
  });
}

export function countOpenReports(): Promise<number> {
  return prisma.report.count({ where: { status: "OPEN" } });
}

// Returns null if the report no longer exists, otherwise the resolved row.
export async function resolveReport(
  id: string,
  resolvedById: string,
  status: "RESOLVED" | "DISMISSED",
  resolution?: string,
) {
  const result = await prisma.report.updateMany({
    where: { id, status: "OPEN" },
    data: { status, resolvedById, resolution, resolvedAt: new Date() },
  });
  return result.count > 0;
}
