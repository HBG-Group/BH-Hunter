"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/profile";
import {
  createAdvertisement,
  deleteAdvertisement,
  setAdvertisementActive,
} from "@/lib/db/advertisements";
import { advertisementSchema } from "@/lib/validation/advertisement";
import { allow, LIMITS, RATE_LIMITED } from "@/lib/security/rate-limit";
import { guarded } from "@/lib/security/errors";
import { verifyTicket, type TicketClaims } from "@/lib/security/upload-ticket";
import {
  describeStoredPhoto,
  discardStoredPhoto,
  publicPhotoUrl,
  removeListingPhoto,
} from "@/lib/storage/photos";
import { AD_UPLOAD_SCOPE, isAllowedPhotoMime, MAX_AD_IMAGES, MAX_PHOTO_BYTES } from "@/config/storage";

export interface AdFormState {
  error?: string;
  success?: boolean;
}

// Verify each upload ticket the same way listing photos are: server-issued signature,
// bound to this admin and the ads folder, the object actually exists, and it really is
// an image within the size limit. Returns the public URLs, or an error string.
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
  revalidatePath("/"); // ads show on the homepage
}

// Create an advertisement from the admin form. Validated server-side like every write.
export async function createAdAction(_prev: AdFormState, formData: FormData): Promise<AdFormState> {
  const admin = await requireAdmin();
  if (!(await allow("write", LIMITS.write, admin.id))) return { error: RATE_LIMITED };

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
      await createAdvertisement(parsed.data, images.urls!);
      revalidateAds();
      return { success: true };
    },
    (message) => ({ error: message }),
  );
}

export async function toggleAdAction(id: string, active: boolean): Promise<AdFormState> {
  const admin = await requireAdmin();
  if (!(await allow("write", LIMITS.write, admin.id))) return { error: RATE_LIMITED };

  return guarded<AdFormState>(
    "toggleAd",
    async () => {
      const ok = await setAdvertisementActive(id, Boolean(active));
      if (!ok) return { error: "That advertisement no longer exists." };
      revalidateAds();
      return { success: true };
    },
    (message) => ({ error: message }),
  );
}

export async function deleteAdAction(id: string): Promise<AdFormState> {
  const admin = await requireAdmin();
  if (!(await allow("write", LIMITS.write, admin.id))) return { error: RATE_LIMITED };

  return guarded<AdFormState>(
    "deleteAd",
    async () => {
      const urls = await deleteAdvertisement(id);
      if (urls === null) return { error: "That advertisement no longer exists." };

      // Remove the stored image files once the row is gone (best-effort).
      for (const url of urls) await removeListingPhoto(url);

      revalidateAds();
      return { success: true };
    },
    (message) => ({ error: message }),
  );
}
