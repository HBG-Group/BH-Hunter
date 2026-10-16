import test from "node:test";
import assert from "node:assert/strict";
import { clientErrorMessage, GENERIC_ERROR } from "@/lib/security/errors-core";

test("unexpected action errors use a generic client message without internal details", () => {
  const result = clientErrorMessage("safe-reference");
  assert.ok(result.startsWith(GENERIC_ERROR));
  assert.doesNotMatch(result, /internal-secret|postgresql/i);
});
