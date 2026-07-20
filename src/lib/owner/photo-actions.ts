"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth/profile";
import { addImageForOwner, deleteImageForOwner } from "@/lib/db/images";
import {
  createSignedPhotoUpload,
  publicPhotoUrl,
  removeListingPhoto,
  type SignedUpload,
} from "@/lib/storage/photos";
import { MAX_PHOTO_BYTES, PHOTO_SIZE_HINT } from "@/config/listing";
import { findOwnerListing } from "@/lib/db/owner";

export interface PhotoFormState {
  error?: string;
  success?: boolean;
}

export interface UploadTicket extends SignedUpload {
  fileName: string;
}

interface PendingFile {
  name: string;
  type: string;
  size: number;
}

// Step 1 — check the owner and the files, then hand back signed upload tickets. The
// browser PUTs the bytes to Storage itself, so nothing large goes through Next.
export async function prepareUploadsAction(
  boardingHouseId: string,
  files: PendingFile[],
): Promise<{ tickets?: UploadTicket[]; error?: string }> {
  const owner = await requireOwner();
  if (!(await findOwnerListing(owner.id, boardingHouseId))) {
    return { error: "You don't own this listing" };
  }
  if (files.length === 0) return { error: "Choose at least one image" };

  for (const file of files) {
    if (!file.type.startsWith("image/")) return { error: "Only image files are allowed" };
    if (file.size > MAX_PHOTO_BYTES) {
      return { error: `"${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)} MB. ${PHOTO_SIZE_HINT}` };
    }
  }

  try {
    const tickets = await Promise.all(
      files.map(async (file) => ({
        fileName: file.name,
        ...(await createSignedPhotoUpload(boardingHouseId, file.name)),
      })),
    );
    return { tickets };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown error";
    return { error: `Could not start the upload: ${reason}` };
  }
}

// Step 2 — the files are in Storage; record them against the listing.
export async function registerPhotosAction(
  boardingHouseId: string,
  paths: string[],
): Promise<PhotoFormState> {
  const owner = await requireOwner();

  for (const path of paths) {
    const ok = await addImageForOwner(owner.id, boardingHouseId, publicPhotoUrl(path));
    if (!ok) return { error: "You don't own this listing" };
  }

  revalidatePath(`/owner/listings/${boardingHouseId}/photos`);
  return { success: true };
}

export async function deletePhotoAction(boardingHouseId: string, imageId: string) {
  const owner = await requireOwner();
  const url = await deleteImageForOwner(owner.id, imageId);
  if (url) await removeListingPhoto(url);
  revalidatePath(`/owner/listings/${boardingHouseId}/photos`);
}

// Removes several selected photos in one go.
export async function deletePhotosAction(boardingHouseId: string, imageIds: string[]) {
  const owner = await requireOwner();

  for (const imageId of imageIds) {
    const url = await deleteImageForOwner(owner.id, imageId);
    if (url) await removeListingPhoto(url);
  }

  revalidatePath(`/owner/listings/${boardingHouseId}/photos`);
}
