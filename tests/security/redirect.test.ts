import test from "node:test";
import assert from "node:assert/strict";
import { safeRedirectPath } from "@/lib/security/redirect";

test("accepts ordinary in-app paths", () => {
  assert.equal(safeRedirectPath("/owner/listings?id=1#photos"), "/owner/listings?id=1#photos");
});

test("rejects protocol-relative and escaped external redirects", () => {
  assert.equal(safeRedirectPath("//evil.test", "/"), "/");
  assert.equal(safeRedirectPath("/..//evil.test", "/"), "/");
  assert.equal(safeRedirectPath("/\\evil.test", "/"), "/");
});

test("rejects callback-loop and scheme payloads", () => {
  assert.equal(safeRedirectPath("/auth/callback?next=/admin", "/"), "/");
  assert.equal(safeRedirectPath("javascript:alert(1)", "/"), "/");
});
