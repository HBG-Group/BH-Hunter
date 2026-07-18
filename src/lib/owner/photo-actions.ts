"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth/profile";
import { addImageForOwner, deleteImageForOwner } from "@/lib/db/images";
import { removeListingPhoto, uploadListingPhoto } from "@/lib/storage/photos";

export interface PhotoFormState {
  error?: string;
  success?: boolean;
}

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB per photo

// Uploads one or more selected images to Storage and records them on the listing.
export async function uploadPhotosAction(
  boardingHouseId: string,
  _prev: PhotoFormState,
  formData: FormData,
): Promise<PhotoFormState> {
  const owner = await requireOwner();

  const files = formData.getAll("photos").filter((entry): entry is File => entry instanceof File && entry.size > 0);
  if (files.length === 0) return { error: "Choose at least one image" };

  for (const file of files) {
    if (!file.type.startsWith("image/")) return { error: "Only image files are allowed" };
    if (file.size > MAX_BYTES) return { error: `${file.name} is larger than 5 MB` };
  }

  for (const file of files) {
    const url = await uploadListingPhoto(boardingHouseId, file);
    const ok = await addImageForOwner(owner.id, boardingHouseId, url);
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
