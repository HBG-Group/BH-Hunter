import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { isUnlinkedProviderConflict } from "@/lib/auth/identity";

test("profile creation never merges unlinked provider identities by email", () => {
  assert.equal(isUnlinkedProviderConflict({ authenticatedUserId: "google-user", profileId: "email-user", provider: "google" }), true);
  assert.equal(isUnlinkedProviderConflict({ authenticatedUserId: "email-user", profileId: "email-user", provider: "email" }), false);
  assert.equal(isUnlinkedProviderConflict({ authenticatedUserId: "new-user", profileId: "old-user", provider: "email" }), false);
});

test("OAuth callback signs out and explains an identity conflict", async () => {
  const source = await readFile(resolve("src/app/auth/callback/route.ts"), "utf8");
  assert.match(source, /result && "conflict" in result/);
  assert.match(source, /supabase\.auth\.signOut\(\)/);
  assert.match(source, /identity-conflict/);
});
