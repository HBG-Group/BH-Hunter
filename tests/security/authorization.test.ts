import assert from "node:assert/strict";
import test from "node:test";
import { hasRole, ownerScope } from "../../src/lib/auth/authorization-core";

test("role checks do not grant cross-role access", () => {
  assert.equal(hasRole("ADMIN", "ADMIN"), true);
  assert.equal(hasRole("OWNER", "OWNER"), true);
  assert.equal(hasRole("STUDENT", "STUDENT"), true);
  assert.equal(hasRole("STUDENT", "OWNER"), false);
  assert.equal(hasRole("STUDENT", "ADMIN"), false);
  assert.equal(hasRole("OWNER", "ADMIN"), false);
  assert.equal(hasRole("ADMIN", "OWNER"), false);
});

test("owner-scoped filters bind the requested record to the authenticated owner", () => {
  assert.deepEqual(ownerScope("owner-a", "listing-a"), { id: "listing-a", ownerId: "owner-a" });
  assert.notDeepEqual(ownerScope("owner-a", "listing-a"), ownerScope("owner-b", "listing-a"));
});
