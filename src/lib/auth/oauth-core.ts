import { safeRedirectPath } from "@/lib/security/redirect";

export function buildOAuthRedirectUrl(
  origin: string,
  callbackPath: string,
  next: string,
  role?: "OWNER" | "STUDENT",
): string {
  const callback = new URL(callbackPath, origin);
  callback.searchParams.set("next", safeRedirectPath(next, "/"));
  if (role) callback.searchParams.set("role", role);
  return callback.toString();
}
