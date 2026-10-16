import "server-only";
import { Resend } from "resend";

// One shared Resend client. Server-only so the API key never reaches the browser.
// Configure RESEND_API_KEY and (optionally) RESEND_FROM in the environment.
let client: Resend | null = null;

export function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  if (!client) client = new Resend(key);
  return client;
}

// Verified sender. Resend's onboarding domain works out of the box for testing;
// swap RESEND_FROM to a verified domain address before launch.
export function emailFrom(): string {
  return process.env.RESEND_FROM ?? "Meino <onboarding@resend.dev>";
}
