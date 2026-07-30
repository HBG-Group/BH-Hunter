import test from "node:test";
import assert from "node:assert/strict";
import { credentialsSchema, signUpSchema } from "@/lib/validation/auth";
import { listingSchema } from "@/lib/validation/listing";
import { reviewSchema } from "@/lib/validation/review";
import { viewingRequestSchema } from "@/lib/validation/viewing";

const validListing = {
  name: "Harbor House",
  addressLine: "123 University Road",
  latitude: 10,
  longitude: 124,
  genderPolicy: "MIXED",
  priceMonthly: 5000,
  contactNumbers: [{ number: "09171234567", carrier: "" }],
  amenityKeys: [],
  rooms: [{ label: "Room A", capacity: 2, occupied: 1 }],
};

test("authentication payloads reject unknown fields and oversized values", () => {
  assert.equal(credentialsSchema.safeParse({ email: "a@example.com", password: "x", role: "ADMIN" }).success, false);
  assert.equal(
    signUpSchema.safeParse({
      fullName: "A".repeat(81),
      email: "a@example.com",
      password: "password1",
      role: "STUDENT",
      terms: "on",
    }).success,
    false,
  );
});

test("listing payloads reject unexpected fields, oversized content, and unsafe URLs", () => {
  assert.equal(listingSchema.safeParse({ ...validListing, injected: "unexpected" }).success, false);
  assert.equal(listingSchema.safeParse({ ...validListing, houseRules: "x".repeat(1001) }).success, false);
  assert.equal(listingSchema.safeParse({ ...validListing, messengerUrl: "javascript:alert(1)" }).success, false);
});

test("review and viewing payloads enforce schema bounds", () => {
  assert.equal(
    reviewSchema.safeParse({
      cleanliness: 1,
      internet: 1,
      safety: 1,
      noiseLevel: 1,
      waterSupply: 1,
      ownerFriendliness: 1,
      body: "x".repeat(1001),
    }).success,
    false,
  );
  assert.equal(viewingRequestSchema.safeParse({ preferredAt: new Date(Date.now() - 60_000), extra: true }).success, false);
});
