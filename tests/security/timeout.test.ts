import assert from "node:assert/strict";
import test from "node:test";
import { OperationTimeoutError, withTimeout } from "../../src/lib/async/timeout";
import { retryIdempotent } from "../../src/lib/async/retry";

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

test("retries only a bounded number of idempotent read attempts", async () => {
  let calls = 0;
  const value = await retryIdempotent(async () => {
    calls += 1;
    if (calls === 1) throw new Error("transient");
    return "ready";
  });
  assert.equal(value, "ready");
  assert.equal(calls, 2);
});
