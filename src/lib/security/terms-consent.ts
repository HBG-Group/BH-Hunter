import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { uploadTicketSigningKey } from "@/lib/security/upload-ticket-core";

export const TERMS_VERSION = "2026-08-02";
export const TERMS_CONSENT_COOKIE = "meino-terms-consent";
const CONSENT_TTL_MS = 15 * 60 * 1000;

function signature(timestamp: string): string {
  return createHmac("sha256", uploadTicketSigningKey(process.env))
    .update(`${TERMS_VERSION}.${timestamp}`)
    .digest("base64url");
}

export function createTermsConsentValue(now = Date.now()): string {
  const timestamp = String(now);
  return `${timestamp}.${signature(timestamp)}`;
}

export function verifyTermsConsentValue(value: string | undefined, now = Date.now()): number | null {
  if (!value) return null;
  const [timestamp, suppliedSignature, extra] = value.split(".");
  if (!timestamp || !suppliedSignature || extra !== undefined || !/^\d+$/.test(timestamp)) return null;
  const acceptedAt = Number(timestamp);
  if (!Number.isSafeInteger(acceptedAt) || acceptedAt > now || now - acceptedAt > CONSENT_TTL_MS) return null;
  const expected = signature(timestamp);
  const actualBytes = Buffer.from(suppliedSignature);
  const expectedBytes = Buffer.from(expected);
  if (actualBytes.length !== expectedBytes.length || !timingSafeEqual(actualBytes, expectedBytes)) return null;
  return acceptedAt;
}
