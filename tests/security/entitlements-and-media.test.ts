import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { PLANS } from "@/config/pricing";

test("plan limits come from one entitlement matrix with a fixed room allowance", () => {
  const [basic, advance, premium] = PLANS;
  assert.deepEqual(
    PLANS.map((plan) => plan.id),
    ["basic", "advance", "premium"],
  );
  assert.equal(basic.roomsPerListing, 2);
  assert.equal(advance.roomsPerListing, 2);
  assert.equal(premium.roomsPerListing, 2);
  assert.ok(basic.freeListings < advance.freeListings);
  assert.ok(advance.freeListings < premium.freeListings);
  assert.ok(basic.maxPhotosPerListing < advance.maxPhotosPerListing);
  assert.ok(advance.maxPhotosPerListing < premium.maxPhotosPerListing);
  assert.equal(advance.verifiedBadge, true);
  assert.equal(premium.verifiedBadge, true);
  assert.equal(premium.featuredListing, true);
});

test("owner media metadata and ordering remain ownership scoped", async () => {
  const source = await readFile(resolve("src/lib/db/images.ts"), "utf8");
  assert.match(source, /updateImageAltForOwner/);
  assert.match(source, /reorderImagesForOwner/);
  assert.match(source, /boardingHouse: \{ ownerId \}/);
  assert.match(source, /uniqueIds\.length !== imageIds\.length/);
});
