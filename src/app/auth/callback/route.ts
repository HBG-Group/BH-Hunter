import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { safeRedirectPath } from "@/lib/security/redirect";
import { resolveSiteOrigin } from "@/lib/auth/site-origin";

// Google (and the confirmation email) send the user back here with a code. We exchange
// it for a session and send them on. The final hop uses the canonical origin, so it
// can't land on an internal Vercel host or on localhost.
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const origin = await resolveSiteOrigin();

  // Validate redirect — never concatenate a raw query parameter onto the origin.
  const next = safeRedirectPath(searchParams.get("next"), "/");

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Make sure a Profile row exists (creates one on first Google sign-in).
      await getCurrentProfile(searchParams.get("role") === "OWNER" ? "OWNER" : undefined);
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  return NextResponse.redirect(new URL("/login?error=oauth", origin));
}
