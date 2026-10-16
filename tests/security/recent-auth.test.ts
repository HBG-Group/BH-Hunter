import test from "node:test";
import assert from "node:assert/strict";
import { isRecentAuth, RECENT_AUTH_WINDOW_MS } from "@/lib/security/recent-auth-core";

test("accepts a sign-in inside the recent-auth window", () => {
  const now = Date.UTC(2026, 6, 27, 12, 0, 0);
  const lastSignInAt = new Date(now - 5 * 60 * 1000).toISOString();
  assert.equal(isRecentAuth(lastSignInAt, now, RECENT_AUTH_WINDOW_MS), true);
});

test("rejects stale, missing, or invalid timestamps", () => {
  const now = Date.UTC(2026, 6, 27, 12, 0, 0);
  const stale = new Date(now - RECENT_AUTH_WINDOW_MS - 1).toISOString();

  assert.equal(isRecentAuth(stale, now, RECENT_AUTH_WINDOW_MS), false);
  assert.equal(isRecentAuth(undefined, now, RECENT_AUTH_WINDOW_MS), false);
  assert.equal(isRecentAuth("not-a-date", now, RECENT_AUTH_WINDOW_MS), false);
});
