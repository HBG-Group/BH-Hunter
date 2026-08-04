import { NextResponse, type NextRequest } from "next/server";
import { resolveSiteOrigin } from "@/lib/auth/site-origin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Supabase confirmation links may use either a PKCE code or a token_hash,
// depending on the email template and project configuration. Handle both and
// always show a clear confirmation result instead of dropping users on login.
export async function GET(request: NextRequest) {
  const origin = await resolveSiteOrigin();
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const supabase = await createSupabaseServerClient();

  let error: unknown = null;
  if (code) {
    ({ error } = await supabase.auth.exchangeCodeForSession(code));
  } else if (tokenHash && (type === "signup" || type === "email")) {
    ({ error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    }));
  } else {
    error = new Error("Missing confirmation token");
  }

  if (error) {
    return NextResponse.redirect(new URL("/login?error=confirmation", origin));
  }

  // Confirmation is deliberately not a silent sign-in. The user sees a success
  // page and then starts a normal login, which makes the account transition clear.
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/auth/confirmed/success", origin));
}
