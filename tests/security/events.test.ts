import assert from "node:assert/strict";
import test from "node:test";
import { redactSecurityDetail } from "@/lib/security/event-core";

test("security event details redact common credential forms", () => {
  assert.equal(redactSecurityDetail("token=abc123"), "token=[REDACTED]");
  assert.equal(redactSecurityDetail("Bearer abc.def.ghi"), "Bearer [REDACTED]");
  assert.equal(redactSecurityDetail("verification_revoked"), "verification_revoked");
});
