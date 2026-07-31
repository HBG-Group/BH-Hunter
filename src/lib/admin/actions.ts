"use server";

import { revalidatePath } from "next/cache";
import { MIN_LISTING_PHOTOS } from "@/config/listing";
import { requireAdmin } from "@/lib/auth/profile";
import {
  deleteListingAsAdmin,
  deleteReviewById,
  isListingVerified,
  recordModerationEvent,
  setListingFeatured,
  setListingStatusAsAdmin,
  setListingVerified,
  setOwnerVerified,
} from "@/lib/db/admin";
import { listingExists } from "@/lib/db/listing-guards";
import { guarded } from "@/lib/security/errors";
import { logSecurityEvent } from "@/lib/security/events";
import { allow, LIMITS, RATE_LIMITED } from "@/lib/security/rate-limit";
import { RECENT_AUTH_REQUIRED, requireRecentAuth } from "@/lib/security/recent-auth";
import { removeListingPhoto } from "@/lib/storage/photos";
import { checkListingPhotos } from "@/services/photo-requirements";

type Result = { error?: string };

function revalidateAdmin() {
  revalidatePath("/admin");
  revalidatePath("/admin/listings");
}

async function ensureRecentAdminAuth(
  adminId: string,
  targetType: string,
  targetId: string,
  action: string,
): Promise<Result | null> {
  if (await requireRecentAuth()) return null;

  await logSecurityEvent({
    action,
    outcome: "denied",
    actorId: adminId,
    actorRole: "ADMIN",
    targetType,
    targetId,
    detail: "recent_auth_required",
  });
  return { error: RECENT_AUTH_REQUIRED };
}

export async function setVerifiedAction(id: string, verified: boolean): Promise<Result> {
  const admin = await requireAdmin();
  if (!(await allow("write", LIMITS.write, admin.id))) return { error: RATE_LIMITED };
  const recent = await ensureRecentAdminAuth(admin.id, "listing", id, "admin.setVerified");
  if (recent) return recent;

  return guarded<Result>(
    "setVerified",
    async () => {
      const ok = await setListingVerified(id, Boolean(verified));
      if (!ok) return { error: "That listing no longer exists." };

      await logSecurityEvent({
        action: "admin.setVerified",
        outcome: "allowed",
        actorId: admin.id,
        actorRole: admin.role,
        targetType: "listing",
        targetId: id,
        detail: verified ? "verified" : "verification_revoked",
      });
      await recordModerationEvent({
        actorId: admin.id,
        action: "LISTING_VERIFICATION",
        targetType: "listing",
        targetId: id,
        detail: verified ? "verified" : "verification_revoked",
      });
      revalidateAdmin();
      return {};
    },
    (message) => ({ error: message }),
  );
}

export async function moderateStatusAction(
  id: string,
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED",
): Promise<Result> {
  const admin = await requireAdmin();
  if (!(await allow("write", LIMITS.write, admin.id))) return { error: RATE_LIMITED };
  if (!(await listingExists(id))) return { error: "That listing no longer exists." };
  const recent = await ensureRecentAdminAuth(admin.id, "listing", id, "admin.moderateStatus");
  if (recent) return recent;

  return guarded<Result>(
    "moderateStatus",
    async () => {
      if (status === "PUBLISHED") {
        if (!(await isListingVerified(id))) {
          return { error: "Verify this listing before publishing it." };
        }
        const photos = await checkListingPhotos(id);
        if (!photos.met) {
          return {
            error: `This listing has ${photos.usable} of ${MIN_LISTING_PHOTOS} usable photos.`,
          };
        }
      }

      const ok = await setListingStatusAsAdmin(id, status);
      if (!ok) return { error: "That listing no longer exists." };

      await logSecurityEvent({
        action: "admin.moderateStatus",
        outcome: "allowed",
        actorId: admin.id,
        actorRole: admin.role,
        targetType: "listing",
        targetId: id,
        detail: status,
      });
      await recordModerationEvent({
        actorId: admin.id,
        action: "LISTING_STATUS",
        targetType: "listing",
        targetId: id,
        detail: status,
      });
      revalidateAdmin();
      return {};
    },
    (message) => ({ error: message }),
  );
}

export async function deleteListingAction(id: string): Promise<Result> {
  const admin = await requireAdmin();
  if (!(await allow("write", LIMITS.write, admin.id))) return { error: RATE_LIMITED };
  const recent = await ensureRecentAdminAuth(admin.id, "listing", id, "admin.deleteListing");
  if (recent) return recent;

  return guarded<Result>(
    "deleteListing",
    async () => {
      const urls = await deleteListingAsAdmin(id);
      if (urls === null) return { error: "That listing no longer exists." };

      for (const url of urls) await removeListingPhoto(url);

      await logSecurityEvent({
        action: "admin.deleteListing",
        outcome: "allowed",
        actorId: admin.id,
        actorRole: admin.role,
        targetType: "listing",
        targetId: id,
      });
      await recordModerationEvent({
        actorId: admin.id,
        action: "LISTING_DELETION",
        targetType: "listing",
        targetId: id,
      });
      revalidateAdmin();
      revalidatePath("/");
      return {};
    },
    (message) => ({ error: message }),
  );
}

export async function setFeaturedAction(id: string, featured: boolean): Promise<Result> {
  const admin = await requireAdmin();
  if (!(await allow("write", LIMITS.write, admin.id))) return { error: RATE_LIMITED };
  const recent = await ensureRecentAdminAuth(admin.id, "listing", id, "admin.setFeatured");
  if (recent) return recent;

  return guarded<Result>(
    "setFeatured",
    async () => {
      const ok = await setListingFeatured(id, Boolean(featured));
      if (!ok) return { error: "That listing no longer exists." };

      await logSecurityEvent({
        action: "admin.setFeatured",
        outcome: "allowed",
        actorId: admin.id,
        actorRole: admin.role,
        targetType: "listing",
        targetId: id,
        detail: featured ? "featured" : "unfeatured",
      });
      await recordModerationEvent({
        actorId: admin.id,
        action: "LISTING_FEATURED",
        targetType: "listing",
        targetId: id,
        detail: featured ? "featured" : "unfeatured",
      });
      revalidateAdmin();
      revalidatePath("/");
      return {};
    },
    (message) => ({ error: message }),
  );
}

export async function setOwnerVerifiedAction(ownerId: string, verified: boolean): Promise<Result> {
  const admin = await requireAdmin();
  if (!(await allow("write", LIMITS.write, admin.id))) return { error: RATE_LIMITED };
  const recent = await ensureRecentAdminAuth(admin.id, "owner", ownerId, "admin.setOwnerVerified");
  if (recent) return recent;

  return guarded<Result>(
    "setOwnerVerified",
    async () => {
      const ok = await setOwnerVerified(ownerId, Boolean(verified));
      if (!ok) return { error: "That owner no longer exists." };

      await logSecurityEvent({
        action: "admin.setOwnerVerified",
        outcome: "allowed",
        actorId: admin.id,
        actorRole: admin.role,
        targetType: "owner",
        targetId: ownerId,
        detail: verified ? "verified" : "verification_revoked",
      });
      await recordModerationEvent({
        actorId: admin.id,
        action: "OWNER_VERIFICATION",
        targetType: "owner",
        targetId: ownerId,
        detail: verified ? "verified" : "verification_revoked",
      });
      revalidateAdmin();
      return {};
    },
    (message) => ({ error: message }),
  );
}

export async function deleteReviewAction(id: string): Promise<Result> {
  const admin = await requireAdmin();
  if (!(await allow("write", LIMITS.write, admin.id))) return { error: RATE_LIMITED };
  const recent = await ensureRecentAdminAuth(admin.id, "review", id, "admin.deleteReview");
  if (recent) return recent;

  return guarded<Result>(
    "adminDeleteReview",
    async () => {
      const deleted = await deleteReviewById(id);
      if (!deleted) return { error: "That review no longer exists." };
      await logSecurityEvent({
        action: "admin.deleteReview",
        outcome: "allowed",
        actorId: admin.id,
        actorRole: admin.role,
        targetType: "review",
        targetId: id,
      });
      await recordModerationEvent({
        actorId: admin.id,
        action: "REVIEW_DELETION",
        targetType: "review",
        targetId: id,
      });
      revalidatePath("/admin/reviews");
      return {};
    },
    (message) => ({ error: message }),
  );
}
