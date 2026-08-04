// Hostname that serves the admin panel, e.g. "admin.meino.com". Set ADMIN_HOST in the
// environment (Vercel) once the admin domain is pointed at this project.
//
// When set: the /admin area is served ONLY on this host; every /admin URL on the main
// site returns 404, and the admin host's root shows the dashboard.
// When unset (local dev): admin stays reachable on the same host as the rest of the app.
export const ADMIN_HOST =
  process.env.ADMIN_HOST?.trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "") // tolerate a full URL being pasted in
    .replace(/\/.*$/, "") || null; // drop any path

function hostnameOnly(host: string): string {
  return host.trim().toLowerCase().split(":")[0];
}

// Vercel creates generated preview hosts for each project. Recognize the control
// project even when ADMIN_HOST was not copied into a preview environment.
export function isMeinoControlVercelHost(host: string): boolean {
  const hostname = hostnameOnly(host);
  return (
    hostname === "meinocontrol.vercel.app" ||
    (hostname.startsWith("meinocontrol-") && hostname.endsWith(".vercel.app"))
  );
}

// Does this request's Host header belong to the configured admin domain?
export function isAdminHost(host: string | null | undefined): boolean {
  if (!host) return false;
  // Compare host without the port (localhost:3000 → localhost).
  const hostname = hostnameOnly(host);
  return (
    (ADMIN_HOST !== null && hostname === hostnameOnly(ADMIN_HOST)) ||
    isMeinoControlVercelHost(hostname)
  );
}

// Where the "Admin view" link should point. On a deployment with a separate admin
// domain that's the full https origin; locally (ADMIN_HOST unset) it stays a same-site
// path so the panel remains reachable during development.
export function adminHref(): string {
  return ADMIN_HOST ? `https://${ADMIN_HOST}/admin` : "/admin";
}
