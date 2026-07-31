import assert from "node:assert/strict";
import test from "node:test";
import { OperationTimeoutError, withTimeout } from "../../src/lib/async/timeout";

test("returns an operation result before the deadline", async () => {
  assert.equal(await withTimeout(Promise.resolve("ready"), 50), "ready");
});

test("rejects an operation that exceeds the deadline", async () => {
  await assert.rejects(
    withTimeout(new Promise(() => undefined), 10, "database deadline exceeded"),
    (error) =>
      error instanceof OperationTimeoutError && error.message === "database deadline exceeded",
  );
});
