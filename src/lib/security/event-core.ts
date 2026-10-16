export function redactSecurityDetail(detail: string | undefined): string | undefined {
  if (!detail) return detail;
  return detail
    .replace(/(authorization|bearer)\s+[a-z0-9._-]+/gi, "$1 [REDACTED]")
    .replace(/(token|secret|password|api[_-]?key)=?[^\s,;]+/gi, "$1=[REDACTED]");
}
