"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile, requireProfile } from "@/lib/auth/profile";
import { toggleFavorite } from "@/lib/db/favorites";
import { recordRecentlyViewed } from "@/lib/db/recently-viewed";
import { logAnalyticsEvent } from "@/lib/db/analytics";

// Save or unsave a listing. Returns the new state so the heart can update instantly.
// If the visitor isn't signed in, requireProfile sends them to the login page.
export async function toggleFavoriteAction(boardingHouseId: string): Promise<boolean> {
  const profile = await requireProfile();
  const favorited = await toggleFavorite(profile.id, boardingHouseId);

  if (favorited) {
    await logAnalyticsEvent(boardingHouseId, "FAVORITE");
  }

  revalidatePath("/account");
  return favorited;
}

// Record a recently viewed listing. Silent no-op for guests (never forces sign-in).
export async function recordViewAction(boardingHouseId: string): Promise<void> {
  const profile = await getCurrentProfile();
  if (!profile) return;
  await recordRecentlyViewed(profile.id, boardingHouseId);
}
