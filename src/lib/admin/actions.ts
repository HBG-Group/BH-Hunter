"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/profile";
import { MIN_LISTING_PHOTOS } from "@/config/listing";
import {
  deleteReviewById,
  isListingVerified,
  setListingStatusAsAdmin,
  setListingVerified,
} from "@/lib/db/admin";
import { listingExists } from "@/lib/db/listing-guards";
import { checkListingPhotos } from "@/services/photo-requirements";
import { allow, LIMITS, RATE_LIMITED } from "@/lib/security/rate-limit";
import { guarded } from "@/lib/security/errors";

type Result = { error?: string };

function revalidateAdmin() {
  revalidatePath("/admin");
  revalidatePath("/admin/listings");
}

// Approve or revoke verification for a listing.
export async function setVerifiedAction(id: string, verified: boolean): Promise<Result> {
  const admin = await requireAdmin();
  if (!(await allow("write", LIMITS.write, admin.id))) return { error: RATE_LIMITED };

  return guarded<Result>(
    "setVerified",
    async () => {
      const ok = await setListingVerified(id, Boolean(verified));
      if (!ok) return { error: "That listing no longer exists." };
      revalidateAdmin();
      return {};
    },
    (message) => ({ error: message }),
  );
}

// Moderation: force a listing's status. Publishing is gated on verification and on
// photos that actually exist in Storage, so the requirement cannot be faked.
export async function moderateStatusAction(
  id: string,
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED",
): Promise<Result> {
  const admin = await requireAdmin();
  if (!(await allow("write", LIMITS.write, admin.id))) return { error: RATE_LIMITED };
  if (!(await listingExists(id))) return { error: "That listing no longer exists." };

  return guarded<Result>(
    "moderateStatus",
    async () => {
      if (status === "PUBLISHED") {
        // Trust and credibility: verify before it can go live.
        if (!(await isListingVerified(id))) {
          return { error: "Verify this listing before publishing it." };
        }
        // Storage-backed count, so fabricated image rows can't satisfy the minimum.
        const photos = await checkListingPhotos(id);
        if (!photos.met) {
          return {
            error: `This listing has ${photos.usable} of ${MIN_LISTING_PHOTOS} usable photos.`,
          };
        }
      }

      const ok = await setListingStatusAsAdmin(id, status);
      if (!ok) return { error: "That listing no longer exists." };

      revalidateAdmin();
      return {};
    },
    (message) => ({ error: message }),
  );
}

// Remove an inappropriate review.
export async function deleteReviewAction(id: string): Promise<Result> {
  const admin = await requireAdmin();
  if (!(await allow("write", LIMITS.write, admin.id))) return { error: RATE_LIMITED };

  return guarded<Result>(
    "adminDeleteReview",
    async () => {
      await deleteReviewById(id);
      revalidatePath("/admin/reviews");
      return {};
    },
    (message) => ({ error: message }),
  );
}
