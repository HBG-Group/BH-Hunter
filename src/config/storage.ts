// All listing photos live in one public bucket. Shared by the server (which signs
// uploads) and the browser (which sends the bytes), so it can't live in a
// server-only module.
export const PHOTO_BUCKET = "listing-photos";
