// Students judge boarding houses heavily on photos, so a listing needs a minimum
// number before it can be submitted for review or published.
export const MIN_LISTING_PHOTOS = 5;

// Per-photo upload limits, shared by the form and the server action.
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const PHOTO_SIZE_HINT = "JPG or PNG, up to 5 MB each — around 1600×1200 is ideal.";

export const PHOTO_REQUIREMENT_MESSAGE =
  `Please upload at least ${MIN_LISTING_PHOTOS} high-quality images so students can better understand the boarding house.`;
