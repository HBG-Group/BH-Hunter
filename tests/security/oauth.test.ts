import assert from "node:assert/strict";
import test from "node:test";
import { buildOAuthRedirectUrl } from "../../src/lib/auth/oauth-core";

test("OAuth callback keeps only an in-app destination and an allowed role hint", () => {
  const url = new URL(
    buildOAuthRedirectUrl("https://meino.example", "/auth/callback", "//attacker.example", "OWNER"),
  );

  assert.equal(url.origin, "https://meino.example");
  assert.equal(url.pathname, "/auth/callback");
  assert.equal(url.searchParams.get("next"), "/");
  assert.equal(url.searchParams.get("role"), "OWNER");
});
