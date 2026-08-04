import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

test("profile creation never merges unlinked provider identities by email", async () => {
  const source = await readFile(resolve("src/lib/auth/profile.ts"), "utf8");
  assert.match(source, /byEmail\.id !== user\.id/);
  assert.match(source, /provider === "email"/);
  assert.match(source, /return \{ conflict: true \}/);
  assert.match(source, /return \{ profile: byEmail, created: false \}/);
  assert.match(source, /hasNonEmailIdentity/);
});

test("OAuth callback signs out and explains an identity conflict", async () => {
  const source = await readFile(resolve("src/app/auth/callback/route.ts"), "utf8");
  assert.match(source, /result && "conflict" in result/);
  assert.match(source, /supabase\.auth\.signOut\(\)/);
  assert.match(source, /identity-conflict/);
});
