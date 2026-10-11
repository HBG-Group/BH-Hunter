"use server";

import { cookies } from "next/headers";
import { createTermsConsentValue, TERMS_CONSENT_COOKIE } from "@/lib/security/terms-consent";

export async function recordTermsConsent(accepted: boolean): Promise<boolean> {
  if (accepted !== true) return false;
  const cookieStore = await cookies();
  cookieStore.set(TERMS_CONSENT_COOKIE, createTermsConsentValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60,
  });
  return true;
}
