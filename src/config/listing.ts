// Students judge boarding houses heavily on photos, so a listing needs a minimum
// number before it can be submitted for review or published.
export const MIN_LISTING_PHOTOS = 3;

// Soft guidance only, not enforced — beyond this, extra photos add little value.
export const RECOMMENDED_MAX_LISTING_PHOTOS = 7;

export const PHOTO_REQUIREMENT_MESSAGE =
  `Please upload at least ${MIN_LISTING_PHOTOS} high-quality images so students can better understand the boarding house.`;
