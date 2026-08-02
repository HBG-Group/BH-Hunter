"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth/profile";
import { createReport, reportTargetExists } from "@/lib/db/report";
import { reportSchema } from "@/lib/validation/report";
import { allow, LIMITS, RATE_LIMITED } from "@/lib/security/rate-limit";
import { guarded } from "@/lib/security/errors";
import { logSecurityEvent } from "@/lib/security/events";

interface Result {
  error?: string;
  success?: boolean;
}

// Lets any signed-in student or owner report a listing, review, owner, or student.
export async function fileReportAction(input: unknown): Promise<Result> {
  const profile = await requireProfile("/");
  if (!(await allow("report", LIMITS.report, profile.id))) return { error: RATE_LIMITED };

  const parsed = reportSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your report." };
  }
  const { targetType, targetId, reason, message } = parsed.data;

  // Reporting yourself isn't meaningful and only pollutes the queue.
  if ((targetType === "OWNER" || targetType === "STUDENT") && targetId === profile.id) {
    return { error: "You can't report your own account." };
  }

  return guarded<Result>(
    "fileReport",
    async () => {
      if (!(await reportTargetExists(targetType, targetId))) {
        return { error: "That no longer exists." };
      }

      await createReport({ reporterId: profile.id, targetType, targetId, reason, message });
      await logSecurityEvent({
        action: "report.file",
        outcome: "allowed",
        actorId: profile.id,
        actorRole: profile.role,
        targetType: targetType.toLowerCase(),
        targetId,
        detail: reason,
      });

      revalidatePath("/admin/reports");
      return { success: true };
    },
    (msg) => ({ error: msg }),
  );
}
