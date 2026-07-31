"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/profile";
import { MIN_LISTING_PHOTOS } from "@/config/listing";
import {
  deleteListingAsAdmin,
  deleteReviewById,
  isListingVerified,
  setListingFeatured,
  setListingStatusAsAdmin,
  setListingVerified,
  setOwnerFrozen,
  setOwnerPlan,
  setOwnerVerified,
  type OwnerPlanId,
} from "@/lib/db/admin";
import { deleteAccountCompletely } from "@/lib/account/deletion";
import { removeListingPhoto } from "@/lib/storage/photos";
import { listingExists } from "@/lib/db/listing-guards";
import { checkListingPhotos } from "@/services/photo-requirements";
import { allow, LIMITS, RATE_LIMITED } from "@/lib/security/rate-limit";
import { guarded } from "@/lib/security/errors";

type Result = { error?: string };

function revalidateAdmin() {
  revalidatePath("/admin");
  revalidatePath("/admin/listings");
  revalidatePath("/admin/owners");
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

// Permanently delete a listing and its photos. Admin-only, irreversible.
export async function deleteListingAction(id: string): Promise<Result> {
  const admin = await requireAdmin();
  if (!(await allow("write", LIMITS.write, admin.id))) return { error: RATE_LIMITED };

  return guarded<Result>(
    "deleteListing",
    async () => {
      const urls = await deleteListingAsAdmin(id);
      if (urls === null) return { error: "That listing no longer exists." };

      // Remove the stored files after the rows are gone (best-effort).
      for (const url of urls) await removeListingPhoto(url);

      revalidateAdmin();
      revalidatePath("/"); // it may have been on the homepage
      return {};
    },
    (message) => ({ error: message }),
  );
}

// Promote or demote a listing on the homepage. Admin-only.
export async function setFeaturedAction(id: string, featured: boolean): Promise<Result> {
  const admin = await requireAdmin();
  if (!(await allow("write", LIMITS.write, admin.id))) return { error: RATE_LIMITED };

  return guarded<Result>(
    "setFeatured",
    async () => {
      const ok = await setListingFeatured(id, Boolean(featured));
      if (!ok) return { error: "That listing no longer exists." };
      revalidateAdmin();
      revalidatePath("/"); // featured order is visible on the homepage
      return {};
    },
    (message) => ({ error: message }),
  );
}

// Grant or revoke an owner's Verified Owner badge. Admin-only.
export async function setOwnerVerifiedAction(ownerId: string, verified: boolean): Promise<Result> {
  const admin = await requireAdmin();
  if (!(await allow("write", LIMITS.write, admin.id))) return { error: RATE_LIMITED };

  return guarded<Result>(
    "setOwnerVerified",
    async () => {
      const ok = await setOwnerVerified(ownerId, Boolean(verified));
      if (!ok) return { error: "That owner no longer exists." };
      revalidateAdmin();
      return {};
    },
    (message) => ({ error: message }),
  );
}

// Assign a pricing plan to an owner. This automatically applies the plan's perks
// (Verified badge for Advance/Premium, Featured listings for Premium). Admin-only.
export async function setOwnerPlanAction(ownerId: string, plan: string): Promise<Result> {
  const admin = await requireAdmin();
  if (!(await allow("write", LIMITS.write, admin.id))) return { error: RATE_LIMITED };

  if (plan !== "BASIC" && plan !== "ADVANCE" && plan !== "PREMIUM") {
    return { error: "Unknown plan." };
  }

  return guarded<Result>(
    "setOwnerPlan",
    async () => {
      const ok = await setOwnerPlan(ownerId, plan as OwnerPlanId);
      if (!ok) return { error: "That owner no longer exists." };
      revalidateAdmin();
      return {};
    },
    (message) => ({ error: message }),
  );
}

// Freeze or unfreeze an owner. Frozen owners keep their listings live but lose write
// access to the dashboard until an admin unfreezes them.
export async function setOwnerFrozenAction(ownerId: string, frozen: boolean): Promise<Result> {
  const admin = await requireAdmin();
  if (!(await allow("write", LIMITS.write, admin.id))) return { error: RATE_LIMITED };

  return guarded<Result>(
    "setOwnerFrozen",
    async () => {
      const ok = await setOwnerFrozen(ownerId, Boolean(frozen));
      if (!ok) return { error: "That owner no longer exists." };
      revalidateAdmin();
      return {};
    },
    (message) => ({ error: message }),
  );
}

// Permanently delete an owner and everything tied to them (listings, images, requests,
// favorites, reviews, notifications, storage files, and the auth user).
export async function deleteOwnerAction(ownerId: string): Promise<Result> {
  const admin = await requireAdmin();
  if (!(await allow("write", LIMITS.write, admin.id))) return { error: RATE_LIMITED };
  // An admin can't delete their own account from here.
  if (ownerId === admin.id) return { error: "You can't delete your own account here." };

  return guarded<Result>(
    "deleteOwner",
    async () => {
      await deleteAccountCompletely(ownerId);
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
