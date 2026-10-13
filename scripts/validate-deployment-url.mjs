import { isIP } from "node:net";
import { appendFileSync } from "node:fs";

function fail(message) {
  console.error(`::error::${message}`);
  process.exit(1);
}

const [, , rawUrl, rawAllowedHosts] = process.argv;

if (!rawUrl) fail("A deployment URL is required.");
if (!rawAllowedHosts?.trim()) {
  fail("An authorized-host repository variable must be configured before contacting deployments.");
}
if (/[\\\s]/u.test(rawUrl)) {
  fail("The deployment URL must not contain whitespace or backslashes.");
}

let target;
try {
  target = new URL(rawUrl);
} catch {
  fail("The deployment URL must be an absolute HTTPS URL.");
}

if (target.protocol !== "https:") {
  fail("The deployment URL must use HTTPS.");
}
if (target.username || target.password) {
  fail("The deployment URL must not contain credentials.");
}
if (target.port && target.port !== "443") {
  fail("The deployment URL must use the default HTTPS port.");
}
if (target.hash) {
  fail("The deployment URL must not contain a fragment.");
}

const host = target.hostname.toLowerCase();
const domainPattern = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

if (!domainPattern.test(host) || isIP(host)) {
  fail("The deployment URL must use a public DNS hostname.");
}

const allowedHosts = rawAllowedHosts
  .split(",")
  .map((entry) => entry.trim().toLowerCase())
  .filter(Boolean);

if (allowedHosts.length === 0) {
  fail("The authorized-host variable must contain at least one hostname.");
}

for (const entry of allowedHosts) {
  const isWildcard = entry.startsWith("*.");
  const allowedHost = isWildcard ? entry.slice(2) : entry;

  if (allowedHost.includes("*") || !domainPattern.test(allowedHost)) {
    fail("Allowed entries must be hostnames; wildcard entries must start with *.");
  }
  if (isWildcard && allowedHost.split(".").length < 2) {
    fail("Wildcard entries must name a specific domain suffix, such as *.staging.example.com.");
  }
}

const matches = allowedHosts.some((entry) => {
  if (entry.startsWith("*.")) {
    const suffix = entry.slice(2);
    return host !== suffix && host.endsWith(`.${suffix}`);
  }
  return host === entry;
});

if (!matches) {
  fail(`Refusing to contact '${host}'; add its exact hostname to the appropriate allowlist if authorized.`);
}

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(
    process.env.GITHUB_OUTPUT,
    `host=${host}\nurl=${target.href}\n`,
  );
  process.stdout.write(host);
} else {
  process.stdout.write(`${host}\n${target.href}\n`);
}
