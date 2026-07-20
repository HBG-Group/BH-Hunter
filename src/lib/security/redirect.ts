// Validate redirect targets. Anything a user can influence (?next=, form fields)
// must pass through here before it reaches redirect() or NextResponse.redirect().

export const DEFAULT_REDIRECT = "/";

// Never bounce back into the OAuth exchange — it would loop or replay a used code.
const BLOCKED_PREFIXES = ["/auth/callback"];

// Any scheme at all ("javascript:", "data:", "file:", "vbscript:", "ftp:", "https:").
const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:/i;

// Control characters get used to smuggle schemes past naive checks ("java\nscript:").
function hasControlChars(value: string): boolean {
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    if (code <= 0x1f || code === 0x7f) return true;
  }
  return false;
}

/**
 * Returns a safe in-app path, or the fallback when the input is anything else.
 *
 * Accepts only single-slash-prefixed relative paths. Rejects absolute URLs,
 * protocol-relative URLs (//evil.com), backslash variants (/\evil.com), embedded
 * control characters, and every non-http scheme.
 */
export function safeRedirectPath(
  value: string | null | undefined,
  fallback: string = DEFAULT_REDIRECT,
): string {
  if (typeof value !== "string") return fallback;

  const raw = value.trim();
  if (raw === "" || hasControlChars(raw)) return fallback;

  // Must be relative, with exactly one leading slash and no authority component.
  if (!raw.startsWith("/")) return fallback;
  if (raw.startsWith("//")) return fallback;
  if (raw.includes("\\")) return fallback;
  if (HAS_SCHEME.test(raw)) return fallback;

  // Resolve against a throwaway origin so encoded traversal is normalised, then
  // confirm the result still points at that same origin.
  let url: URL;
  try {
    url = new URL(raw, "https://bh-hunter.internal");
  } catch {
    return fallback;
  }
  if (url.origin !== "https://bh-hunter.internal") return fallback;
  if (BLOCKED_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) return fallback;

  // Re-check after normalisation: "/..//evil.com" collapses to "//evil.com", which
  // is protocol-relative and would leave the site.
  if (url.pathname.startsWith("//")) return fallback;

  return `${url.pathname}${url.search}${url.hash}`;
}
