"use server";

import { revalidatePath } from "next/cache";
import { AD_UPLOAD_SCOPE, isAllowedPhotoMime, MAX_AD_IMAGES, MAX_PHOTO_BYTES } from "@/config/storage";
import { requireAdmin } from "@/lib/auth/profile";
import {
  createAdvertisement,
  deleteAdvertisement,
  setAdvertisementActive,
} from "@/lib/db/advertisements";
import { recordModerationEvent } from "@/lib/db/admin";
import { guarded } from "@/lib/security/errors";
import { logSecurityEvent } from "@/lib/security/events";
import { allow, LIMITS, RATE_LIMITED } from "@/lib/security/rate-limit";
import { RECENT_AUTH_REQUIRED, requireRecentAuth } from "@/lib/security/recent-auth";
import { verifyTicket, type TicketClaims } from "@/lib/security/upload-ticket";
import {
  describeStoredPhoto,
  discardStoredPhoto,
  publicPhotoUrl,
  removeListingPhoto,
} from "@/lib/storage/photos";
import { advertisementSchema } from "@/lib/validation/advertisement";

export interface AdFormState {
  error?: string;
  success?: boolean;
}

async function resolveTicketUrls(
  raw: string,
  adminId: string,
): Promise<{ urls?: string[]; error?: string }> {
  let tickets: { claims: TicketClaims; signature: string }[];
  try {
    tickets = JSON.parse(raw);
  } catch {
    return { error: "The images could not be read. Please pick them again." };
  }
  if (!Array.isArray(tickets) || tickets.length === 0) return { error: "Add at least one image" };
  if (tickets.length > MAX_AD_IMAGES) return { error: `Use at most ${MAX_AD_IMAGES} images.` };

  const urls: string[] = [];
  for (const ticket of tickets) {
    const path = verifyTicket(ticket?.claims, ticket?.signature, adminId, AD_UPLOAD_SCOPE);
    if (!path) return { error: "An image could not be verified. Please re-upload." };

    const stored = await describeStoredPhoto(path);
    if (!stored) return { error: "An image upload did not complete. Please try again." };
    if (!isAllowedPhotoMime(stored.mimeType) || stored.size > MAX_PHOTO_BYTES) {
      await discardStoredPhoto(path);
      return { error: "Only images up to 5 MB are allowed." };
    }
    urls.push(publicPhotoUrl(path));
  }
  return { urls };
}

function revalidateAds() {
  revalidatePath("/admin/ads");
  revalidatePath("/");
}

async function ensureRecentAdminAuth(adminId: string, adId?: string): Promise<AdFormState | null> {
  if (await requireRecentAuth()) return null;

  await logSecurityEvent({
    action: "admin.ad",
    outcome: "denied",
    actorId: adminId,
    actorRole: "ADMIN",
    targetType: "advertisement",
    targetId: adId,
    detail: "recent_auth_required",
  });
  return { error: RECENT_AUTH_REQUIRED };
}

export async function createAdAction(_prev: AdFormState, formData: FormData): Promise<AdFormState> {
  const admin = await requireAdmin();
  if (!(await allow("write", LIMITS.write, admin.id))) return { error: RATE_LIMITED };
  const recent = await ensureRecentAdminAuth(admin.id);
  if (recent) return recent;

  const parsed = advertisementSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    websiteUrl: formData.get("websiteUrl") ?? "",
    facebookUrl: formData.get("facebookUrl") ?? "",
    messengerUrl: formData.get("messengerUrl") ?? "",
    startAt: formData.get("startAt") || undefined,
    expiresAt: formData.get("expiresAt") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form" };

  const images = await resolveTicketUrls(String(formData.get("imageTickets") ?? ""), admin.id);
  if (images.error || !images.urls) return { error: images.error ?? "Add at least one image" };

  return guarded<AdFormState>(
    "createAd",
    async () => {
      const advertisement = await createAdvertisement(parsed.data, images.urls!);
      await recordModerationEvent({
        actorId: admin.id,
        action: "ADVERTISEMENT_CREATION",
        targetType: "advertisement",
        targetId: advertisement.id,
      });
      await logSecurityEvent({
        action: "admin.createAd",
        outcome: "allowed",
        actorId: admin.id,
        actorRole: admin.role,
        targetType: "advertisement",
        targetId: advertisement.id,
      });
      revalidateAds();
      return { success: true };
    },
    (message) => ({ error: message }),
  );
}

export async function toggleAdAction(id: string, active: boolean): Promise<AdFormState> {
  const admin = await requireAdmin();
  if (!(await allow("write", LIMITS.write, admin.id))) return { error: RATE_LIMITED };
  const recent = await ensureRecentAdminAuth(admin.id, id);
  if (recent) return recent;

  return guarded<AdFormState>(
    "toggleAd",
    async () => {
      const ok = await setAdvertisementActive(id, Boolean(active));
      if (!ok) return { error: "That advertisement no longer exists." };

      await recordModerationEvent({
        actorId: admin.id,
        action: "ADVERTISEMENT_STATUS",
        targetType: "advertisement",
        targetId: id,
        detail: active ? "activated" : "deactivated",
      });
      await logSecurityEvent({
        action: "admin.toggleAd",
        outcome: "allowed",
        actorId: admin.id,
        actorRole: admin.role,
        targetType: "advertisement",
        targetId: id,
        detail: active ? "activated" : "deactivated",
      });
      revalidateAds();
      return { success: true };
    },
    (message) => ({ error: message }),
  );
}

export async function deleteAdAction(id: string): Promise<AdFormState> {
  const admin = await requireAdmin();
  if (!(await allow("write", LIMITS.write, admin.id))) return { error: RATE_LIMITED };
  const recent = await ensureRecentAdminAuth(admin.id, id);
  if (recent) return recent;

  return guarded<AdFormState>(
    "deleteAd",
    async () => {
      const urls = await deleteAdvertisement(id);
      if (urls === null) return { error: "That advertisement no longer exists." };

      await recordModerationEvent({
        actorId: admin.id,
        action: "ADVERTISEMENT_DELETION",
        targetType: "advertisement",
        targetId: id,
      });
      for (const url of urls) await removeListingPhoto(url);

      await logSecurityEvent({
        action: "admin.deleteAd",
        outcome: "allowed",
        actorId: admin.id,
        actorRole: admin.role,
        targetType: "advertisement",
        targetId: id,
      });
      revalidateAds();
      return { success: true };
    },
    (message) => ({ error: message }),
  );
}
