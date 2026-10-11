// Post-deploy smoke test (SUG-006): fails the release if a route that should exist
// 404s or 5xxs. Run with SECURITY_CHECK_URL (or DEPLOY_URL) pointed at the preview/
// production deployment: e.g. `DEPLOY_URL=https://meino.vercel.app npm run verify:routes`.
//
// This exists because BUG-003/008/009/010/011/012/015 all shipped as 404s in
// production despite the routes existing in the repo — a build/route-manifest drift
// that unit tests and lint never catch. This script is the go/no-go gate for that.

const deploymentUrl = process.env.DEPLOY_URL ?? process.env.SECURITY_CHECK_URL;

if (!deploymentUrl) {
  throw new Error(
    "Set DEPLOY_URL (or SECURITY_CHECK_URL) to the deployment origin to check",
  );
}

const origin = new URL(deploymentUrl);
const isAdminSurface =
  origin.hostname === "meinocontrol.vercel.app" ||
  (origin.hostname.startsWith("meinocontrol-") &&
    origin.hostname.endsWith(".vercel.app"));

// Public routes that must always resolve for a guest.
const PUBLIC_ROUTES = [
  "/",
  "/privacy",
  "/terms",
  "/cookies",
  "/security",
  "/pricing",
  "/about",
  "/copyright",
  "/community-guidelines",
  "/contact",
  "/login",
  "/signup",
  "/list-your-property",
  "/sitemap.xml",
  "/robots.txt",
  "/manifest.webmanifest",
  "/map",
  "/forgot-password",
  // These must be protected routes, not missing routes. A redirect to sign-in is
  // accepted by the checker; a 404/5xx blocks release promotion.
  "/onboarding",
  "/account/privacy",
  "/subscribe/basic",
];

const ADMIN_ROUTES = ["/", "/admin", "/admin/owners", "/admin/notifications"];
const ADMIN_FORBIDDEN_PUBLIC_ROUTES = [
  "/signup",
  "/login",
  "/list-your-property",
  "/map",
];

async function check(
  path: string,
): Promise<{ path: string; status: number; ok: boolean }> {
  const url = new URL(path, origin);
  const response = await fetch(url, { redirect: "manual" });
  // A redirect (e.g. to /login) is a legitimate outcome for gated routes; only 404/5xx fail.
  const ok =
    response.status < 400 || (response.status >= 300 && response.status < 400);
  return { path, status: response.status, ok };
}

async function checkNotFound(
  path: string,
): Promise<{ path: string; status: number; ok: boolean }> {
  const url = new URL(path, origin);
  const response = await fetch(url, { redirect: "manual" });
  return { path, status: response.status, ok: response.status === 404 };
}

const results = isAdminSurface
  ? await Promise.all([
      ...ADMIN_ROUTES.map(check),
      ...ADMIN_FORBIDDEN_PUBLIC_ROUTES.map(checkNotFound),
    ])
  : await Promise.all([...PUBLIC_ROUTES.map(check), checkNotFound("/admin")]);
const failures = results.filter((r) => !r.ok);

console.log(
  JSON.stringify(
    {
      url: origin.href,
      surface: isAdminSurface ? "admin" : "public",
      checked: results.length,
      failures,
    },
    null,
    2,
  ),
);

if (failures.length > 0) {
  throw new Error(
    `Route smoke test failed: ${failures.map((f) => `${f.path} -> ${f.status}`).join(", ")}`,
  );
}
