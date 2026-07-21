import "server-only";
import { createHmac, timingSafeEqual, randomUUID } from "node:crypto";

// Signed upload tickets. The server decides every storage path and signs it together
// with the owner, the listing and an expiry. Registration only accepts paths that come
// back inside a valid, unexpired signature — so a client can never invent a path,
// reuse another owner's file, or register a photo it did not upload.

const TICKET_TTL_MS = 15 * 60 * 1000;

// Derived from the service-role key so there is no extra secret to manage. Server-only.
function signingKey(): string {
  const secret = process.env.UPLOAD_TICKET_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error("Missing UPLOAD_TICKET_SECRET / SUPABASE_SERVICE_ROLE_KEY");
  return secret;
}

export interface TicketClaims {
  path: string;
  ownerId: string;
  boardingHouseId: string;
  expiresAt: number;
}

function payloadOf(claims: TicketClaims): string {
  return [claims.path, claims.ownerId, claims.boardingHouseId, claims.expiresAt].join("|");
}

function sign(payload: string): string {
  return createHmac("sha256", signingKey()).update(payload).digest("base64url");
}

// Storage path is server-generated: listing folder + random name + safe extension.
export function buildStoragePath(boardingHouseId: string, extension: string): string {
  return `${boardingHouseId}/${randomUUID()}.${extension}`;
}

export function issueTicket(
  path: string,
  ownerId: string,
  boardingHouseId: string,
): { claims: TicketClaims; signature: string } {
  const claims: TicketClaims = {
    path,
    ownerId,
    boardingHouseId,
    expiresAt: Date.now() + TICKET_TTL_MS,
  };
  return { claims, signature: sign(payloadOf(claims)) };
}

function signatureMatches(expected: string, provided: string): boolean {
  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Returns the verified path, or null when the ticket is forged, tampered with,
 * expired, or belongs to a different owner or listing.
 */
export function verifyTicket(
  claims: TicketClaims,
  signature: string,
  ownerId: string,
  boardingHouseId: string,
): string | null {
  if (typeof signature !== "string" || signature === "") return null;
  if (typeof claims?.path !== "string" || claims.path === "") return null;

  // Bind the ticket to the caller and the listing it was issued for.
  if (claims.ownerId !== ownerId) return null;
  if (claims.boardingHouseId !== boardingHouseId) return null;
  if (!claims.path.startsWith(`${boardingHouseId}/`)) return null;
  if (claims.path.includes("..")) return null;

  if (typeof claims.expiresAt !== "number" || claims.expiresAt < Date.now()) return null;

  if (!signatureMatches(sign(payloadOf(claims)), signature)) return null;

  return claims.path;
}
