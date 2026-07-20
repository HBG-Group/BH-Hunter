import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { safeRedirectPath } from "@/lib/security/redirect";

// Google sends the user back here with a code. We exchange it for a session (stored
// in cookies) and then send them on to where they came from.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");

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
