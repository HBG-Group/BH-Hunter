const DEFAULT_CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "font-src 'self' data:",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "img-src 'self' data: blob: https:",
  "object-src 'none'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "connect-src 'self' https:",
  "media-src 'self' https:",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

export function contentSecurityPolicy(nonce?: string): string {
  if (!nonce) return DEFAULT_CSP;

  return DEFAULT_CSP.replace(
    "script-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
  );
}

export function securityHeaders(
  isProduction: boolean,
  nonce?: string,
): Array<{ key: string; value: string }> {
  const headers = [
    { key: "Content-Security-Policy", value: contentSecurityPolicy(nonce) },
    { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=(), browsing-topics=()" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
  ];

  if (isProduction) {
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    });
  }

  return headers;
}
