"use server";

import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/profile";
import { logSecurityEvent } from "@/lib/security/events";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { ADMIN_GOOGLE_SESSION_COOKIE } from "@/lib/security/admin-google-session";

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  const profile = await getCurrentProfile();
  await supabase.auth.signOut();
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_GOOGLE_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: 0,
  });
  await logSecurityEvent({
    action: "auth.signout",
    outcome: "allowed",
    actorId: profile?.id,
    actorRole: profile?.role,
  });
  redirect("/");
}
