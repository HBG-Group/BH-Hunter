import assert from "node:assert/strict";
import test from "node:test";
import {
  canInvokeAction,
  hasRole,
  ownerScope,
} from "../../src/lib/auth/authorization-core";

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

test("authorization matrix rejects anonymous and cross-role direct action calls", () => {
  for (const action of ["student", "owner", "admin"] as const) {
    assert.equal(canInvokeAction(null, action), false, `${action} action rejects anonymous callers`);
  }

  assert.equal(canInvokeAction("STUDENT", "student"), true);
  assert.equal(canInvokeAction("STUDENT", "owner"), false);
  assert.equal(canInvokeAction("STUDENT", "admin"), false);
  assert.equal(canInvokeAction("OWNER", "owner"), true);
  assert.equal(canInvokeAction("OWNER", "admin"), false);
  assert.equal(canInvokeAction("ADMIN", "admin"), true);
  assert.equal(canInvokeAction("ADMIN", "owner"), false);
});
