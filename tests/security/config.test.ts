import test from "node:test";
import assert from "node:assert/strict";
import { securityHeaders } from "@/lib/security/headers";
import { isAdminHost, isMeinoControlVercelHost } from "@/config/admin";

test("production headers include HSTS and CSP protections", () => {
  const headers = securityHeaders(true, "test-nonce");
  const map = new Map(headers.map((header) => [header.key, header.value]));

  assert.equal(map.get("X-Content-Type-Options"), "nosniff");
  assert.equal(map.get("X-Frame-Options"), "DENY");
  assert.equal(map.get("Referrer-Policy"), "strict-origin-when-cross-origin");
  assert.match(
    map.get("Content-Security-Policy") ?? "",
    /frame-ancestors 'none'/,
  );
  assert.match(map.get("Content-Security-Policy") ?? "", /'nonce-test-nonce'/);
  assert.match(map.get("Content-Security-Policy") ?? "", /'strict-dynamic'/);
  assert.match(map.get("Strict-Transport-Security") ?? "", /max-age=63072000/);
});

test("development headers omit HSTS", () => {
  const headers = securityHeaders(false);
  assert.equal(
    headers.some((header) => header.key === "Strict-Transport-Security"),
    false,
  );
});

test("only the configured Meino Control deployment host is a staff surface", () => {
  assert.equal(isMeinoControlVercelHost("meinocontrol.vercel.app"), true);
  assert.equal(
    isMeinoControlVercelHost("meinocontrol-git-bugfix-ui-hbg1.vercel.app"),
    true,
  );
  const previousVercel = process.env.VERCEL;
  const previousVercelUrl = process.env.VERCEL_URL;
  process.env.VERCEL = "1";
  process.env.VERCEL_URL = "meinocontrol-git-feature-hbg1.vercel.app";
  assert.equal(isAdminHost("meinocontrol-git-feature-hbg1.vercel.app"), true);
  assert.equal(isAdminHost("meinocontrol-git-other-hbg1.vercel.app"), false);
  process.env.VERCEL_URL = "meino-git-feature-hbg1.vercel.app";
  assert.equal(isAdminHost("meino-git-feature-hbg1.vercel.app"), false);
  assert.equal(isAdminHost("meinocontrol.vercel.app.attacker.example"), false);
  if (previousVercel === undefined) delete process.env.VERCEL;
  else process.env.VERCEL = previousVercel;
  if (previousVercelUrl === undefined) delete process.env.VERCEL_URL;
  else process.env.VERCEL_URL = previousVercelUrl;
});
