import assert from "node:assert/strict";
import test from "node:test";
import { PLANS } from "@/config/pricing";
import { isAdminHost } from "@/config/admin";

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

test("admin host recognition rejects lookalike and untrusted control hosts", () => {
  assert.equal(isAdminHost("meinocontrol.vercel.app.attacker.example"), false);
  assert.equal(isAdminHost("meino-git-feature-hbg1.vercel.app"), false);
});
