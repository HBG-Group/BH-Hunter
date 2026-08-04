import test from "node:test";
import assert from "node:assert/strict";
import { credentialsSchema, signUpSchema } from "@/lib/validation/auth";
import { listingSchema } from "@/lib/validation/listing";
import { reviewSchema } from "@/lib/validation/review";
import { viewingRequestSchema } from "@/lib/validation/viewing";
import { normalizeUserText } from "@/lib/validation/text";

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
  assert.equal(
    credentialsSchema.safeParse({
      email: "a@example.com",
      password: "x",
      role: "ADMIN",
    }).success,
    false,
  );
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
  assert.equal(
    listingSchema.safeParse({ ...validListing, injected: "unexpected" })
      .success,
    false,
  );
  assert.equal(
    listingSchema.safeParse({ ...validListing, houseRules: "x".repeat(1001) })
      .success,
    false,
  );
  assert.equal(
    listingSchema.safeParse({
      ...validListing,
      messengerUrl: "javascript:alert(1)",
    }).success,
    false,
  );
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
  assert.equal(
    viewingRequestSchema.safeParse({
      preferredAt: new Date(Date.now() - 60_000),
      extra: true,
    }).success,
    false,
  );
});

test("text boundaries normalize pasted Unicode and reject oversized or whitespace-only values", () => {
  assert.equal(normalizeUserText("A\u200B\r\nB"), "A\nB");
  assert.equal(
    listingSchema.safeParse({ ...validListing, name: "   " }).success,
    false,
  );
  assert.equal(
    listingSchema.safeParse({ ...validListing, name: "x".repeat(120) }).success,
    true,
  );
  assert.equal(
    listingSchema.safeParse({ ...validListing, name: "x".repeat(121) }).success,
    false,
  );
  assert.equal(
    viewingRequestSchema.safeParse({
      preferredAt: new Date(Date.now() + 60_000),
      message: "x".repeat(501),
    }).success,
    false,
  );
  assert.equal(
    signUpSchema.safeParse({
      fullName: "Valid\u200B Name",
      email: "USER@example.com",
      password: "long password",
      role: "STUDENT",
      terms: "on",
    }).success,
    true,
  );
});

test("markup and SQL-like strings remain inert data within accepted bounds", () => {
  const review = reviewSchema.safeParse({
    cleanliness: 3,
    internet: 3,
    safety: 3,
    noiseLevel: 3,
    waterSupply: 3,
    ownerFriendliness: 3,
    body: "<script>alert(1)</script>'; DROP TABLE reviews; --",
  });
  assert.equal(review.success, true);
  if (review.success)
    assert.equal(review.data.body?.includes("<script>"), true);
});
