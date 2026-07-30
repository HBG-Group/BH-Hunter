"use server";

import { revalidatePath } from "next/cache";
import { ALLOWED_PHOTO_EXTENSIONS, MAX_PHOTO_BYTES, PHOTO_SIZE_HINT, isAllowedPhotoMime } from "@/config/storage";
import { requireOwner } from "@/lib/auth/profile";
import { addImageForOwner, deleteImagesForOwner, imageUrlExists } from "@/lib/db/images";
import { findOwnerListing } from "@/lib/db/owner";
import { guarded } from "@/lib/security/errors";
import { logSecurityEvent } from "@/lib/security/events";
import { allow, LIMITS, RATE_LIMITED } from "@/lib/security/rate-limit";
import { RECENT_AUTH_REQUIRED, requireRecentAuth } from "@/lib/security/recent-auth";
import { MAX_PHOTO_BATCH, validatePendingPhotos, type PendingPhoto } from "@/lib/security/photo-validation";
import { buildStoragePath, issueTicket, verifyTicket, type TicketClaims } from "@/lib/security/upload-ticket";
import {
  createSignedPhotoUpload,
  describeStoredPhoto,
  discardStoredPhoto,
  publicPhotoUrl,
  removeListingPhoto,
} from "@/lib/storage/photos";

export interface PhotoFormState {
  error?: string;
  success?: boolean;
}

export interface UploadTicket {
  fileName: string;
  path: string;
  token: string;
  claims: TicketClaims;
  signature: string;
}

export async function prepareUploadsAction(
  boardingHouseId: string,
  files: PendingPhoto[],
): Promise<{ tickets?: UploadTicket[]; error?: string }> {
  const owner = await requireOwner();
  if (!(await allow("upload", LIMITS.upload, owner.id))) return { error: RATE_LIMITED };

  if (!(await findOwnerListing(owner.id, boardingHouseId))) {
    return { error: "You don't own this listing" };
  }

  const validationError = validatePendingPhotos(files);
  if (validationError) return { error: validationError };

  return guarded<{ tickets?: UploadTicket[]; error?: string }>(
    "prepareUploads",
    async () => {
      const tickets: UploadTicket[] = [];
      for (const file of files) {
        const path = buildStoragePath(boardingHouseId, ALLOWED_PHOTO_EXTENSIONS[file.type]);
        const token = await createSignedPhotoUpload(path);
        const { claims, signature } = issueTicket(path, owner.id, boardingHouseId);
        tickets.push({ fileName: file.name, path, token, claims, signature });
      }
      return { tickets };
    },
    (message) => ({ error: message }),
  );
}

export async function registerPhotosAction(
  boardingHouseId: string,
  tickets: { claims: TicketClaims; signature: string }[],
): Promise<PhotoFormState> {
  const owner = await requireOwner();
  if (!(await allow("upload", LIMITS.upload, owner.id))) return { error: RATE_LIMITED };
  if (!Array.isArray(tickets) || tickets.length === 0) return { error: "Nothing to save" };
  if (tickets.length > MAX_PHOTO_BATCH) return { error: "Too many photos in one batch." };

  return guarded<PhotoFormState>(
    "registerPhotos",
    async () => {
      let saved = 0;

      for (const ticket of tickets) {
        const path = verifyTicket(ticket?.claims, ticket?.signature, owner.id, boardingHouseId);
        if (!path) return { error: "That upload could not be verified. Please try again." };

        const stored = await describeStoredPhoto(path);
        if (!stored) return { error: "The upload did not complete. Please try again." };

        if (!isAllowedPhotoMime(stored.mimeType) || stored.size > MAX_PHOTO_BYTES) {
          await discardStoredPhoto(path);
          return { error: PHOTO_SIZE_HINT };
        }

        const url = publicPhotoUrl(path);
        if (await imageUrlExists(url)) continue;

        const ok = await addImageForOwner(owner.id, boardingHouseId, url);
        if (!ok) return { error: "You don't own this listing" };
        saved += 1;
      }

      revalidatePath(`/owner/listings/${boardingHouseId}/photos`);
      revalidatePath("/owner");
      return saved > 0 ? { success: true } : { error: "Those photos were already saved." };
    },
    (message) => ({ error: message }),
  );
}

export async function deletePhotosAction(
  boardingHouseId: string,
  imageIds: string[],
): Promise<PhotoFormState> {
  const owner = await requireOwner();
  if (!(await allow("write", LIMITS.write, owner.id))) return { error: RATE_LIMITED };
  if (!Array.isArray(imageIds) || imageIds.length === 0) return { error: "Nothing selected" };
  if (!(await requireRecentAuth())) return { error: RECENT_AUTH_REQUIRED };

  return guarded<PhotoFormState>(
    "deletePhotos",
    async () => {
      const urls = await deleteImagesForOwner(owner.id, boardingHouseId, imageIds);
      for (const url of urls) await removeListingPhoto(url);

      await logSecurityEvent({
        action: "owner.deletePhotos",
        outcome: "allowed",
        actorId: owner.id,
        actorRole: owner.role,
        targetType: "listing",
        targetId: boardingHouseId,
        detail: `${imageIds.length}_images`,
      });
      revalidatePath(`/owner/listings/${boardingHouseId}/photos`);
      revalidatePath("/owner");
      return { success: true };
    },
    (message) => ({ error: message }),
  );
}
