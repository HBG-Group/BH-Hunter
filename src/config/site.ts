// The app's canonical, public origin. OAuth redirects and confirmation-email links
// must point here, not at whatever host the request happened to arrive on (behind
// Vercel's proxy that can be an internal address, and in local dev it's localhost).
//
// Priority: an explicit NEXT_PUBLIC_SITE_URL wins everywhere; on the server we fall
// back to Vercel's production URL; otherwise callers use the live request origin.

function normalize(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim().replace(/\/+$/, "");
  if (trimmed === "") return null;
  return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
}

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

// Available in the browser too (inlined at build time).
export const PUBLIC_SITE_URL = normalize(process.env.NEXT_PUBLIC_SITE_URL);

// The control panel is deployed on a separate host, where a relative `/` link
// resolves back to the admin overview. Keep the public homepage explicit there.
export const PUBLIC_SITE_HOMEPAGE = PUBLIC_SITE_URL ?? "https://meino.vercel.app";

// Server-only fallback: Vercel injects the production domain here.
export function serverSiteUrl(): string | null {
  return PUBLIC_SITE_URL ?? normalize(process.env.VERCEL_PROJECT_PRODUCTION_URL);
}

export function requireProductionSiteUrl(): string {
  const configured = PUBLIC_SITE_URL;
  if (!configured) {
    throw new Error("Missing NEXT_PUBLIC_SITE_URL. Set the canonical HTTPS site URL in production.");
  }
  if (!isHttpsUrl(configured)) {
    throw new Error("NEXT_PUBLIC_SITE_URL must use HTTPS in production.");
  }
  return configured;
}

export function productionSiteUrl(): string | null {
  if (process.env.NODE_ENV !== "production") return PUBLIC_SITE_URL;
  return requireProductionSiteUrl();
}
