"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { OAUTH_CALLBACK_PATH } from "@/config/auth";
import { safeRedirectPath } from "@/lib/security/redirect";

// Start the Google sign-in redirect. After Google, users return to /auth/callback,
// which finishes the session and sends them to `next`.
// `role` only matters the first time an account is seen — it decides whether the new
// profile is a student or an owner. Existing profiles keep the role they have.
export async function signInWithGoogle(next = "/", role?: "OWNER" | "STUDENT"): Promise<string | null> {
  const supabase = createSupabaseBrowserClient();
  const params = new URLSearchParams({ next: safeRedirectPath(next, "/") });
  if (role) params.set("role", role);
  const redirectTo = `${window.location.origin}${OAUTH_CALLBACK_PATH}?${params}`;

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });

  // Returns a message on failure; null means the browser is redirecting to Google.
  return error ? error.message : null;
}
