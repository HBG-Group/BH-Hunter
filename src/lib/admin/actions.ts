"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/profile";
import {
  deleteReviewById,
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
) {
  await requireAdmin();
  await setListingStatusAsAdmin(id, status);
  revalidatePath("/admin/listings");
}

// Remove an inappropriate review.
export async function deleteReviewAction(id: string) {
  await requireAdmin();
  await deleteReviewById(id);
  revalidatePath("/admin/reviews");
}
