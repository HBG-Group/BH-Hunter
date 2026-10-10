"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { OAUTH_CALLBACK_PATH } from "@/config/auth";
import { buildOAuthRedirectUrl } from "@/lib/auth/oauth-core";

// Start the Google sign-in redirect. After Google, users return to /auth/callback,
// which finishes the session and sends them to `next`.
// `role` only matters the first time an account is seen — it decides whether the new
// profile is a student or an owner. Existing profiles keep the role they have.
export async function signInWithGoogle(next = "/", role?: "OWNER" | "STUDENT"): Promise<string | null> {
  const supabase = createSupabaseBrowserClient();
  // Keep the OAuth round-trip on the origin where the app was opened. This is
  // important for an installed PWA: forcing the canonical Vercel host here can
  // eject a user from a custom/preview PWA window into a normal browser tab.
  // Supabase and Google must allow-list each origin used in production.
  const base = window.location.origin;
  const redirectTo = buildOAuthRedirectUrl(base, OAUTH_CALLBACK_PATH, next, role);

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });

  // Returns a message on failure; null means the browser is redirecting to Google.
  return error ? error.message : null;
}
