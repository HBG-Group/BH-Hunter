import test from "node:test";
import assert from "node:assert/strict";
import { securityHeaders } from "@/lib/security/headers";

test("production headers include HSTS and CSP protections", () => {
  const headers = securityHeaders(true);
  const map = new Map(headers.map((header) => [header.key, header.value]));

  assert.equal(map.get("X-Content-Type-Options"), "nosniff");
  assert.equal(map.get("X-Frame-Options"), "DENY");
  assert.equal(map.get("Referrer-Policy"), "strict-origin-when-cross-origin");
  assert.match(map.get("Content-Security-Policy") ?? "", /frame-ancestors 'none'/);
  assert.match(map.get("Strict-Transport-Security") ?? "", /max-age=63072000/);
});

test("development headers omit HSTS", () => {
  const headers = securityHeaders(false);
  assert.equal(headers.some((header) => header.key === "Strict-Transport-Security"), false);
});
