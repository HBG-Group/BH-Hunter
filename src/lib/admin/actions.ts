"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/profile";
import { countImages } from "@/lib/db/images";
import { MIN_LISTING_PHOTOS } from "@/config/listing";
import {
  deleteReviewById,
  isListingVerified,
  setListingStatusAsAdmin,
  setListingVerified,
} from "@/lib/db/admin";

// Approve or revoke verification for a listing.
export async function setVerifiedAction(id: string, verified: boolean) {
  await requireAdmin();
  await setListingVerified(id, verified);
  revalidatePath("/admin");
  revalidatePath("/admin/listings");
}

// Moderation: force a listing's status (e.g. take down a bad listing).
export async function moderateStatusAction(
  id: string,
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED",
): Promise<{ error?: string }> {
  await requireAdmin();

  if (status === "PUBLISHED") {
    // Trust and credibility: verify before it can go live.
    if (!(await isListingVerified(id))) {
      return { error: "Verify this listing before publishing it." };
    }
    // Don't let an under-photographed listing go live.
    const photos = await countImages(id);
    if (photos < MIN_LISTING_PHOTOS) {
      return { error: `This listing has ${photos} of ${MIN_LISTING_PHOTOS} required photos.` };
    }
  }

  await setListingStatusAsAdmin(id, status);
  revalidatePath("/admin");
  revalidatePath("/admin/listings");
  return {};
}

// Remove an inappropriate review.
export async function deleteReviewAction(id: string) {
  await requireAdmin();
  await deleteReviewById(id);
  revalidatePath("/admin/reviews");
}
