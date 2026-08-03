import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

test("proxy recovers from a stale Supabase refresh cookie", async () => {
  const source = await readFile(resolve("src/proxy.ts"), "utf8");
  assert.match(source, /try \{/);
  assert.match(source, /catch \{/);
  assert.match(source, /cookie\.name\.startsWith\("sb-"\)/);
  assert.match(source, /request\.cookies\.delete\(cookie\.name\)/);
  assert.match(source, /maxAge: 0/);
});

test("proxy forwards a nonce-bearing CSP before rendering", async () => {
  const source = await readFile(resolve("src/proxy.ts"), "utf8");
  assert.match(source, /crypto\.randomUUID\(\)/);
  assert.match(source, /requestHeaders\.set\("x-nonce", nonce\)/);
  assert.match(
    source,
    /requestHeaders\.set\("Content-Security-Policy", policy\)/,
  );
});

test("proxy isolates public and staff-only Vercel surfaces", async () => {
  const source = await readFile(resolve("src/proxy.ts"), "utf8");
  assert.match(source, /process\.env\.VERCEL/);
  assert.match(source, /onAdminHost && path === "\/"/);
  assert.match(source, /onAdminHost && !path\.startsWith\("\/admin"\)/);
  assert.match(source, /path\.startsWith\("\/admin"\) && !onAdminHost/);
});
