"use server";

import { logAnalyticsEvent } from "@/lib/db/analytics";

// Public actions any visitor can trigger. These only ever insert an analytics row,
// so they are safe to call without authentication.
export async function logContactClickAction(boardingHouseId: string) {
  await logAnalyticsEvent(boardingHouseId, "CONTACT_CLICK");
}

export async function logProfileViewAction(boardingHouseId: string) {
  await logAnalyticsEvent(boardingHouseId, "VIEW");
}
