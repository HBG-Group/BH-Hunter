import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isRecentAuth, RECENT_AUTH_WINDOW_MS } from "@/lib/security/recent-auth-core";

export { isRecentAuth, RECENT_AUTH_WINDOW_MS };

export const RECENT_AUTH_REQUIRED = "Please sign in again before doing that sensitive action.";

export async function requireRecentAuth(maxAgeMs: number = RECENT_AUTH_WINDOW_MS): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return isRecentAuth(user?.last_sign_in_at, Date.now(), maxAgeMs);
}
