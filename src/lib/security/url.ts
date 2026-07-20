// Sanitize outbound URLs. Any user-supplied value that ends up in an href must pass
// through here — URL parsing alone accepts javascript: and data:, which are XSS.

// Allowlist, not a blocklist. http is permitted only outside production so local
// testing links keep working.
const ALLOWED_PROTOCOLS =
  process.env.NODE_ENV === "production" ? ["https:"] : ["https:", "http:"];

/**
 * Returns the URL if its scheme is allowed and its host is real, otherwise null.
 * Callers must treat null as "render no link".
 */
export function safeExternalUrl(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;

  const raw = value.trim();
  if (raw === "") return null;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }

  if (!ALLOWED_PROTOCOLS.includes(url.protocol)) return null;
  // Reject userinfo (https://evil.com@real.com) and empty hosts.
  if (url.username !== "" || url.password !== "") return null;
  if (url.hostname === "") return null;

  return url.toString();
}

// Zod refinement so the same rule guards writes as well as reads.
export function isSafeExternalUrl(value: string): boolean {
  return safeExternalUrl(value) !== null;
}

// Phone numbers land in tel: links. Keep them to digits and a leading +.
export function safeTelHref(phone: string): string | null {
  const cleaned = phone.replace(/[^\d+]/g, "");
  if (!/^\+?\d{7,15}$/.test(cleaned)) return null;
  return `tel:${cleaned}`;
}

// Email addresses land in mailto: links.
export function safeMailtoHref(email: string): string | null {
  const cleaned = email.trim();
  if (!/^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(cleaned)) return null;
  return `mailto:${cleaned}`;
}
