export const RECENT_AUTH_WINDOW_MS = 15 * 60 * 1000;

export function isRecentAuth(
  lastSignInAt: string | null | undefined,
  now: number = Date.now(),
  maxAgeMs: number = RECENT_AUTH_WINDOW_MS,
): boolean {
  if (!lastSignInAt) return false;
  const timestamp = Date.parse(lastSignInAt);
  if (Number.isNaN(timestamp)) return false;
  return now - timestamp <= maxAgeMs;
}
