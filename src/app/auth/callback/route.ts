import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { isAdminHost } from "@/config/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureProfileForCurrentUser } from "@/lib/auth/profile";
import { safeRedirectPath } from "@/lib/security/redirect";
import { resolveSiteOrigin } from "@/lib/auth/site-origin";
import { prisma } from "@/lib/db/prisma";
import { logSecurityEvent } from "@/lib/security/events";
import { hasGoogleAdminAccess } from "@/lib/auth/authorization-core";
import {
  ADMIN_GOOGLE_SESSION_COOKIE,
  createAdminGoogleSessionProof,
} from "@/lib/security/admin-google-session";
import {
  TERMS_CONSENT_COOKIE,
  TERMS_VERSION,
  verifyTermsConsentValue,
} from "@/lib/security/terms-consent";

// Google and email confirmation links return here with a code. Admin-host callbacks
// stay on that host so the Supabase session cookie is scoped to the control domain.
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const adminHost = isAdminHost(request.headers.get("host"));
  const origin = adminHost
    ? request.nextUrl.origin
    : await resolveSiteOrigin();

  // Email-based auth is not an admin sign-in method. Admin access must come from a
  // Google OAuth exchange initiated on the control host.
  if (adminHost && (!code || searchParams.has("type"))) {
    return NextResponse.redirect(new URL("/admin?error=oauth", origin));
  }

  // Older public email templates may still send token_hash links to this callback.
  if (!adminHost && !code && tokenHash) {
    const confirmation = new URL("/auth/confirmed", origin);
    confirmation.searchParams.set("token_hash", tokenHash);
    const type = searchParams.get("type");
    if (type) confirmation.searchParams.set("type", type);
    return NextResponse.redirect(confirmation);
  }

  // Admin redirects are fixed to /admin. Public redirects are validated so a query
  // parameter can never send a signed-in user to an external site.
  const next = adminHost
    ? "/admin"
    : safeRedirectPath(searchParams.get("next"), "/");

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const cookieStore = await cookies();
      const acceptedAt = verifyTermsConsentValue(
        cookieStore.get(TERMS_CONSENT_COOKIE)?.value,
      );

      if (adminHost) {
        // Never provision an admin profile from OAuth. The exact Supabase user must
        // already have a database Profile with ADMIN role and a linked Google identity.
        const adminProfile = user
          ? await prisma.profile.findUnique({ where: { id: user.id } })
          : null;
        const googleProviders = user?.identities?.map(
          (identity) => identity.provider,
        );
        if (
          !adminProfile ||
          !hasGoogleAdminAccess(adminProfile.role, googleProviders)
        ) {
          cookieStore.set(ADMIN_GOOGLE_SESSION_COOKIE, "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/admin",
            maxAge: 0,
          });
          await supabase.auth.signOut();
          await logSecurityEvent({
            action: "auth.admin_google_signin",
            outcome: "denied",
            actorId: user?.id,
            actorRole: adminProfile?.role,
            detail: "profile_not_admin_or_google_identity_missing",
          });
          return NextResponse.redirect(
            new URL("/admin?error=not-admin", origin),
          );
        }

        if (
          adminProfile.termsVersion !== TERMS_VERSION &&
          acceptedAt === null
        ) {
          cookieStore.set(ADMIN_GOOGLE_SESSION_COOKIE, "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/admin",
            maxAge: 0,
          });
          await supabase.auth.signOut();
          return NextResponse.redirect(
            new URL(
              `/terms/accept?next=${encodeURIComponent("/admin")}`,
              origin,
            ),
          );
        }

        if (acceptedAt !== null) {
          await prisma.profile.update({
            where: { id: adminProfile.id },
            data: {
              termsAcceptedAt: new Date(acceptedAt),
              termsVersion: TERMS_VERSION,
            },
          });
        }
        cookieStore.delete(TERMS_CONSENT_COOKIE);
        cookieStore.set(
          ADMIN_GOOGLE_SESSION_COOKIE,
          createAdminGoogleSessionProof(adminProfile.id),
          {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/admin",
            maxAge: 7 * 24 * 60 * 60,
          },
        );
        await logSecurityEvent({
          action: "auth.admin_google_signin",
          outcome: "allowed",
          actorId: adminProfile.id,
          actorRole: adminProfile.role,
        });
        return NextResponse.redirect(new URL("/admin", origin));
      }

      const existingProfile = user
        ? await prisma.profile.findUnique({ where: { id: user.id } })
        : null;
      const needsConsent =
        !existingProfile || existingProfile.termsVersion !== TERMS_VERSION;
      if (needsConsent && acceptedAt === null) {
        await supabase.auth.signOut();
        const consentPath = existingProfile
          ? `/terms/accept?next=${encodeURIComponent(next)}`
          : searchParams.get("role") === "OWNER"
            ? "/list-your-property?error=terms"
            : "/signup?error=terms";
        return NextResponse.redirect(new URL(consentPath, origin));
      }

      // Make sure a public Profile row exists (creates one on first Google sign-in).
      const result = await ensureProfileForCurrentUser(
        searchParams.get("role") === "OWNER" ? "OWNER" : undefined,
      );
      if (result && "conflict" in result && result.conflict) {
        await supabase.auth.signOut();
        return NextResponse.redirect(
          new URL("/login?error=identity-conflict", origin),
        );
      }
      if (result && "profile" in result && acceptedAt !== null) {
        await prisma.profile.update({
          where: { id: result.profile.id },
          data: {
            termsAcceptedAt: new Date(acceptedAt),
            termsVersion: TERMS_VERSION,
          },
        });
      }
      cookieStore.delete(TERMS_CONSENT_COOKIE);
      // First-time users set a display name before entering the app; returning users
      // skip onboarding and go straight to the validated destination.
      if (result && "profile" in result && result.created) {
        const onboarding = new URL("/onboarding", origin);
        onboarding.searchParams.set("next", next);
        return NextResponse.redirect(onboarding);
      }
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  return NextResponse.redirect(
    new URL(adminHost ? "/admin?error=oauth" : "/login?error=oauth", origin),
  );
}
