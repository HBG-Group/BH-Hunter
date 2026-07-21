"use server";

import { logAnalyticsEvent } from "@/lib/db/analytics";
import { publishedListingExists } from "@/lib/db/listing-guards";
import { allow, clientKey, LIMITS } from "@/lib/security/rate-limit";
import { reportError } from "@/lib/security/errors";

// Public actions any visitor can trigger, so they are rate limited per client and
// only ever write for a listing that exists and is published. Failures are swallowed:
// analytics must never break the page or leak internals.
async function record(boardingHouseId: string, type: "VIEW" | "CONTACT_CLICK") {
  const who = await clientKey();
  if (!(await allow(`analytics:${type}`, LIMITS.analytics, who))) return;
  if (!(await publishedListingExists(boardingHouseId))) return;

  try {
    await logAnalyticsEvent(boardingHouseId, type);
  } catch (error) {
    reportError("logAnalyticsEvent", error);
  }
}

export async function logContactClickAction(boardingHouseId: string) {
  await record(boardingHouseId, "CONTACT_CLICK");
}

export async function logProfileViewAction(boardingHouseId: string) {
  await record(boardingHouseId, "VIEW");
}
