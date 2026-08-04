import { cache } from "react";
import { redirect } from "next/navigation";
import type { Profile } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { safeRedirectPath } from "@/lib/security/redirect";
import { hasRole } from "@/lib/auth/authorization-core";
import { resilientRead } from "@/lib/async/resilient-read";

// The Supabase auth user for this request, or null if signed out. `cache()` dedupes
// this within a single request — SiteHeader and the page it wraps both call the auth
// chain, and without this every page paid for the Supabase round trip twice.
export const getCurrentUser = cache(async () => {
  return resilientRead(async () => {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  }, { timeoutMessage: "Authentication lookup exceeded five seconds" });
});

// Our own Profile row for the signed-in user. Created on first access so a Supabase
// account always has a matching profile without needing a database trigger.
export async function getCurrentProfile(roleHint?: "OWNER" | "STUDENT"): Promise<Profile | null> {
  const result = await ensureProfileForCurrentUser(roleHint);
  return result && "profile" in result ? result.profile : null;
}

// Like getCurrentProfile, but reports whether the row was created just now — the signal
// the OAuth callback uses to send genuinely first-time users through onboarding. It
// only resolves an existing profile by the authenticated Supabase user ID.
// Cached per request+roleHint so repeated calls (page + header + nested components)
// share one lookup instead of re-querying Supabase Auth and Prisma each time.
export const ensureProfileForCurrentUser = cache(async (
  roleHint?: "OWNER" | "STUDENT",
): Promise<{ profile: Profile; created: boolean } | { conflict: true } | null> => {
  const user = await getCurrentUser();
  if (!user) return null;

  const existing = await resilientRead(() => prisma.profile.findUnique({ where: { id: user.id } }));
  if (existing) return { profile: existing, created: false };

  // A matching email does not prove that two provider identities are linked. Block the
  // new subject and require explicit Supabase identity linking instead of sharing data.
  if (user.email) {
    const byEmail = await resilientRead(() => prisma.profile.findUnique({ where: { email: user.email } }));
    if (byEmail && byEmail.id !== user.id) {
      // Supabase can retain a Profile row when an email-password auth user is
      // recreated. Email/password is proof of control of the address, so keep the
      // existing logical Meino profile for that flow. A Google (or other OAuth)
      // identity must still be explicitly linked and is rejected as a conflict.
      const provider =
        (user.app_metadata?.provider as string | undefined) ??
        user.identities?.[0]?.provider;
      if (provider === "email") return { profile: byEmail, created: false };
      return { conflict: true };
    }
  }

  // Metadata differs between email sign-up and Google (name / avatar live here).
  const metadata = user.user_metadata ?? {};
  const fullName =
    (metadata.full_name as string | undefined) ?? (metadata.name as string | undefined) ?? "New user";
  const avatarUrl =
    (metadata.avatar_url as string | undefined) ?? (metadata.picture as string | undefined) ?? null;
  // Email sign-up carries the role in metadata; Google sign-up passes it as a hint
  // from whichever sign-up page the user started on.
  const role = metadata.role === "OWNER" || roleHint === "OWNER" ? "OWNER" : "STUDENT";

  const profile = await prisma.profile.create({
    data: {
      id: user.id,
      email: user.email ?? `${user.id}@meino.local`,
      fullName,
      avatarUrl,
      role,
    },
  });
  return { profile, created: true };
});

// Used only after a failed password login. If the email belongs to an existing
// Profile whose Supabase identity is OAuth-backed, the user should be told to use
// that provider instead of being misled by a generic password error. Missing
// service-role configuration or lookup failures intentionally fall back to false.
export async function hasNonEmailIdentity(email: string): Promise<boolean> {
  try {
    const profile = await resilientRead(() =>
      prisma.profile.findUnique({ where: { email }, select: { id: true } }),
    );
    if (!profile) return false;

    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.auth.admin.getUserById(profile.id);
    if (error || !data.user) return false;
    const providers = data.user.identities?.map((identity) => identity.provider) ?? [];
    return providers.some((provider) => provider !== "email");
  } catch {
    return false;
  }
}

// Shown to a frozen owner across the dashboard and returned from blocked write actions.
export const FROZEN_OWNER_MESSAGE =
  "Your account is temporarily frozen. Please contact the administrator to restore access.";

// Use at the top of owner-only pages/actions. Redirects if not a signed-in owner.
export async function requireOwner(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!hasRole(profile.role, "OWNER")) redirect("/");
  return profile;
}

// For owner WRITE actions: a frozen owner is bounced to the dashboard, which shows the
// frozen notice, so no management action can run. Read-only owner pages use requireOwner.
export async function requireWritableOwner(): Promise<Profile> {
  const owner = await requireOwner();
  if (owner.frozen) redirect("/owner");
  return owner;
}

// For anything that just needs a signed-in account (favorites, reviews, viewings).
export async function requireProfile(next?: string): Promise<Profile> {
  const profile = await getCurrentProfile();
  // Validate redirect before echoing it back into the login URL.
  if (!profile) {
    const target = next ? safeRedirectPath(next, "") : "";
    redirect(target ? `/login?next=${encodeURIComponent(target)}` : "/login");
  }
  return profile;
}

// Admin-only pages/actions. Admins are promoted manually (see scripts/make-admin.ts).
export async function requireAdmin(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!hasRole(profile.role, "ADMIN")) redirect("/");
  return profile;
}

// The signed-in admin, or null. Used by the /admin area to show its own login form
// in place of the dashboard instead of redirecting away.
export async function getAdminOrNull(): Promise<Profile | null> {
  const profile = await getCurrentProfile();
  return profile && hasRole(profile.role, "ADMIN") ? profile : null;
}
