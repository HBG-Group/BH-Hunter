import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { OperationTimeoutError, withTimeout } from "../../src/lib/async/timeout";
import { retryIdempotent } from "../../src/lib/async/retry";
import { resilientRead } from "../../src/lib/async/resilient-read";

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

test("does not exceed the configured retry bound after a dependency failure", async () => {
  let calls = 0;
  await assert.rejects(
    retryIdempotent(async () => {
      calls += 1;
      throw new Error("dependency unavailable");
    }, 2),
    /dependency unavailable/,
  );
  assert.equal(calls, 2);
  await assert.rejects(retryIdempotent(async () => "never", 0), RangeError);
});

test("resilient reads bound each dependency attempt", async () => {
  let attempts = 0;
  await assert.rejects(
    resilientRead(
      async () => {
        attempts += 1;
        return new Promise<never>(() => undefined);
      },
      { attempts: 2, timeoutMs: 10, timeoutMessage: "read deadline exceeded" },
    ),
    /read deadline exceeded/,
  );
  assert.equal(attempts, 2);
});

for (const dependency of ["Supabase Auth", "Prisma database", "Supabase Storage"]) {
  test(`${dependency} read failures remain bounded`, async () => {
    let reads = 0;
    await assert.rejects(
      resilientRead(
        async () => {
          reads += 1;
          throw new Error(`${dependency} unavailable`);
        },
        { attempts: 2, timeoutMs: 50 },
      ),
      new RegExp(`${dependency} unavailable`),
    );
    assert.equal(reads, 2);
  });
}

test("mutation actions do not opt into the resilient-read retry helper", async () => {
  const actionModules = [
    "src/lib/admin/actions.ts",
    "src/lib/admin/ad-actions.ts",
    "src/lib/owner/actions.ts",
    "src/lib/owner/photo-actions.ts",
    "src/lib/student/actions.ts",
    "src/lib/student/review-actions.ts",
    "src/lib/student/viewing-actions.ts",
  ];

  for (const actionModule of actionModules) {
    const source = await readFile(resolve(actionModule), "utf8");
    assert.doesNotMatch(source, /resilientRead/);
  }
});
