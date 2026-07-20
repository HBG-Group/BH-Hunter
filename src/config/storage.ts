// Listing photos live in one public bucket (students must see them without auth).
// Shared by the server, which signs uploads, and the browser, which sends the bytes.
export const PHOTO_BUCKET = "listing-photos";

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

// SVG is deliberately excluded — it can carry scripts and would be served from our
// storage domain. Only raster formats a camera or phone actually produces.
export const ALLOWED_PHOTO_MIME = ["image/jpeg", "image/png", "image/webp"] as const;

export const ALLOWED_PHOTO_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const PHOTO_SIZE_HINT = "JPG, PNG or WebP, up to 5 MB each — around 1600×1200 is ideal.";

export function isAllowedPhotoMime(type: string): boolean {
  return (ALLOWED_PHOTO_MIME as readonly string[]).includes(type);
}
