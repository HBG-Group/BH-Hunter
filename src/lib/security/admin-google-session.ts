import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { uploadTicketSigningKey } from "@/lib/security/upload-ticket-core";

export const ADMIN_GOOGLE_SESSION_COOKIE = "meino-admin-google-session";
export const ADMIN_GOOGLE_SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const ADMIN_GOOGLE_SESSION_COOKIE_MAX_AGE =
  ADMIN_GOOGLE_SESSION_TTL_MS / 1000;

function signature(userId: string, issuedAt: string): string {
  return createHmac("sha256", uploadTicketSigningKey(process.env))
    .update(`admin-google-session.${userId}.${issuedAt}`)
    .digest("base64url");
}

export function createAdminGoogleSessionProof(
  userId: string,
  now = Date.now(),
): string {
  const issuedAt = String(now);
  return `${userId}.${issuedAt}.${signature(userId, issuedAt)}`;
}

export function verifyAdminGoogleSessionProof(
  value: string | undefined,
  userId: string,
  now = Date.now(),
): boolean {
  if (!value) return false;
  const [proofUserId, issuedAt, suppliedSignature, extra] = value.split(".");
  if (
    proofUserId !== userId ||
    !issuedAt ||
    !suppliedSignature ||
    extra !== undefined ||
    !/^\d+$/.test(issuedAt)
  ) {
    return false;
  }

  const timestamp = Number(issuedAt);
  if (
    !Number.isSafeInteger(timestamp) ||
    timestamp > now ||
    now - timestamp > ADMIN_GOOGLE_SESSION_TTL_MS
  ) {
    return false;
  }

  const expected = Buffer.from(signature(userId, issuedAt));
  const supplied = Buffer.from(suppliedSignature);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}
