import "server-only";
import { headers } from "next/headers";
import { serverSiteUrl } from "@/config/site";

// The public origin to build absolute auth URLs from (OAuth callback, confirmation
// email). Prefers the configured canonical URL; otherwise reconstructs it from the
// forwarded headers Vercel sets, so it never resolves to an internal host.
export async function resolveSiteOrigin(): Promise<string> {
  const configured = serverSiteUrl();
  if (configured) return configured;

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const proto = headerList.get("x-forwarded-proto") ?? "https";
  if (host) return `${proto}://${host}`;

  // Local dev fallback.
  return "http://localhost:3000";
}
