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
  setOwnerFrozen,
  setOwnerPlan,
  setOwnerVerified,
  setOwnerVerificationRejected,
  type OwnerPlanId,
} from "@/lib/db/admin";
import { deleteAccountCompletely } from "@/lib/account/deletion";
import { listingExists } from "@/lib/db/listing-guards";
import { resolveReport } from "@/lib/db/report";
import { resolveReportSchema } from "@/lib/validation/report";
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
  revalidatePath("/admin/owners");
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

// Decline a pending verification request without granting the badge.
export async function rejectOwnerVerificationAction(ownerId: string): Promise<Result> {
  const admin = await requireAdmin();
  if (!(await allow("write", LIMITS.write, admin.id))) return { error: RATE_LIMITED };
  const recent = await ensureRecentAdminAuth(admin.id, "owner", ownerId, "admin.rejectOwnerVerification");
  if (recent) return recent;

  return guarded<Result>(
    "rejectOwnerVerification",
    async () => {
      const ok = await setOwnerVerificationRejected(ownerId);
      if (!ok) return { error: "That owner no longer exists." };

      await logSecurityEvent({
        action: "admin.rejectOwnerVerification",
        outcome: "allowed",
        actorId: admin.id,
        actorRole: admin.role,
        targetType: "owner",
        targetId: ownerId,
        detail: "rejected",
      });
      await recordModerationEvent({
        actorId: admin.id,
        action: "OWNER_VERIFICATION",
        targetType: "owner",
        targetId: ownerId,
        detail: "rejected",
      });
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
  const recent = await ensureRecentAdminAuth(admin.id, "owner", ownerId, "admin.setOwnerPlan");
  if (recent) return recent;

  if (plan !== "BASIC" && plan !== "ADVANCE" && plan !== "PREMIUM") {
    return { error: "Unknown plan." };
  }

  return guarded<Result>(
    "setOwnerPlan",
    async () => {
      const ok = await setOwnerPlan(ownerId, plan as OwnerPlanId);
      if (!ok) return { error: "That owner no longer exists." };
      await logSecurityEvent({
        action: "admin.setOwnerPlan",
        outcome: "allowed",
        actorId: admin.id,
        actorRole: admin.role,
        targetType: "owner",
        targetId: ownerId,
        detail: plan,
      });
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
  const recent = await ensureRecentAdminAuth(admin.id, "owner", ownerId, "admin.setOwnerFrozen");
  if (recent) return recent;

  return guarded<Result>(
    "setOwnerFrozen",
    async () => {
      const ok = await setOwnerFrozen(ownerId, Boolean(frozen));
      if (!ok) return { error: "That owner no longer exists." };
      await logSecurityEvent({
        action: "admin.setOwnerFrozen",
        outcome: "allowed",
        actorId: admin.id,
        actorRole: admin.role,
        targetType: "owner",
        targetId: ownerId,
        detail: frozen ? "frozen" : "unfrozen",
      });
      await recordModerationEvent({
        actorId: admin.id,
        action: "OWNER_FREEZE",
        targetType: "owner",
        targetId: ownerId,
        detail: frozen ? "frozen" : "unfrozen",
      });
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
  const recent = await ensureRecentAdminAuth(admin.id, "owner", ownerId, "admin.deleteOwner");
  if (recent) return recent;

  return guarded<Result>(
    "deleteOwner",
    async () => {
      await deleteAccountCompletely(ownerId);
      await logSecurityEvent({
        action: "admin.deleteOwner",
        outcome: "allowed",
        actorId: admin.id,
        actorRole: admin.role,
        targetType: "owner",
        targetId: ownerId,
      });
      await recordModerationEvent({
        actorId: admin.id,
        action: "OWNER_DELETION",
        targetType: "owner",
        targetId: ownerId,
      });
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

// Resolve or dismiss a user-filed report.
export async function resolveReportAction(
  id: string,
  status: "RESOLVED" | "DISMISSED",
  resolution?: string,
): Promise<Result> {
  const admin = await requireAdmin();
  if (!(await allow("write", LIMITS.write, admin.id))) return { error: RATE_LIMITED };
  const parsed = resolveReportSchema.safeParse({ status, resolution });
  if (!parsed.success) return { error: "Please check the resolution details." };
  const recent = await ensureRecentAdminAuth(admin.id, "report", id, "admin.resolveReport");
  if (recent) return recent;

  return guarded<Result>(
    "resolveReport",
    async () => {
      const ok = await resolveReport(id, admin.id, parsed.data.status, parsed.data.resolution);
      if (!ok) return { error: "That report no longer exists or was already resolved." };

      await logSecurityEvent({
        action: "admin.resolveReport",
        outcome: "allowed",
        actorId: admin.id,
        actorRole: admin.role,
        targetType: "report",
        targetId: id,
        detail: parsed.data.status,
      });
      await recordModerationEvent({
        actorId: admin.id,
        action: "REPORT_RESOLUTION",
        targetType: "report",
        targetId: id,
        detail: parsed.data.status,
      });
      revalidatePath("/admin/reports");
      return {};
    },
    (message) => ({ error: message }),
  );
}
