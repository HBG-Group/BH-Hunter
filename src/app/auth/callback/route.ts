import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureProfileForCurrentUser } from "@/lib/auth/profile";
import { safeRedirectPath } from "@/lib/security/redirect";
import { resolveSiteOrigin } from "@/lib/auth/site-origin";
import { prisma } from "@/lib/db/prisma";
import { cookies } from "next/headers";
import {
  TERMS_CONSENT_COOKIE,
  TERMS_VERSION,
  verifyTermsConsentValue,
} from "@/lib/security/terms-consent";
import { verifyStaffPasswordRecoveryProof } from "@/lib/security/staff-password-recovery";

// Google (and the confirmation email) send the user back here with a code. We exchange
// it for a session and send them back to the origin that initiated the OAuth flow.
// This preserves standalone/PWA behavior when the app is opened on another
// allow-listed deployment origin.
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const origin = await resolveSiteOrigin();

  // Older/custom Supabase email templates may still point confirmation links at
  // this callback with a token_hash. Send them through the dedicated confirmation
  // verifier so they receive the same success page as new links.
  if (!code && tokenHash) {
    const confirmation = new URL("/auth/confirmed", origin);
    confirmation.searchParams.set("token_hash", tokenHash);
    const type = searchParams.get("type");
    if (type) confirmation.searchParams.set("type", type);
    return NextResponse.redirect(confirmation);
  }

  // Validate redirect — never concatenate a raw query parameter onto the origin.
  const next = safeRedirectPath(searchParams.get("next"), "/");

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      const existingProfile = user
        ? await prisma.profile.findUnique({ where: { id: user.id } })
        : null;
      const cookieStore = await cookies();
      const acceptedAt = verifyTermsConsentValue(
        cookieStore.get(TERMS_CONSENT_COOKIE)?.value,
      );
      // A signed recovery proof is issued only when the staff recovery form sends
      // the reset email. Recovery grants access to the isolated password page, not
      // the admin dashboard, so a stale terms version must not force Google login.
      const isStaffPasswordRecovery =
        next === "/staff/password" &&
        existingProfile?.role === "ADMIN" &&
        verifyStaffPasswordRecoveryProof(searchParams.get("recovery"));
      const needsConsent = !existingProfile || existingProfile.termsVersion !== TERMS_VERSION;
      if (needsConsent && acceptedAt === null && !isStaffPasswordRecovery) {
        await supabase.auth.signOut();
        const consentPath = existingProfile
          ? `/terms/accept?next=${encodeURIComponent(next)}`
          : searchParams.get("role") === "OWNER"
            ? "/list-your-property?error=terms"
            : "/signup?error=terms";
        return NextResponse.redirect(new URL(consentPath, origin));
      }

      // Make sure a Profile row exists (creates one on first Google sign-in).
      const result = await ensureProfileForCurrentUser(
        searchParams.get("role") === "OWNER" ? "OWNER" : undefined,
      );
      if (result && "conflict" in result && result.conflict) {
        // Do not leave a newly authenticated provider session attached to an
        // existing account's Profile. The user must sign in with the original
        // provider or complete explicit identity linking first.
        await supabase.auth.signOut();
        return NextResponse.redirect(new URL("/login?error=identity-conflict", origin));
      }
      if (result && "profile" in result && acceptedAt !== null) {
        await prisma.profile.update({
          where: { id: result.profile.id },
          data: { termsAcceptedAt: new Date(acceptedAt), termsVersion: TERMS_VERSION },
        });
      }
      cookieStore.delete(TERMS_CONSENT_COOKIE);
      // First-time users set a display name before entering the app; existing users
      // (created === false) skip onboarding entirely and go straight to `next`.
      if (result && "profile" in result && result.created) {
        const onboarding = new URL("/onboarding", origin);
        onboarding.searchParams.set("next", next);
        return NextResponse.redirect(onboarding);
      }
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  return NextResponse.redirect(new URL("/login?error=oauth", origin));
}
