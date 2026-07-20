import "server-only";
import { findImages } from "@/lib/db/images";
import { describeStoredPhoto, PHOTO_BUCKET } from "@/lib/storage/photos";
import { MIN_LISTING_PHOTOS } from "@/config/listing";
import { isAllowedPhotoMime } from "@/config/storage";

export interface PhotoCheck {
  usable: number;
  met: boolean;
}

// Turns a stored public URL back into its object path, or null if it isn't ours.
function pathFromUrl(url: string): string | null {
  const marker = `/${PHOTO_BUCKET}/`;
  const index = url.indexOf(marker);
  return index === -1 ? null : url.slice(index + marker.length);
}

/**
 * Counts photos that genuinely exist in Storage and hold real image bytes, so a row
 * pointing at a deleted or fabricated object can never satisfy the publish minimum.
 */
export async function checkListingPhotos(boardingHouseId: string): Promise<PhotoCheck> {
  const images = await findImages(boardingHouseId);

  let usable = 0;
  for (const image of images) {
    const path = pathFromUrl(image.url);
    if (!path) continue;

    const stored = await describeStoredPhoto(path);
    if (stored && isAllowedPhotoMime(stored.mimeType)) usable += 1;
  }

  return { usable, met: usable >= MIN_LISTING_PHOTOS };
}
