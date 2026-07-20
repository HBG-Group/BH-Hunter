"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";

export interface AuthFormState {
  error?: string;
  notice?: string;
}

// Sign in an existing owner, then send them to the dashboard (or the page they wanted).
export async function signInAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  // Make sure a Profile row exists, then send them somewhere sensible for their role.
  const profile = await getCurrentProfile();
  if (next) redirect(next);
  if (profile?.role === "ADMIN") redirect("/admin");
  redirect(profile?.role === "OWNER" ? "/owner" : "/account");
}

// Register a new owner. Role is stored in user metadata so the profile is created
// with the OWNER role on first access.
export async function signUpAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const fullName = String(formData.get("fullName") ?? "");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  // Owners sign up from the "list your property" flow; everyone else is a student.
  // Any email is accepted — incoming freshmen may not have a VSU email yet.
  const role = formData.get("role") === "OWNER" ? "OWNER" : "STUDENT";

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, role } },
  });
  if (error) return { error: error.message };

  // If email confirmation is on, there is no session yet — tell them to check email.
  if (!data.session) {
    return { notice: "Check your email to confirm your account, then sign in." };
  }

  await getCurrentProfile();
  redirect(role === "OWNER" ? "/owner" : "/account");
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
