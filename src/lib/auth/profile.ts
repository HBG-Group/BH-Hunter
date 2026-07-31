import { redirect } from "next/navigation";
import type { Profile } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeRedirectPath } from "@/lib/security/redirect";

// The Supabase auth user for this request, or null if signed out.
export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// Our own Profile row for the signed-in user. Created on first access so a Supabase
// account always has a matching profile without needing a database trigger.
export async function getCurrentProfile(roleHint?: "OWNER" | "STUDENT"): Promise<Profile | null> {
  const result = await ensureProfileForCurrentUser(roleHint);
  return result?.profile ?? null;
}

// Like getCurrentProfile, but reports whether the row was created just now — the signal
// the OAuth callback uses to send genuinely first-time users through onboarding. Dedupes
// by id then email, so the same person signing in a second way never gets a duplicate.
export async function ensureProfileForCurrentUser(
  roleHint?: "OWNER" | "STUDENT",
): Promise<{ profile: Profile; created: boolean } | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const existing = await prisma.profile.findUnique({ where: { id: user.id } });
  if (existing) return { profile: existing, created: false };

  // The same email may already have a profile from a different sign-in method
  // (e.g. email/password first, then Google). Reuse it — it's the same person.
  if (user.email) {
    const byEmail = await prisma.profile.findUnique({ where: { email: user.email } });
    if (byEmail) return { profile: byEmail, created: false };
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
}

// Shown to a frozen owner across the dashboard and returned from blocked write actions.
export const FROZEN_OWNER_MESSAGE =
  "Your account is temporarily frozen. Please contact the administrator to restore access.";

// Use at the top of owner-only pages/actions. Redirects if not a signed-in owner.
export async function requireOwner(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "OWNER") redirect("/");
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
  if (profile.role !== "ADMIN") redirect("/");
  return profile;
}

// The signed-in admin, or null. Used by the /admin area to show its own login form
// in place of the dashboard instead of redirecting away.
export async function getAdminOrNull(): Promise<Profile | null> {
  const profile = await getCurrentProfile();
  return profile?.role === "ADMIN" ? profile : null;
}
