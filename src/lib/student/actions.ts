"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile, requireProfile } from "@/lib/auth/profile";
import { toggleFavorite } from "@/lib/db/favorites";
import { recordRecentlyViewed } from "@/lib/db/recently-viewed";
import { logAnalyticsEvent } from "@/lib/db/analytics";
import { publishedListingExists } from "@/lib/db/listing-guards";
import { allow, LIMITS } from "@/lib/security/rate-limit";
import { reportError } from "@/lib/security/errors";

// Save or unsave a listing. Returns the new state so the heart can update instantly.
// If the visitor isn't signed in, requireProfile sends them to the login page.
export async function toggleFavoriteAction(boardingHouseId: string): Promise<boolean> {
  const profile = await requireProfile();
  if (!(await allow("favorite", LIMITS.favorite, profile.id))) return false;

  // Never trust a client-supplied id — confirm it exists and is public.
  if (!(await publishedListingExists(boardingHouseId))) return false;

  try {
    const favorited = await toggleFavorite(profile.id, boardingHouseId);
    if (favorited) await logAnalyticsEvent(boardingHouseId, "FAVORITE");

    revalidatePath("/account");
    return favorited;
  } catch (error) {
    reportError("toggleFavorite", error);
    return false;
  }
}

// Record a recently viewed listing. Silent no-op for guests (never forces sign-in).
export async function recordViewAction(boardingHouseId: string): Promise<void> {
  const profile = await getCurrentProfile();
  if (!profile) return;
  if (!(await allow("recent", LIMITS.analytics, profile.id))) return;
  if (!(await publishedListingExists(boardingHouseId))) return;

  try {
    await recordRecentlyViewed(profile.id, boardingHouseId);
  } catch (error) {
    reportError("recordView", error);
  }
}
