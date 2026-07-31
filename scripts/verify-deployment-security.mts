const deploymentUrl = process.env.SECURITY_CHECK_URL;

if (!deploymentUrl) {
  throw new Error("SECURITY_CHECK_URL must be the HTTPS staging or preview deployment URL");
}

const origin = new URL(deploymentUrl);
if (origin.protocol !== "https:") {
  throw new Error("SECURITY_CHECK_URL must use HTTPS");
}

const response = await fetch(origin, { redirect: "error" });
if (!response.ok) throw new Error(`Deployment returned HTTP ${response.status}`);

const requiredHeaders = [
  "content-security-policy",
  "strict-transport-security",
  "x-content-type-options",
  "referrer-policy",
  "permissions-policy",
];
for (const header of requiredHeaders) {
  if (!response.headers.get(header)) throw new Error(`Missing required response header: ${header}`);
}

const html = await response.text();
const scriptPaths = [...html.matchAll(/<script[^>]+src=["']([^"']+\.js)["']/g)].map((match) => match[1]);
const sourceMaps = await Promise.all(
  scriptPaths.map(async (path) => {
    const url = new URL(`${path}.map`, origin);
    const mapResponse = await fetch(url, { redirect: "manual" });
    return { url: url.href, status: mapResponse.status };
  }),
);
const exposedMaps = sourceMaps.filter((map) => map.status >= 200 && map.status < 300);
if (exposedMaps.length > 0) {
  throw new Error(`Public source maps detected: ${exposedMaps.map((map) => map.url).join(", ")}`);
}

console.log(
  JSON.stringify({
    url: origin.href,
    headers: "verified",
    checkedSourceMaps: sourceMaps.length,
    sessionCookie: "A signed-in browser response is required to verify cookie attributes.",
  }),
);
