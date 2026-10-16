import "server-only";
import { headers } from "next/headers";
import { serverSiteUrl } from "@/config/site";

// The public origin to build absolute auth URLs from (OAuth callback, confirmation
// email). Prefers the configured canonical URL; otherwise reconstructs it from the
// forwarded headers Vercel sets, so it never resolves to an internal host.
export async function resolveSiteOrigin(): Promise<string> {
  // A missing canonical public URL is a deployment configuration issue, but it must
  // not turn an auth request into the global error boundary. Prefer
  // the configured public/production URL and otherwise safely use the request host.
  // This also keeps protected preview QA usable while the production canonical URL is
  // being configured in Vercel and Supabase.
  const configured = serverSiteUrl();
  if (configured) return configured;

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  if (host) return `https://${host}`;

  // Local dev fallback.
  return "http://localhost:3000";
}
