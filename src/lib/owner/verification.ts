import { VERIFICATION_DURATION_DAYS } from "@/config/billing";

export type VerificationStatus = "NONE" | "PENDING" | "VERIFIED" | "EXPIRED";

interface VerificationFields {
  verified: boolean;
  verifiedUntil: Date | null;
  verificationRequestedAt: Date | null;
}

// A badge is only real while it hasn't lapsed. Central so every surface agrees.
export function isVerified(fields: {
  verified: boolean;
  verifiedUntil: Date | null;
}): boolean {
  if (!fields.verified) return false;
  return fields.verifiedUntil === null || fields.verifiedUntil.getTime() > Date.now();
}

// The owner-facing state used to pick which message/button to show.
export function verificationStatus(fields: VerificationFields): VerificationStatus {
  if (isVerified(fields)) return "VERIFIED";
  if (fields.verificationRequestedAt) return "PENDING";
  if (fields.verified && fields.verifiedUntil) return "EXPIRED"; // was verified, now lapsed
  return "NONE";
}

// The expiry stamp to store when an admin grants verification now.
export function verificationExpiry(from: Date = new Date()): Date {
  return new Date(from.getTime() + VERIFICATION_DURATION_DAYS * 24 * 60 * 60 * 1000);
}
