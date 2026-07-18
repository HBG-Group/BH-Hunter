"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth/profile";
import { markNotificationsRead, setRoomAvailableAlerts } from "@/lib/db/notifications";

// Toggle "room available" alerts for the signed-in student.
export async function updateRoomAlertsAction(enabled: boolean): Promise<void> {
  const profile = await requireProfile("/account");
  await setRoomAvailableAlerts(profile.id, enabled);
  revalidatePath("/account");
}

// Mark all of the student's notifications as read.
export async function markNotificationsReadAction(): Promise<void> {
  const profile = await requireProfile("/account");
  await markNotificationsRead(profile.id);
  revalidatePath("/account");
}
