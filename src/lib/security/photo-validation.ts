import { MAX_PHOTO_BYTES, PHOTO_SIZE_HINT, isAllowedPhotoMime } from "@/config/storage";

export interface PendingPhoto {
  name: string;
  type: string;
  size: number;
}

export const MAX_PHOTO_BATCH = 10;

/** Validates client-declared metadata before a signed upload URL is issued. */
export function validatePendingPhotos(files: PendingPhoto[]): string | null {
  if (!Array.isArray(files) || files.length === 0) return "Choose at least one image";
  if (files.length > MAX_PHOTO_BATCH) return `Upload at most ${MAX_PHOTO_BATCH} photos at a time.`;

  for (const file of files) {
    if (!file || typeof file.type !== "string" || typeof file.size !== "number") {
      return "That file could not be read. Please pick it again.";
    }
    if (!isAllowedPhotoMime(file.type)) return PHOTO_SIZE_HINT;
    if (file.size <= 0) return `"${file.name}" is empty.`;
    if (file.size > MAX_PHOTO_BYTES) {
      return `"${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)} MB. ${PHOTO_SIZE_HINT}`;
    }
  }

  return null;
}
