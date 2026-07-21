"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth/profile";
import { setRoomAvailableAlerts } from "@/lib/db/notifications";
import { allow, LIMITS } from "@/lib/security/rate-limit";
import { reportError } from "@/lib/security/errors";

// Toggle "room available" alerts for the signed-in student.
export async function updateRoomAlertsAction(enabled: boolean): Promise<void> {
  const profile = await requireProfile("/account");
  if (!(await allow("write", LIMITS.write, profile.id))) return;

  try {
    await setRoomAvailableAlerts(profile.id, Boolean(enabled));
    revalidatePath("/account");
  } catch (error) {
    reportError("updateRoomAlerts", error);
  }
}
