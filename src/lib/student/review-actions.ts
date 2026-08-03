"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth/profile";
import {
  deleteOwnReview,
  findStudentReview,
  hasConfirmedViewingRequest,
  upsertReview,
} from "@/lib/db/reviews";
import { reviewSchema } from "@/lib/validation/review";
import { publishedListingExists } from "@/lib/db/listing-guards";
import { allow, LIMITS, RATE_LIMITED } from "@/lib/security/rate-limit";
import { guarded } from "@/lib/security/errors";
import { invalidate } from "@/lib/cache/redis";

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
  if (profile.role !== "STUDENT") {
    return { error: "Only student accounts can submit reviews." };
  }
  if (!(await allow("review", LIMITS.review, profile.id)))
    return { error: RATE_LIMITED };

  // Verify the listing is real and public before accepting a review for it.
  if (!(await publishedListingExists(target.boardingHouseId))) {
    return { error: "That listing is no longer available." };
  }

  // Only confirmed visitors may create a review. Keep an existing review editable
  // so users are never locked out of correcting their own feedback.
  const existingReview = await findStudentReview(
    target.boardingHouseId,
    profile.id,
  );
  if (
    !existingReview &&
    !(await hasConfirmedViewingRequest(profile.id, target.boardingHouseId))
  ) {
    return {
      error:
        "You can leave a review after the owner confirms your viewing request.",
    };
  }

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
    return {
      error: parsed.error.issues[0]?.message ?? "Please check your ratings",
    };
  }

  return guarded<ReviewFormState>(
    "submitReview",
    async () => {
      await upsertReview(profile.id, target.boardingHouseId, parsed.data);
      await invalidate(
        `reviews:${target.boardingHouseId}`,
        `listing:${target.slug}`,
      );
      revalidatePath(`/listings/${target.slug}`);
      return { success: true };
    },
    (message) => ({ error: message }),
  );
}

// Delete the student's own review.
export async function deleteReviewAction(
  reviewId: string,
  slug: string,
): Promise<void> {
  const profile = await requireProfile(`/listings/${slug}`);
  if (!(await allow("write", LIMITS.write, profile.id))) return;

  // Verify ownership — deleteOwnReview is scoped to the author.
  const boardingHouseId = await deleteOwnReview(reviewId, profile.id);
  if (boardingHouseId)
    await invalidate(`reviews:${boardingHouseId}`, `listing:${slug}`);
  revalidatePath(`/listings/${slug}`);
}
