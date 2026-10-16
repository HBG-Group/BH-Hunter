import assert from "node:assert/strict";
import test from "node:test";
import { normalizeStorageUrl } from "@/lib/security/storage-url";

test("normalizes legacy trailing backslashes in storage URLs", () => {
  assert.equal(
    normalizeStorageUrl("https://qcrkhrhqugdyyliaevzf.supabase.co/storage/v1/object/public/listing-photos/a.png%5C"),
    "https://qcrkhrhqugdyyliaevzf.supabase.co/storage/v1/object/public/listing-photos/a.png",
  );
  assert.equal(
    normalizeStorageUrl("https://example.test/photo.jpg\\?width=640"),
    "https://example.test/photo.jpg?width=640",
  );
});
