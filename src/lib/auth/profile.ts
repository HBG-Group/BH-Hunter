import { redirect } from "next/navigation";
import type { Profile } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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
export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const existing = await prisma.profile.findUnique({ where: { id: user.id } });
  if (existing) return existing;

  // The same email may already have a profile from a different sign-in method
  // (e.g. email/password first, then Google). Reuse it — it's the same person.
  if (user.email) {
    const byEmail = await prisma.profile.findUnique({ where: { email: user.email } });
    if (byEmail) return byEmail;
  }

  // Metadata differs between email sign-up and Google (name / avatar live here).
  const metadata = user.user_metadata ?? {};
  const fullName =
    (metadata.full_name as string | undefined) ?? (metadata.name as string | undefined) ?? "New user";
  const avatarUrl =
    (metadata.avatar_url as string | undefined) ?? (metadata.picture as string | undefined) ?? null;
  const role = metadata.role === "OWNER" ? "OWNER" : "STUDENT";

  return prisma.profile.create({
    data: {
      id: user.id,
      email: user.email ?? `${user.id}@bhhunter.local`,
      fullName,
      avatarUrl,
      role,
    },
  });
}

// Use at the top of owner-only pages/actions. Redirects if not a signed-in owner.
export async function requireOwner(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "OWNER") redirect("/");
  return profile;
}

// For anything that just needs a signed-in account (favorites, reviews, viewings).
export async function requireProfile(next?: string): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  return profile;
}

// Admin-only pages/actions. Admins are promoted manually (see scripts/make-admin.ts).
export async function requireAdmin(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "ADMIN") redirect("/");
  return profile;
}
