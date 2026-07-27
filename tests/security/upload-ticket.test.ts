import test from "node:test";
import assert from "node:assert/strict";
import {
  issueTicket,
  uploadTicketSigningKey,
  verifyTicket,
} from "@/lib/security/upload-ticket-core";

test("accepts a valid ticket for the original owner and listing", () => {
  const env = { NODE_ENV: "test", UPLOAD_TICKET_SECRET: "test-secret" };

  const { claims, signature } = issueTicket("listing-1/photo.jpg", "owner-1", "listing-1", env);
  assert.equal(
    verifyTicket(claims, signature, "owner-1", "listing-1", env),
    "listing-1/photo.jpg",
  );
});

test("rejects cross-owner, cross-listing, and tampered claims", () => {
  const env = { NODE_ENV: "test", UPLOAD_TICKET_SECRET: "test-secret" };

  const { claims, signature } = issueTicket("listing-1/photo.jpg", "owner-1", "listing-1", env);

  assert.equal(verifyTicket(claims, signature, "owner-2", "listing-1", env), null);
  assert.equal(verifyTicket(claims, signature, "owner-1", "listing-2", env), null);
  assert.equal(
    verifyTicket(
      { ...claims, path: "listing-1/../../secrets.txt" },
      signature,
      "owner-1",
      "listing-1",
      env,
    ),
    null,
  );
});

test("rejects expired tickets", () => {
  const env = { NODE_ENV: "test", UPLOAD_TICKET_SECRET: "test-secret" };

  const { claims, signature } = issueTicket("listing-1/photo.jpg", "owner-1", "listing-1", env);
  claims.expiresAt = Date.now() - 1;
  assert.equal(verifyTicket(claims, signature, "owner-1", "listing-1", env), null);
});

test("production requires a dedicated ticket secret", () => {
  assert.throws(
    () => uploadTicketSigningKey({ NODE_ENV: "production", SUPABASE_SERVICE_ROLE_KEY: "service-role" }),
    /Missing UPLOAD_TICKET_SECRET/,
  );
});
