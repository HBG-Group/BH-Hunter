import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

// Per-account sign-in lockout: 5 wrong-password attempts locks that email out for 30s.
// Stored in Postgres (the same table the shared rate limiter uses), keyed by email —
// not cookies/localStorage — so it survives a page refresh, a new tab, or clearing
// browser storage, and is shared across every serverless instance.
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 30_000;

function keyFor(email: string): string {
  return `login-lock:${email.trim().toLowerCase()}`;
}

export interface LockoutState {
  locked: boolean;
  retryAfterSeconds: number;
}

function toState(row: { count: number; reset_at: Date } | undefined): LockoutState {
  if (!row) return { locked: false, retryAfterSeconds: 0 };
  const msLeft = row.reset_at.getTime() - Date.now();
  if (msLeft <= 0 || row.count < MAX_ATTEMPTS) return { locked: false, retryAfterSeconds: 0 };
  return { locked: true, retryAfterSeconds: Math.ceil(msLeft / 1000) };
}

// Read-only check, called before attempting Supabase auth — never increments, so
// checking status while already locked out doesn't push the lockout further out.
export async function checkLockout(email: string): Promise<LockoutState> {
  const rows = await prisma.$queryRaw<{ count: number; reset_at: Date }[]>(Prisma.sql`
    SELECT "count", "reset_at" FROM rate_limit_windows WHERE "key" = ${keyFor(email)}
  `);
  return toState(rows[0]);
}

// Call only after Supabase rejects the credentials. Same atomic upsert pattern as the
// shared rate limiter: a fresh window opens on the first failure, then locks once the
// 5th failure lands within it.
export async function recordFailedLogin(email: string): Promise<LockoutState> {
  const now = Date.now();
  const resetAt = new Date(now + LOCKOUT_MS);
  const rows = await prisma.$queryRaw<{ count: number; reset_at: Date }[]>(Prisma.sql`
    INSERT INTO rate_limit_windows ("key", "count", reset_at)
    VALUES (${keyFor(email)}, 1, ${resetAt})
    ON CONFLICT ("key") DO UPDATE
    SET
      "count" = CASE
        WHEN rate_limit_windows.reset_at <= NOW() THEN 1
        ELSE rate_limit_windows."count" + 1
      END,
      reset_at = CASE
        WHEN rate_limit_windows.reset_at <= NOW() THEN EXCLUDED.reset_at
        ELSE rate_limit_windows.reset_at
      END
    RETURNING "count", reset_at
  `);
  return toState(rows[0]);
}

// Called on a successful sign-in so a later mistake starts a fresh count instead of
// carrying over stale failures from before the account was accessed correctly.
export async function clearFailedLogins(email: string): Promise<void> {
  await prisma.$executeRaw`DELETE FROM rate_limit_windows WHERE "key" = ${keyFor(email)}`;
}
