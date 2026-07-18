"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { OAUTH_CALLBACK_PATH } from "@/config/auth";

// Start the Google sign-in redirect. After Google, users return to /auth/callback,
// which finishes the session and sends them to `next`.
export async function signInWithGoogle(next = "/"): Promise<string | null> {
  const supabase = createSupabaseBrowserClient();
  const redirectTo = `${window.location.origin}${OAUTH_CALLBACK_PATH}?next=${encodeURIComponent(next)}`;

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });

  // Returns a message on failure; null means the browser is redirecting to Google.
  return error ? error.message : null;
}
