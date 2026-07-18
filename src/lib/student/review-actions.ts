"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth/profile";
import { deleteOwnReview, upsertReview } from "@/lib/db/reviews";
import { reviewSchema } from "@/lib/validation/review";

export interface ReviewFormState {
  error?: string;
  success?: boolean;
}

interface Target {
  boardingHouseId: string;
  slug: string;
}

// Submit (or update) the current student's review for a listing.
export async function submitReviewAction(
  target: Target,
  _prev: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const profile = await requireProfile(`/listings/${target.slug}`);

  const parsed = reviewSchema.safeParse({
    cleanliness: formData.get("cleanliness"),
    internet: formData.get("internet"),
    safety: formData.get("safety"),
    noiseLevel: formData.get("noiseLevel"),
    waterSupply: formData.get("waterSupply"),
    ownerFriendliness: formData.get("ownerFriendliness"),
    body: formData.get("body") ?? undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your ratings" };
  }

  await upsertReview(profile.id, target.boardingHouseId, parsed.data);
  revalidatePath(`/listings/${target.slug}`);
  return { success: true };
}

// Delete the student's own review.
export async function deleteReviewAction(reviewId: string, slug: string): Promise<void> {
  const profile = await requireProfile(`/listings/${slug}`);
  await deleteOwnReview(reviewId, profile.id);
  revalidatePath(`/listings/${slug}`);
}
