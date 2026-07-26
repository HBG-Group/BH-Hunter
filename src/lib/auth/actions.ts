"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { safeRedirectPath } from "@/lib/security/redirect";
import { allow, LIMITS, RATE_LIMITED } from "@/lib/security/rate-limit";
import { credentialsSchema, signUpSchema } from "@/lib/validation/auth";
import { resolveSiteOrigin } from "@/lib/auth/site-origin";
import { OAUTH_CALLBACK_PATH } from "@/config/auth";

export interface AuthFormState {
  error?: string;
  notice?: string;
}

// Sign in an existing owner, then send them to the dashboard (or the page they wanted).
export async function signInAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!(await allow("signin", LIMITS.auth))) return { error: RATE_LIMITED };

  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check your details" };

  // Validate redirect before it is ever used.
  const next = safeRedirectPath(formData.get("next") as string | null, "");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  // Deliberately generic: don't reveal whether the email exists.
  if (error) return { error: "Incorrect email or password." };

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
  if (!(await allow("signup", LIMITS.auth))) return { error: RATE_LIMITED };

  // Owners sign up from the "list your property" flow; everyone else is a student.
  // Any email is accepted — incoming freshmen may not have a VSU email yet.
  const parsed = signUpSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role") === "OWNER" ? "OWNER" : "STUDENT",
    terms: formData.get("terms"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check your details" };
  const { fullName, email, password, role } = parsed.data;

  // Confirmation link must return to the canonical site, not localhost.
  const origin = await resolveSiteOrigin();
  const emailRedirectTo = `${origin}${OAUTH_CALLBACK_PATH}?next=${role === "OWNER" ? "/owner" : "/account"}`;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, role }, emailRedirectTo },
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
