"use server";

import { revalidatePath } from "next/cache";
import { requireWritableOwner } from "@/lib/auth/profile";
import { addImageForOwner, deleteImagesForOwner, imageUrlExists } from "@/lib/db/images";
import { findOwnerListing } from "@/lib/db/owner";
import {
  createSignedPhotoUpload,
  describeStoredPhoto,
  discardStoredPhoto,
  publicPhotoUrl,
  removeListingPhoto,
} from "@/lib/storage/photos";
import {
  ALLOWED_PHOTO_EXTENSIONS,
  MAX_PHOTO_BYTES,
  PHOTO_SIZE_HINT,
  isAllowedPhotoMime,
} from "@/config/storage";
import { buildStoragePath, issueTicket, verifyTicket, type TicketClaims } from "@/lib/security/upload-ticket";
import { allow, LIMITS, RATE_LIMITED } from "@/lib/security/rate-limit";
import { guarded } from "@/lib/security/errors";

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

interface PendingFile {
  name: string;
  type: string;
  size: number;
}

const MAX_BATCH = 10;

// Step 1 — verify ownership, validate the declared files, then hand back signed
// tickets for server-chosen paths. Metadata here is only a UX filter; Storage and
// step 2 re-check what actually arrived.
export async function prepareUploadsAction(
  boardingHouseId: string,
  files: PendingFile[],
): Promise<{ tickets?: UploadTicket[]; error?: string }> {
  const owner = await requireWritableOwner();
  if (!(await allow("upload", LIMITS.upload, owner.id))) return { error: RATE_LIMITED };

  // Verify ownership before anything else.
  if (!(await findOwnerListing(owner.id, boardingHouseId))) {
    return { error: "You don't own this listing" };
  }

  if (!Array.isArray(files) || files.length === 0) return { error: "Choose at least one image" };
  if (files.length > MAX_BATCH) return { error: `Upload at most ${MAX_BATCH} photos at a time.` };

  for (const file of files) {
    if (!file || typeof file.type !== "string" || typeof file.size !== "number") {
      return { error: "That file could not be read. Please pick it again." };
    }
    if (!isAllowedPhotoMime(file.type)) return { error: PHOTO_SIZE_HINT };
    if (file.size <= 0) return { error: `"${file.name}" is empty.` };
    if (file.size > MAX_PHOTO_BYTES) {
      return { error: `"${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)} MB. ${PHOTO_SIZE_HINT}` };
    }
  }

  return guarded<{ tickets?: UploadTicket[]; error?: string }>(
    "prepareUploads",
    async () => {
      const tickets: UploadTicket[] = [];
      for (const file of files) {
        // Extension comes from the allowlist, never from the filename.
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

// Step 2 — record only files this server issued a ticket for, that exist in Storage,
// that hold real image bytes, and that have not already been registered.
export async function registerPhotosAction(
  boardingHouseId: string,
  tickets: { claims: TicketClaims; signature: string }[],
): Promise<PhotoFormState> {
  const owner = await requireWritableOwner();
  if (!(await allow("upload", LIMITS.upload, owner.id))) return { error: RATE_LIMITED };
  if (!Array.isArray(tickets) || tickets.length === 0) return { error: "Nothing to save" };
  if (tickets.length > MAX_BATCH) return { error: "Too many photos in one batch." };

  return guarded<PhotoFormState>(
    "registerPhotos",
    async () => {
      let saved = 0;

      for (const ticket of tickets) {
        // Verify the ticket: server-issued, unexpired, bound to this owner + listing.
        const path = verifyTicket(ticket?.claims, ticket?.signature, owner.id, boardingHouseId);
        if (!path) return { error: "That upload could not be verified. Please try again." };

        // Confirm the object exists and inspect what was actually stored.
        const stored = await describeStoredPhoto(path);
        if (!stored) return { error: "The upload did not complete. Please try again." };

        if (!isAllowedPhotoMime(stored.mimeType) || stored.size > MAX_PHOTO_BYTES) {
          await discardStoredPhoto(path);
          return { error: PHOTO_SIZE_HINT };
        }

        // One registration per object — a replayed ticket cannot add a second row.
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

// Removes several selected photos in one go, scoped to the owner.
export async function deletePhotosAction(
  boardingHouseId: string,
  imageIds: string[],
): Promise<PhotoFormState> {
  const owner = await requireWritableOwner();
  if (!(await allow("write", LIMITS.write, owner.id))) return { error: RATE_LIMITED };
  if (!Array.isArray(imageIds) || imageIds.length === 0) return { error: "Nothing selected" };

  return guarded<PhotoFormState>(
    "deletePhotos",
    async () => {
      const urls = await deleteImagesForOwner(owner.id, boardingHouseId, imageIds);
      for (const url of urls) await removeListingPhoto(url);

      revalidatePath(`/owner/listings/${boardingHouseId}/photos`);
      revalidatePath("/owner");
      return { success: true };
    },
    (message) => ({ error: message }),
  );
}
