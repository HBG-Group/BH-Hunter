// Hostname that serves the admin panel, e.g. "admin.meino.com". Set ADMIN_HOST in the
// environment (Vercel) once the admin domain is pointed at this project.
//
// When set: the /admin area is served ONLY on this host; every /admin URL on the main
// site returns 404, and the admin host's root shows the dashboard.
// When unset (local dev): admin stays reachable on the same host as the rest of the app.
export const ADMIN_HOST =
  process.env.ADMIN_HOST
    ?.trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "") // tolerate a full URL being pasted in
    .replace(/\/.*$/, "") || null; // drop any path

// Does this request's Host header belong to the configured admin domain?
export function isAdminHost(host: string | null | undefined): boolean {
  if (!ADMIN_HOST || !host) return false;
  // Compare host without the port (localhost:3000 → localhost).
  return host.toLowerCase().split(":")[0] === ADMIN_HOST.split(":")[0];
}

// Where the "Admin view" link should point. On a deployment with a separate admin
// domain that's the full https origin; locally (ADMIN_HOST unset) it stays a same-site
// path so the panel remains reachable during development.
export function adminHref(): string {
  return ADMIN_HOST ? `https://${ADMIN_HOST}/admin` : "/admin";
}
