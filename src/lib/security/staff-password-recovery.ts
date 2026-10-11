import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { uploadTicketSigningKey } from "@/lib/security/upload-ticket-core";

const RECOVERY_TTL_MS = 60 * 60 * 1000;

function signature(timestamp: string): string {
  return createHmac("sha256", uploadTicketSigningKey(process.env))
    .update(`staff-password-recovery.${timestamp}`)
    .digest("base64url");
}

export function createStaffPasswordRecoveryProof(now = Date.now()): string {
  const timestamp = String(now);
  return `${timestamp}.${signature(timestamp)}`;
}

export function verifyStaffPasswordRecoveryProof(
  value: string | null,
  now = Date.now(),
): boolean {
  if (!value) return false;
  const [timestamp, suppliedSignature, extra] = value.split(".");
  if (!timestamp || !suppliedSignature || extra !== undefined || !/^\d+$/.test(timestamp)) {
    return false;
  }

  const issuedAt = Number(timestamp);
  if (!Number.isSafeInteger(issuedAt) || issuedAt > now || now - issuedAt > RECOVERY_TTL_MS) {
    return false;
  }

  const expected = Buffer.from(signature(timestamp));
  const supplied = Buffer.from(suppliedSignature);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}
