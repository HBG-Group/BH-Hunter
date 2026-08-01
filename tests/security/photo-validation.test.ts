import test from "node:test";
import assert from "node:assert/strict";
import { MAX_PHOTO_BYTES } from "@/config/storage";
import { MAX_PHOTO_BATCH, validatePendingPhotos } from "@/lib/security/photo-validation";

const validPhoto = { name: "photo.jpg", type: "image/jpeg", size: 1024 };

test("upload validation accepts an allowed image within the configured limit", () => {
  assert.equal(validatePendingPhotos([validPhoto]), null);
});

test("upload validation rejects oversized, empty, wrong-type, malformed, and oversized batches", () => {
  assert.match(validatePendingPhotos([{ ...validPhoto, size: MAX_PHOTO_BYTES + 1 }]) ?? "", /5 MB/);
  assert.match(validatePendingPhotos([{ ...validPhoto, size: 0 }]) ?? "", /empty/);
  assert.match(validatePendingPhotos([{ ...validPhoto, type: "image/svg+xml" }]) ?? "", /JPG, PNG or WebP/);
  assert.match(validatePendingPhotos([{} as typeof validPhoto]) ?? "", /could not be read/);
  assert.match(
    validatePendingPhotos(Array.from({ length: MAX_PHOTO_BATCH + 1 }, () => validPhoto)) ?? "",
    /at most/,
  );
});
