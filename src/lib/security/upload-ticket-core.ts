import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

const TICKET_TTL_MS = 15 * 60 * 1000;

export interface TicketClaims {
  path: string;
  ownerId: string;
  boardingHouseId: string;
  expiresAt: number;
}

export function uploadTicketSigningKey(env: NodeJS.ProcessEnv): string {
  const ticketSecret = env.UPLOAD_TICKET_SECRET;
  if (ticketSecret) return ticketSecret;

  if (env.NODE_ENV === "production") {
    throw new Error("Missing UPLOAD_TICKET_SECRET. Production must use a dedicated upload ticket secret.");
  }

  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) throw new Error("Missing UPLOAD_TICKET_SECRET / SUPABASE_SERVICE_ROLE_KEY");
  return serviceRoleKey;
}

function payloadOf(claims: TicketClaims): string {
  return [claims.path, claims.ownerId, claims.boardingHouseId, claims.expiresAt].join("|");
}

function sign(payload: string, env: NodeJS.ProcessEnv): string {
  return createHmac("sha256", uploadTicketSigningKey(env)).update(payload).digest("base64url");
}

export function buildStoragePath(boardingHouseId: string, extension: string): string {
  return `${boardingHouseId}/${randomUUID()}.${extension}`;
}

export function issueTicket(
  path: string,
  ownerId: string,
  boardingHouseId: string,
  env: NodeJS.ProcessEnv = process.env,
): { claims: TicketClaims; signature: string } {
  const claims: TicketClaims = {
    path,
    ownerId,
    boardingHouseId,
    expiresAt: Date.now() + TICKET_TTL_MS,
  };
  return { claims, signature: sign(payloadOf(claims), env) };
}

function signatureMatches(expected: string, provided: string): boolean {
  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function verifyTicket(
  claims: TicketClaims,
  signature: string,
  ownerId: string,
  boardingHouseId: string,
  env: NodeJS.ProcessEnv = process.env,
): string | null {
  if (typeof signature !== "string" || signature === "") return null;
  if (typeof claims?.path !== "string" || claims.path === "") return null;

  if (claims.ownerId !== ownerId) return null;
  if (claims.boardingHouseId !== boardingHouseId) return null;
  if (!claims.path.startsWith(`${boardingHouseId}/`)) return null;
  if (claims.path.includes("..")) return null;
  if (typeof claims.expiresAt !== "number" || claims.expiresAt < Date.now()) return null;
  if (!signatureMatches(sign(payloadOf(claims), env), signature)) return null;

  return claims.path;
}
